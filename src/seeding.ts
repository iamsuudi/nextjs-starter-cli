import path from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { confirm, spinner } from "@clack/prompts";
import { editPackageJsonScript, getDlxCommand } from "./utils";

export async function setupSeeding(
    pkgManager: "pnpm" | "npm" | "bun",
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
    if (!["prisma", "drizzle"].includes(adapter)) return;

    const shouldSeed = await confirm({
        message: "Add database seeding script?",
        initialValue: false,
    });

    if (!shouldSeed) {
        console.log("⚠️ Skipping seeding setup.");
        return;
    }

    const s = spinner();
    s.start("Setting up seeding script...");

    const seedFileMap = {
        prisma: {
            src: path.join(__dirname, "../prisma/seed.ts"),
            dest: path.join(projectDir, "prisma/seed.ts"),
        },
        drizzle: {
            src: path.join(__dirname, "../drizzle/seed.ts"),
            dest: path.join(projectDir, "drizzle/seed.ts"),
        },
    };

    const { src, dest } = seedFileMap[adapter];

    // Ensure directory exists
    const seedDir = path.dirname(dest);
    if (!existsSync(seedDir)) mkdirSync(seedDir, { recursive: true });

    try {
        copyFileSync(src, dest);

        const runCommand = getDlxCommand(
            pkgManager,
            `tsx ${path.relative(projectDir, dest)}`
        );
        await editPackageJsonScript(projectDir, "seed", runCommand);

        s.stop(
            `✅ ${
                adapter[0].toUpperCase() + adapter.slice(1)
            } seed script added!`
        );
    } catch (err) {
        s.stop(`❌ Failed to configure ${adapter} seed script.`);
        console.error(err);
    }
}
