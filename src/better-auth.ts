import path from "path";
import { existsSync, mkdirSync, appendFileSync, copyFileSync } from "fs";
import { confirm } from "@clack/prompts";
import crypto from "crypto";
import { editPackageJsonScript, getDlxCommand, installPackages } from "./utils";
import { SpinnerType } from "./types";

export async function setupBetterAuth(
    s: SpinnerType,
    pkgManager: "pnpm" | "npm" | "bun",
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    s.message("Step 5: ");

    if (!["prisma", "drizzle"].includes(adapter)) return;

    const enableAuth = await confirm({
        message: "Enable Better-Auth?",
        initialValue: false,
    });

    if (!enableAuth) {
        s.message("⚠️ Skipping authentication setup.");
        return;
    }

    s.message("🛡️ Configuring Better-Auth...");

    // Step 1: Install better-auth
    installPackages(pkgManager, ["better-auth"], projectDir);

    s.message("better-auth installed.");

    s.message("Adding .env variables...");

    // Step 2: Append to .env
    const envPath = path.join(projectDir, ".env");
    const secret = crypto.randomBytes(32).toString("hex");

    const envLines = [
        "",
        "# Better-Auth",
        `BETTER_AUTH_SECRET=${secret}`,
        "BETTER_AUTH_URL=http://localhost:3000",
    ];
    appendFileSync(envPath, envLines.join("\n"));

    s.message("✔ .env variables added.");

    // Step 3: Determine src structure
    const hasSrcDir = existsSync(path.join(projectDir, "src"));
    const basePath = hasSrcDir ? path.join(projectDir, "src") : projectDir;

    // Step 4: Copy templates
    copyBetterAuthFiles(s, basePath, adapter);

    // Step 5: Add CLI script

    s.message("Adding auth client generater cli...");
    const cliCmd = getDlxCommand(pkgManager, "@better-auth/cli generate");
    await editPackageJsonScript(projectDir, "auth:gen", cliCmd);

    s.message(`✔ Better-Auth configured! Run: ${pkgManager} run auth:gen`);
}

export function copyBetterAuthFiles(
    s: SpinnerType,
    basePath: string,
    adapter: "prisma" | "drizzle"
) {
    s.message(`Going to copy better-auth files`);
    s.message("Preparing files destinaion...");

    const apiAuthDir = path.join(basePath, "app/api/auth/[...all]");
    const libDir = path.join(basePath, "lib");

    if (!existsSync(apiAuthDir)) mkdirSync(apiAuthDir, { recursive: true });
    if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

    const files =
        adapter === "prisma"
            ? [
                  {
                      src: path.join(
                          __dirname,
                          "../templates/src/lib/auth-prisma.ts"
                      ),
                      dest: path.join(libDir, "auth.ts"),
                  },
              ]
            : [
                  {
                      src: path.join(
                          __dirname,
                          "../templates/src/lib/auth-drizzle.ts"
                      ),
                      dest: path.join(libDir, "auth.ts"),
                  },
              ];

    files.push(
        {
            src: path.join(__dirname, "../templates/src/app/api/route.ts"),
            dest: path.join(apiAuthDir, "route.ts"),
        },
        {
            src: path.join(__dirname, "../templates/src/lib/auth-client.ts"),
            dest: path.join(libDir, "auth-client.ts"),
        }
    );

    s.message("✔ Destination Prepared");

    files.forEach(({ src, dest }) => {
        copyFileSync(src, dest);
        s.message(`Copied to ${dest}`);
    });

    s.message("✔ Copying finished");
}
