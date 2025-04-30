import { select } from "@clack/prompts";
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import color from "picocolors";
import { getInstallCommand, getRunCommand, PackageManager } from "./utils";

export async function setupDatabaseAdapter(
    packageManager: PackageManager,
    projectDir: string
) {
    const db = await select({
        message: "Choose database adapter:",
        options: [
            { value: "prisma", label: "Prisma + SQLite" },
            { value: "drizzle", label: "Drizzle + SQLite" },
            { value: "skip", label: "Skip database setup" },
        ],
    });

    if (db === "skip" || db === null) {
        console.log(color.yellow("⚠️ Skipping database setup"));
        return;
    }

    const run = (cmd: string) =>
        execSync(cmd, { cwd: projectDir, stdio: "inherit" });
    const install = (deps: string[], dev = false) =>
        run(getInstallCommand(packageManager, deps, dev));

    if (db === "prisma") {
        console.log(color.cyan("🛢️ Setting up Prisma..."));

        install(["@prisma/client"]);
        install(["prisma"], true);

        // Init Prisma
        run(
            getRunCommand(
                packageManager,
                "prisma init --datasource-provider sqlite"
            )
        );

        // Copy local schema + client
        copyAdapterTemplateFiles(projectDir, "prisma");

        // Generate client
        run(getRunCommand(packageManager, "prisma generate"));

        console.log(color.green("✅ Prisma (SQLite) is ready!"));

        return "prisma";
    } else if (db === "drizzle") {
        console.log(color.cyan("🌪️ Setting up Drizzle..."));

        install(["drizzle-orm", "better-sqlite3"]);
        install(["drizzle-kit"], true);

        // Copy files
        copyAdapterTemplateFiles(projectDir, "drizzle");

        console.log(color.green("✅ Drizzle (SQLite) is ready!"));
        console.log(
            color.yellow("ℹ️ Run: ") +
                getRunCommand(packageManager, "drizzle-kit generate")
        );

        return "drizzle";
    }
}

export function copyAdapterTemplateFiles(
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    const hasSrc = existsSync(path.join(projectDir, "src"));

    const basePath = hasSrc ? path.join(projectDir, "src") : projectDir;
    const libDir = path.join(basePath, "lib");

    if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

    const files: { src: string; dest: string }[] = [];

    if (adapter === "prisma") {
        files.push(
            {
                src: path.join(__dirname, "lib/prisma.ts"),
                dest: path.join(libDir, "prisma.ts"),
            },
            {
                src: path.join(__dirname, "../prisma/schema.prisma"),
                dest: path.join(projectDir, "prisma/schema.prisma"),
            }
        );
    } else if (adapter === "drizzle") {
        files.push(
            {
                src: path.join(__dirname, "lib/drizzle.ts"),
                dest: path.join(libDir, "drizzle.ts"),
            },
            {
                src: path.join(__dirname, "../drizzle/config.ts"),
                dest: path.join(projectDir, "drizzle/config.ts"),
            }
        );
    }

    files.forEach(({ src, dest }) => {
        // Ensure parent directories exist
        const parentDir = path.dirname(dest);
        if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });

        copyFileSync(src, dest);
        console.log(`✅ Copied to ${dest}`);
    });
}
