import { select } from "@clack/prompts";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import color from "picocolors";
import {
    getRunCommand,
    installPackages,
    PackageManager,
    runDlxCommand,
    runInProject,
} from "./utils";
import { SpinnerType } from "./types";

export async function setupDatabaseAdapter(
    s: SpinnerType,
    packageManager: PackageManager,
    projectDir: string
) {
    s.message("Step 3: ");

    const db = await select({
        message: "Choose database adapter:",
        options: [
            { value: "prisma", label: "Prisma + SQLite" },
            { value: "drizzle", label: "Drizzle + SQLite" },
            { value: "skip", label: "Skip database setup" },
        ],
    });

    if (db === "skip" || db === null) {
        s.message(color.yellow("⚠️ Skipping database setup"));
        return;
    }

    if (db === "prisma") {
        s.message(color.cyan("🛢️ Setting up Prisma..."));

        installPackages(packageManager, ["@prisma/client"], projectDir);
        installPackages(packageManager, ["prisma"], projectDir, true);

        s.message("prisma and @prisma/client installed.");

        // Init Prisma
        runInProject(
            getRunCommand(
                packageManager,
                "prisma init --datasource-provider sqlite"
            ),
            projectDir
        );

        s.message("Prisma initialized.");

        // Copy local schema + client
        copyAdapterTemplateFiles(s, projectDir, "prisma");

        // Generate client
        runDlxCommand(packageManager, "prisma generate", projectDir);

        s.message("Prisma client generated.");

        s.message(color.green("✔ Prisma (SQLite) is ready!"));

        return "prisma";
    } else if (db === "drizzle") {
        s.message(color.cyan("🌪️ Setting up Drizzle..."));

        installPackages(
            packageManager,
            ["drizzle-orm", "better-sqlite3"],
            projectDir
        );
        installPackages(packageManager, ["drizzle-kit"], projectDir, true);

        s.message("drizzle-orm, better-sqlite3 and drizzle-kit installed.");

        // Copy files
        copyAdapterTemplateFiles(s, projectDir, "drizzle");

        s.message(color.green("✔ Drizzle (SQLite) is ready!"));
        s.message(
            color.yellow("ℹ️ Run: ") +
                getRunCommand(packageManager, "drizzle-kit generate")
        );

        return "drizzle";
    }
}

export function copyAdapterTemplateFiles(
    s: SpinnerType,
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    s.message(`Going to copy ${adapter} files`);
    s.message("Preparing files destinaion...");

    const hasSrc = existsSync(path.join(projectDir, "src"));
    const basePath = hasSrc ? path.join(projectDir, "src") : projectDir;
    const libDir = path.join(basePath, "lib");
    if (!existsSync(libDir)) mkdirSync(libDir, { recursive: true });

    const files: { src: string; dest: string }[] = [];

    if (adapter === "prisma") {
        files.push(
            {
                src: path.join(__dirname, "../templates/src/lib/prisma.ts"),
                dest: path.join(libDir, "prisma.ts"),
            },
            {
                src: path.join(__dirname, "../templates/prisma/schema.prisma"),
                dest: path.join(projectDir, "prisma/schema.prisma"),
            }
        );
    } else if (adapter === "drizzle") {
        files.push(
            {
                src: path.join(__dirname, "../templates/src/lib/drizzle.ts"),
                dest: path.join(libDir, "drizzle.ts"),
            },
            {
                src: path.join(__dirname, "../templates/drizzle/config.ts"),
                dest: path.join(projectDir, "drizzle/config.ts"),
            }
        );
    }

    s.message("✔ Destination Prepared");

    files.forEach(({ src, dest }) => {
        // Ensure parent directories exist
        const parentDir = path.dirname(dest);
        if (!existsSync(parentDir)) mkdirSync(parentDir, { recursive: true });

        copyFileSync(src, dest);
        s.message(`Copied to ${dest}`);
    });

    s.message("✔ Copying finished");
}
