#!/bin/bash

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Next.js Project Bootstrapper (pnpm only)${NC}"

# Step 1: Ask for Project Directory
read -p "$(echo -e ${YELLOW}Enter the project directory \(default: .\) '>' ${NC})" PROJECT_DIR
PROJECT_DIR=${PROJECT_DIR:-.}

# Check if the current directory is the same as the script location
if [ "$PROJECT_DIR" == "." ] && [ -f "./nextjs-setup.sh" ]; then
    echo -e "${RED}❌ You cannot create the Next.js app in the current directory as the setup script is located here.${NC}"
    echo -e "${YELLOW}Please choose a different directory for your Next.js project.${NC}"
    exit 1
fi

# Check if the directory already exists and is not empty
if [ -d "$PROJECT_DIR" ] && [ "$(ls -A "$PROJECT_DIR")" ]; then
    echo -e "${YELLOW}⚠️ The directory '$PROJECT_DIR' is not empty! Do you want to proceed? (y/n)${NC}"
    read -r confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted! Please choose an empty directory or create a new one.${NC}"
        exit 1
    fi
fi


# Step 2: Create Next.js App using pnpm
echo -e "${GREEN}🚧 Creating Next.js app in '${PROJECT_DIR}' using pnpm...${NC}"
pnpm dlx create-next-app@latest "$PROJECT_DIR"

cd "$PROJECT_DIR" || exit
echo -e "${GREEN}✅ Entered project directory: $PROJECT_DIR${NC}"


# Step 3: Database Client Setup
echo -e "\n${CYAN}🚀 Database Client Configuration${NC}"

# Determine project structure (src or no src)
CLIENT_BASE_DIR=$([ -d "src" ] && echo "src/lib/db" || echo "lib/db")
mkdir -p "$CLIENT_BASE_DIR"

while true; do
    echo -e "\n${CYAN}📊 Database Adapter Selection:${NC}"
    echo -e "1) Prisma + SQLite"
    echo -e "2) Drizzle + SQLite"
    echo -e "3) Skip database setup"
    read -p "$(echo -e ${YELLOW}Choose (1-3) '>' ${NC})" DB_CHOICE
    
    case $DB_CHOICE in
        1)
            # ===== PRISMA + SQLITE SETUP =====
            echo -e "${GREEN}🛢️ Initializing Prisma with SQLite...${NC}"
            
            # Install dependencies
            pnpm add @prisma/client
            pnpm add -D prisma
            
            # Initialize Prisma
            pnpm dlx prisma init \--datasource-proiver sqlite
            
            echo -e "${GREEN}✅ Prisma initialized!${NC}"
            
            # Create optimized client
            cat > "$CLIENT_BASE_DIR/prisma.ts" << 'EOL'
            import { PrismaClient } from '@prisma/client'

            // Prevent multiple instances in development
            const globalForPrisma = global as unknown as { prisma: PrismaClient };

            export const prisma = globalForPrisma.prisma || new PrismaClient();

            if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
EOL
            
            # Generate Prisma Client
            echo -e "${GREEN}⚙️ Generating Prisma Client...${NC}"
            pnpm dlx prisma generate
            echo -e "${GREEN}✅ Prisma (SQLite) ready!${NC}"
            echo -e "${YELLOW}ℹ️ Database: prisma/dev.db"
            break
        ;;
        2)
            # ===== DRIZZLE + SQLITE =====
            echo -e "${GREEN}🌪️ Initializing Drizzle with SQLite...${NC}"
            
            pnpm add drizzle-orm better-sqlite3
            pnpm add -D drizzle-kit
            
            # Create client file
            cat > "$CLIENT_BASE_DIR/drizzle.ts" << 'EOL'
            import { drizzle } from 'drizzle-orm/better-sqlite3';
            import Database from 'better-sqlite3';

            const sqlite = new Database('./sqlite.db');
            export const db = drizzle(sqlite);
EOL
            
            # Minimal config
            mkdir -p drizzle
            cat > drizzle/config.ts << 'EOL'
            import type { Config } from "drizzle-kit";

            export default {
                schema: "./schema.ts",
                out: "./migrations",
                driver: "better-sqlite",
                dbCredentials: {
                    url: "./sqlite.db"
                },
            } satisfies Config;
EOL
            
            echo -e "${GREEN}✅ Drizzle (SQLite) ready!${NC}"
            echo -e "${YELLOW}ℹ️  Database: ./sqlite.db"
            echo -e "Run: npx drizzle-kit generate to create migrations${NC}"
            break
        ;;
        3)
            echo -e "${YELLOW}⚠️ Skipping database setup${NC}"
            break
        ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please select 1-3${NC}"
            sleep 1
        ;;
    esac
done
