#!/usr/bin/env node

import { intro, outro, select, spinner, text } from "@clack/prompts";
import { existsSync } from "fs";
import color from "picocolors";
import { setupShadcn } from "./shadcn";
import { setupDatabaseAdapter } from "./adapter";
import { getCreateNextCommand, PackageManager, runInProject } from "./utils";
import { setupSeeding } from "./seeding";
import { setupBetterAuth } from "./better-auth";

async function main() {
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
    const appPath = await text({
        message: "Where do you want to create your project?",
        placeholder: "my-next-app",
        validate: (value) => {
            if (!value || !/^[a-zA-Z0-9/_-]+$/.test(value)) {
                return "Please enter a valid path (alphanumeric, /, -, _ allowed)";
            }
            if (existsSync(value)) {
                return "A folder with this path already exists";
            }
        },
    });

    const createCommand = getCreateNextCommand(
        packageManager as PackageManager,
        appPath as string
    );

    s.message(
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
    await setupShadcn(s, packageManager as PackageManager, appPath as string);

    // Adapter setup
    const adapter = await setupDatabaseAdapter(
        s,
        packageManager as PackageManager,
        appPath as string
    );

    if (adapter) {
        // Database Seeding script setup
        await setupSeeding(
            s,
            packageManager as PackageManager,
            appPath as string,
            adapter
        );

        // Better-Auth setup
        await setupBetterAuth(
            s,
            packageManager as PackageManager,
            appPath as string,
            adapter
        );
    }

    s.stop();

    outro(
        `${color.green("🎉 All done!")} You can now \`cd ${String(
            appPath
        )}\` to start working 🚀`
    );
}

main().catch(console.error);
