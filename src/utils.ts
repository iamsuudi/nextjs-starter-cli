import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

export type PackageManager = "pnpm" | "npm" | "bun";

export const getCreateNextCommand = (
    pkg: PackageManager,
    projectPath: string
) => {
    switch (pkg) {
        case "pnpm":
            return `pnpm create next-app@latest ${projectPath} -y`;
        case "npm":
            return `npm create next-app@latest ${projectPath} -y`;
        case "bun":
            return `bun create next-app ${projectPath} -y`;
        default:
            throw new Error(`Unsupported package manager: ${pkg}`);
    }
};

export const getInstallCommand = (
    pkg: PackageManager,
    deps: string[],
    dev = false
) => {
    const flag = dev ? "--save-dev" : "";
    switch (pkg) {
        case "pnpm":
            return `pnpm add ${dev ? "-D " : ""}${deps.join(" ")}`;
        case "npm":
            return `npm install ${flag} ${deps.join(" ")}`;
        case "bun":
            return `bun add ${dev ? "--dev " : ""}${deps.join(" ")}`;
        default:
            throw new Error(`Unsupported package manager: ${pkg}`);
    }
};

export const getDlxCommand = (pkg: PackageManager, cmd: string) => {
    switch (pkg) {
        case "pnpm":
        case "bun":
            return `${pkg} dlx ${cmd}`;
        case "npm":
            return `npx ${cmd}`;
        default:
            throw new Error(`Unsupported package manager: ${pkg}`);
    }
};

export const runInProject = (command: string, cwd: string) => {
    execSync(command, { cwd, stdio: "inherit" });
};

export const installPackages = (
    pkg: PackageManager,
    deps: string[],
    projectDir: string,
    dev = false
) => {
    const cmd = getInstallCommand(pkg, deps, dev);
    runInProject(cmd, projectDir);
};

export const runDlxCommand = (
    pkg: PackageManager,
    command: string,
    projectDir: string
) => {
    const fullCommand = getDlxCommand(pkg, command);
    runInProject(fullCommand, projectDir);
};

export const getRunCommand = (pkg: string, cmd: string) => {
    switch (pkg) {
        case "pnpm":
        case "bun":
            return `${pkg} dlx ${cmd}`;
        case "npm":
            return `npx ${cmd}`;
        default:
            throw new Error(`Unsupported package manager: ${pkg}`);
    }
};

export async function editPackageJson(
    projectDir: string,
    fieldPath: string,
    value: string
) {
    const pkgJsonPath = path.join(projectDir, "package.json");
    const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));

    // Handle dot notation (e.g., "prisma.schema")
    const pathParts = fieldPath.split(".");
    let current = pkg;

    for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!current[part] || typeof current[part] !== "object") {
            current[part] = {};
        }
        current = current[part];
    }

    const lastPart = pathParts[pathParts.length - 1];
    current[lastPart] = value;

    writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
}

export function deletePrismaSchema(projectDir: string) {
    const schemaPath = path.join(projectDir, "prisma", "schema.prisma");

    if (existsSync(schemaPath)) {
        rmSync(schemaPath);
        console.log(`🗑️ Deleted default schema.prisma`);
    } else {
        console.log(`⚠️ schema.prisma not found, skipping delete.`);
    }
}