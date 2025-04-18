# Next.js Starter CLI

A simple CLI tool to quickly bootstrap a Next.js project with Prisma integration, including a reusable Prisma client (`db.ts`) and optional Prisma seeding.

## Features

-   Creates a Next.js project using pnpm.
-   Automatically sets up Prisma with a reusable client for development (`db.ts`).
-   Optionally adds a Prisma seeding script.

## How to Use

Run the script directly without cloning

Run the following command directly in your terminal to download and execute the script:

```bash
curl -fsSL https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/nextjs-setup.sh -o nextjs-setup.sh && chmod +x nextjs-setup.sh && ./nextjs-setup.sh
```

Or use `wget`:

```bash
wget https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/nextjs-setup.sh -O nextjs-setup.sh && chmod +x nextjs-setup.sh && ./nextjs-setup.sh
```

## What Happens Next

-   The script will prompt you to choose your package manager.
-   Enter the project directory.
-   Select **Prisma** as the database adapter.
-   Optionally, enable Prisma seeding and automatically create the reusable Prisma client (`db.ts`).

## License

MIT License. See `LICENSE` for more details.

---

This concise README should help users get started with your project quickly! Let me know if you need further adjustments.
