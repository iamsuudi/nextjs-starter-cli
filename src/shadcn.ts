import { existsSync, mkdirSync, copyFileSync } from "fs";
import path from "path";
import {
    getInstallCommand,
    PackageManager,
    runDlxCommand,
    runInProject,
} from "./utils";

export async function setupShadcn(
    packageManager: PackageManager,
    projectDir: string
) {
    try {
        // Initialize shadcn
        runDlxCommand(
            packageManager,
            "shadcn@latest init -y --base-color neutral",
            projectDir
        );

        // Add some components
        runDlxCommand(
            packageManager,
            "shadcn@latest add button dropdown-menu",
            projectDir
        );

        // Install next-themes package
        const installCommand = getInstallCommand(packageManager, [
            "next-themes",
        ]);
        runInProject(installCommand, projectDir);

        // Copy template files
        copyShadcnTemplateFiles(projectDir);
    } catch (err) {
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
    });
}
