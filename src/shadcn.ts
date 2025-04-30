import { confirm } from "@clack/prompts";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import {
    getInstallCommand,
    PackageManager,
    runDlxCommand,
    runInProject,
} from "./utils";
import { SpinnerType } from "./types";

export async function setupShadcn(
    s: SpinnerType,
    packageManager: PackageManager,
    projectDir: string
) {
    s.message("Step 2: ");

    const shouldSetup = await confirm({
        message: "Would you like to set up shadcn/ui?",
    });

    if (!shouldSetup) {
        s.message("⚠️ Skipping shadcn/ui setup.");
        return;
    }

    s.message(`Setting up shadcn in "${projectDir}"...`);

    try {
        // Initialize shadcn
        runDlxCommand(
            packageManager,
            "shadcn@latest init -y --base-color neutral",
            projectDir
        );

        s.message("Shadcn initialized.");

        // Add some components
        runDlxCommand(
            packageManager,
            "shadcn@latest add button dropdown-menu",
            projectDir
        );

        s.message("Shadcn button and dropdown-menu components added.");

        // Install next-themes package
        const installCommand = getInstallCommand(packageManager, [
            "next-themes",
        ]);
        runInProject(installCommand, projectDir);

        s.message("next-theme package installed.");

        // Copy template files
        copyShadcnTemplateFiles(s, projectDir);

        s.stop("✔ Shadcn setup completed successfully!");
    } catch (err) {
        s.stop("❌ Failed to set up shadcn.");
        console.error(err);
        process.exit(1);
    }
}

function copyShadcnTemplateFiles(s: SpinnerType, projectDir: string) {
    s.message("Going to copy shadcn files");
    s.message("Preparing files destinaion...");

    const hasSrc = existsSync(path.join(projectDir, "src"));
    const basePath = hasSrc ? path.join(projectDir, "src") : projectDir;
    const componentsDir = path.join(basePath, "components");
    const appDir = path.join(basePath, "app");

    if (!existsSync(componentsDir))
        mkdirSync(componentsDir, { recursive: true });
    if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });

    s.message("✔ Destination Prepared");

    const files = [
        {
            src: path.join(
                __dirname,
                "../templates/src/components/theme-provider.tsx"
            ),
            dest: path.join(componentsDir, "theme-provider.tsx"),
        },
        {
            src: path.join(
                __dirname,
                "../templates/src/components/mode-toggle.tsx"
            ),
            dest: path.join(componentsDir, "mode-toggle.tsx"),
        },
        {
            src: path.join(__dirname, "../templates/src/app/layout.tsx"),
            dest: path.join(appDir, "layout.tsx"),
        },
    ];

    files.forEach(({ src, dest }) => {
        copyFileSync(src, dest);
        s.message(`Copied to ${dest}`);
    });

    s.message("✔ Copying finished");
}
