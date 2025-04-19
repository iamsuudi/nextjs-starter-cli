# Next.js Starter CLI

A zero-to-production CLI tool to bootstrap Next.js projects with:  
✅ Database (Prisma/Drizzle + SQLite)  
✅ Authentication (Better-Auth)  
✅ UI Components (shadcn/ui)

## Features

-   **One-command setup** for full-stack Next.js apps
-   **DB Adapters**: Choose between Prisma or Drizzle
-   **Modern Auth**: Better-Auth with session management
-   **Beautiful UI**: shadcn/ui components pre-configured
-   **Dev-Friendly**: SQLite for development, easy production switch

## How to Use

Run the following command directly in your terminal to download and execute the script automatically:

```bash
curl -fsSL https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/setup.sh -o nextjs-setup.sh && chmod +x nextjs-setup.sh && ./nextjs-setup.sh
```

Or use `wget`:

```bash
wget https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/setup.sh -O nextjs-setup.sh && chmod +x nextjs-setup.sh && ./nextjs-setup.sh
```

### 2. Follow the interactive prompts

The script will guide you through:

-   Database adapter selection
-   Authentication setup
-   UI component configuration

## Manual Installation

Prefer manual control? Run these individually:

```bash
# 1. Database
pnpm add @prisma/client
pnpm dlx prisma init

# 2. Authentication
pnpm add better-auth
pnpm dlx @better-auth/cli generate

# 3. UI Components
pnpm dlx shadcn-ui@latest init
```

## Project Structure

After setup:

```
my-app/
├── prisma/          # Database schema
├── src/lib/auth     # Authentication config
├── components/ui/   # shadcn components
├── lib/prisma       # Database client
└── .env             # Environment variables
```

## Commands Cheatsheet

| Command              | Description                       |
| -------------------- | --------------------------------- |
| `pnpm dev`           | Start development server          |
| `pnpm seed`   | Seed DB (Prisma)       |
| `pnpm auth:gen`      | Generate auth types (Better-Auth) |
| `pnpm ui add button` | Add shadcn component              |

## Customization

### Switching Databases

Edit these files for production:

-   **Prisma**: `prisma/schema.prisma`
-   **Drizzle**: `drizzle/config.ts`

### Theming

Modify colors in:

```css
/* globals.css */
@layer base {
    :root {
        --primary: 222.2 47.4% 11.2%;
    }
}
```
