import path from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { confirm } from "@clack/prompts";
import { editPackageJson, getDlxCommand } from "./utils";
import { SpinnerType } from "./types";

export async function setupSeeding(
    s: SpinnerType,
    pkgManager: "pnpm" | "npm" | "bun",
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    s.message("Step 4: ");

    if (!["prisma", "drizzle"].includes(adapter)) return;

    const shouldSeed = await confirm({
        message: "Add database seeding script?",
        initialValue: false,
    });

    if (!shouldSeed) {
        s.message("⚠️ Skipping seeding setup.");
        return;
    }

    s.message("🌱 Setting up seeding script...");

    s.message(`Going to copy ${adapter} seeding files`);
    s.message("Preparing files destinaion...");

    const seedFileMap = {
        prisma: {
            src: path.join(__dirname, "../templates/prisma/seed.ts"),
            dest: path.join(projectDir, "prisma/seed.ts"),
        },
        drizzle: {
            src: path.join(__dirname, "../templates/drizzle/seed.ts"),
            dest: path.join(projectDir, "drizzle/seed.ts"),
        },
    };

    const { src, dest } = seedFileMap[adapter];

    // Ensure directory exists
    const seedDir = path.dirname(dest);
    if (!existsSync(seedDir)) mkdirSync(seedDir, { recursive: true });

    s.message("✔ Destination Prepared");

    try {
        copyFileSync(src, dest);

        const runCommand = getDlxCommand(
            pkgManager,
            `tsx ${path.relative(projectDir, dest)}`
        );
        await editPackageJson(projectDir, "scripts.seed", runCommand);

        s.message(
            `✔ ${
                adapter[0].toUpperCase() + adapter.slice(1)
            } seed script added!`
        );
    } catch (err) {
        s.message(`❌ Failed to configure ${adapter} seed script.`);
        console.error(err);
    }
}
