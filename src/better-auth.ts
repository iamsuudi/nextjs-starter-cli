import path from "path";
import { existsSync, mkdirSync, appendFileSync, copyFileSync } from "fs";
import { confirm, spinner } from "@clack/prompts";
import crypto from "crypto";
import { editPackageJsonScript, getDlxCommand, installPackages } from "./utils";

export async function setupBetterAuth(
    pkgManager: "pnpm" | "npm" | "bun",
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    if (!["prisma", "drizzle"].includes(adapter)) return;

    const enableAuth = await confirm({
        message: "Enable Better-Auth?",
        initialValue: false,
    });

    if (!enableAuth) {
        console.log("⚠️ Skipping authentication setup.");
        return;
    }

    const s = spinner();
    s.start("🛡️ Configuring Better-Auth...");

    // Step 1: Install better-auth
    installPackages(pkgManager, ["better-auth"], projectDir);

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

    // Step 3: Determine src structure
    const hasSrcDir = existsSync(path.join(projectDir, "src"));
    const basePath = hasSrcDir ? path.join(projectDir, "src") : projectDir;

    const apiAuthDir = path.join(basePath, "app/api/auth/[...all]");
    const libDir = path.join(basePath, "lib");

    if (!existsSync(apiAuthDir)) mkdirSync(apiAuthDir, { recursive: true });
    if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

    // Step 4: Copy templates
    copyBetterAuthFiles(basePath, adapter);

    // Step 5: Add CLI script
    const cliCmd = getDlxCommand(pkgManager, "@better-auth/cli generate");
    await editPackageJsonScript(projectDir, "auth:gen", cliCmd);

    s.stop(`✅ Better-Auth configured! Run: ${pkgManager} run auth:gen`);
}

export function copyBetterAuthFiles(
    basePath: string,
    adapter: "prisma" | "drizzle"
) {
    const apiAuthDir = path.join(basePath, "app/api/auth/[...all]");
    const libDir = path.join(basePath, "lib");

    if (!existsSync(apiAuthDir)) mkdirSync(apiAuthDir, { recursive: true });
    if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

    const files =
        adapter === "prisma"
            ? [
                  {
                      src: path.join(__dirname, "lib/auth-prisma.ts"),
                      dest: path.join(libDir, "auth.ts"),
                  },
              ]
            : [
                  {
                      src: path.join(__dirname, "lib/auth-drizzle.ts"),
                      dest: path.join(libDir, "auth.ts"),
                  },
              ];

    files.push(
        {
            src: path.join(__dirname, "app/api/route.ts"),
            dest: path.join(apiAuthDir, "route.ts"),
        },
        {
            src: path.join(__dirname, "lib/auth-client.ts"),
            dest: path.join(libDir, "auth-client.ts"),
        }
    );

    files.forEach(({ src, dest }) => {
        copyFileSync(src, dest);
    });
}
