import { spinner } from "@clack/prompts";
import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import {
    getDlxCommand,
    getInstallCommand,
    PackageManager,
    runDlxCommand,
    runInProject,
} from "./utils";

export async function setupShadcn(
    packageManager: PackageManager,
    projectDir: string
) {
    const s = spinner();
    s.start(`Setting up shadcn in "${projectDir}"...`);

    try {
        // Initialize shadcn
        const initDlxCommand = getDlxCommand(
            packageManager,
            "shadcn@latest init"
        );
        runDlxCommand(packageManager, initDlxCommand, projectDir);

        // Add some components
        const installDlxCommand = getDlxCommand(
            packageManager,
            "shadxcn@latest add button dropdown-menu"
        );
        runDlxCommand(packageManager, installDlxCommand, projectDir);

        // Install next-themes package
        const installCommand = getInstallCommand(packageManager, [
            "next-themes",
        ]);
        runInProject(installCommand, process.cwd());

        // After the installation, copy the necessary template files
        copyShadcnTemplateFiles(projectDir);

        s.stop("Shadcn setup completed successfully!");
    } catch (err) {
        s.stop("❌ Failed to set up shadcn.");
        console.error(err);
        process.exit(1);
    }
}

function copyShadcnTemplateFiles(projectDir: string) {
    const hasSrc = existsSync(path.join(projectDir, "src"));

    const basePath = hasSrc ? path.join(projectDir, "src") : projectDir;
    const componentsDir = path.join(basePath, "components");
    const appDir = path.join(basePath, "app");

    if (!existsSync(componentsDir))
        mkdirSync(componentsDir, { recursive: true });
    if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });

    const files = [
        {
            src: path.join(__dirname, "components/theme-provider.tsx"),
            dest: path.join(componentsDir, "theme-provider.tsx"),
        },
        {
            src: path.join(__dirname, "components/mode-toggle.tsx"),
            dest: path.join(componentsDir, "mode-toggle.tsx"),
        },
        {
            src: path.join(__dirname, "app/layout.tsx"),
            dest: path.join(appDir, "layout.tsx"),
        },
    ];

    files.forEach(({ src, dest }) => {
        copyFileSync(src, dest);
        console.log(`✅ Copied to ${dest}`);
    });
}
