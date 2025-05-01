import path from "path";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { editPackageJson, getDlxCommand } from "./utils";

export async function setupSeeding(
    pkgManager: "pnpm" | "npm" | "bun",
    projectDir: string,
    adapter: "prisma" | "drizzle"
) {
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

    try {
        copyFileSync(src, dest);

        const runCommand = getDlxCommand(
            pkgManager,
            `tsx ${path.relative(projectDir, dest)}`
        );
        await editPackageJson(projectDir, "scripts.seed", runCommand);
    } catch (err) {
        console.error(err);
    }
}
