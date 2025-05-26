#!/usr/bin/env node

import { intro, outro, select, spinner, confirm } from "@clack/prompts";
import color from "picocolors";
import { setupShadcn } from "./shadcn";
import { setupDatabaseAdapter } from "./adapter";
import { getCreateNextCommand, PackageManager, runInProject } from "./utils";
import { setupSeeding } from "./seeding";
import { setupBetterAuth } from "./better-auth";

async function main() {
    const appPath = "my-next-app";

    intro(`${color.cyan("⚡ Next.js Setup Wizard")}`);

    const s = spinner();

    s.start("Step 1: ");
    const packageManager = await select({
        message: "Which package manager do you want to use?",
        options: [
            { value: "pnpm", label: "pnpm" },
            { value: "npm", label: "npm" },
            { value: "bun", label: "bun" },
        ],
    });

    s.message("Step 2: ");
    const shouldSetup = await confirm({
        message: "Would you like to set up shadcn/ui?",
    });
    if (!shouldSetup) {
        s.message("⚠️ Skipping shadcn/ui setup.");
    }

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
    }

    let shouldSeed: boolean | symbol = false;
    s.message("Step 4: ");
    if (["prisma", "drizzle"].includes(db as string)) {
        shouldSeed = await confirm({
            message: "Add database seeding script?",
            initialValue: true,
        });
    } else if (!shouldSeed) {
        s.message("⚠️ Skipping seeding setup.");
    }

    let enableAuth: boolean | symbol = false;
    s.message("Step 5: ");
    if (["prisma", "drizzle"].includes(db as string)) {
        enableAuth = await confirm({
            message: "Enable Better-Auth?",
            initialValue: true,
        });
    } else if (!enableAuth) {
        s.message("⚠️ Skipping authentication setup.");
    }

    const createCommand = getCreateNextCommand(
        packageManager as PackageManager,
        appPath as string
    );

    s.stop(
        `Creating Next.js app at "${String(appPath)}" using ${String(
            packageManager
        )}...`
    );

    try {
        runInProject(createCommand, process.cwd());
        s.message("✔ Next.js app created successfully!");
    } catch (err) {
        s.stop("❌ Failed to create Next.js app.");
        console.error(err);
        process.exit(1);
    }

    // Shadcn setup
    if (shouldSetup) {
        await setupShadcn(packageManager as PackageManager, appPath as string);
    }

    // Adapter setup
    const adapter = await setupDatabaseAdapter(
        db as "prisma" | "drizzle",
        packageManager as PackageManager,
        appPath as string
    );

    if (adapter) {
        // Database Seeding script setup
        await setupSeeding(
            packageManager as PackageManager,
            appPath as string,
            adapter
        );

        // Better-Auth setup
        await setupBetterAuth(
            packageManager as PackageManager,
            appPath as string,
            adapter
        );
    }

    outro(
        `${color.green("🎉 All done!")} You can now \`cd ${String(
            appPath
        )}\` to start working 🚀`
    );
}

main().catch(console.error);
