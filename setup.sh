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
pnpm dlx create-next-app@latest "$PROJECT_DIR" \--yes

cd "$PROJECT_DIR" || exit
echo -e "${GREEN}✅ Entered project directory: $PROJECT_DIR${NC}"




# Step 3: shadcn/ui Setup
echo -e "\n${CYAN}🎨 shadcn Configuration${NC}"

read -p "$(echo -e ${YELLOW}Do you want to set up shadcn? [y/N] '>' ${NC})" SHADCN_CHOICE

if [[ "$SHADCN_CHOICE" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}⚙️ Initializing shadcn/ui...${NC}"
    
    # Run the official init command
    pnpm dlx shadcn@latest init
    
    # Add convenient CLI alias
    pnpm pkg set scripts.ui="pnpm dlx shadcn@latest"
    pnpm dlx shadcn@latest add button dropdown-menu
    
    # Install next-themes
    pnpm add next-themes
    
    # Remote file URLs (replace with your actual raw GitHub URLs)
    THEME_PROVIDER_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/components/theme-provider.tsx"
    MODE_TOGGLE_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/components/mode-toggle.tsx"
    LAYOUT_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/app/layout.tsx"
    
    # Download and create files
    echo -e "${CYAN}Downloading theme components...${NC}"
    curl -sSL "$THEME_PROVIDER_URL" -o "src/components/theme-provider.tsx"
    curl -sSL "$MODE_TOGGLE_URL" -o "src/components/mode-toggle.tsx"
    curl -sSL "$LAYOUT_URL" -o "src/app/layout.tsx"
    
    # Verify downloads
    if [ -f "src/components/theme-provider.tsx" ] &&
    [ -f "src/components/mode-toggle.tsx" ] &&
    [ -f "src/app/layout.tsx" ]; then
        echo "${GREEN}- Theme provider"
        echo "- Dark mode toggle"
        echo "- Layout wrapper"
        echo -e "✅ shadcn configured with remote components!${NC}"
    else
        echo -e "${RED}❌ Error: Failed to download some components${NC}"
    fi
    
    
    echo -e "${GREEN}\n✅ shadcn configured!${NC}\n"
else
    echo -e "${YELLOW}⚠️ Skipping shadcn setup${NC}"
fi




# Create @lib directory if not found
mkdir -p "src/lib"




# Step 4: Database Adapter & Client Setup
echo -e "\n${CYAN}🚀 Database Client Configuration${NC}"

# Remote file URLs (replace with your actual raw GitHub URLs)
PRISMA_SCHEMA_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/prisma/schema.prisma"
PRISMA_CLIENT_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/lib/prisma.ts"
DRIZZLE_CLIENT_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/lib/drizzle.ts"
DRIZZLE_CONFIG_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/drizzle/config.ts"

while true; do
    echo -e "\n${CYAN}📊 Database Adapter Selection:${NC}"
    echo -e "1) Prisma + SQLite"
    echo -e "2) Drizzle + SQLite"
    echo -e "3) Skip database setup"
    read -p "$(echo -e ${YELLOW}Choose \(1-3\) '>' ${NC})" DB_CHOICE
    
    case $DB_CHOICE in
        1)
            # ===== PRISMA + SQLITE SETUP =====
            echo -e "${GREEN}🛢️ Initializing Prisma with SQLite...${NC}"
            
            # Install dependencies
            pnpm add @prisma/client
            pnpm add -D prisma
            
            # Initialize Prisma
            pnpm dlx prisma init \--datasource-provider sqlite \--output ./client
            
            # Download schema template
            echo -e "${CYAN}Downloading Prisma schema...${NC}"
            curl -sSL "$PRISMA_SCHEMA_URL" -o "prisma/schema.prisma"
            echo -e "${GREEN}✅ Prisma initialized!${NC}"
            
            # Generate Prisma Client
            echo -e "${GREEN}⚙️ Generating Prisma Client...${NC}"
            pnpm dlx prisma generate
            
            # Download client template
            curl -sSL "$PRISMA_CLIENT_URL" -o "src/lib/prisma.ts"
            
            echo -e "${GREEN}✅ Prisma client setup!${NC}"
            
            # Env configuration
            echo -e "\n\n# Generated Prisma Client" >> .gitignore
            echo -e "src/generated" >> .gitignore
            
            echo -e "${GREEN}✅ Prisma (SQLite) ready!${NC}"
            break
        ;;
        2)
            # ===== DRIZZLE + SQLITE =====
            echo -e "${GREEN}🌪️ Initializing Drizzle with SQLite...${NC}"
            
            pnpm add drizzle-orm better-sqlite3
            pnpm add -D drizzle-kit
            
            # Download files
            echo -e "${CYAN}Downloading Drizzle config...${NC}"
            mkdir -p drizzle
            curl -sSL "$DRIZZLE_CLIENT_URL" -o "src/lib/drizzle.ts"
            curl -sSL "$DRIZZLE_CONFIG_URL" -o "drizzle/config.ts"
            
            echo -e "${GREEN}✅ Drizzle configured!${NC}"
            echo -e "${YELLOW}ℹ️  Run: pnpm dlx drizzle-kit generate${NC}"
            
            echo -e "${GREEN}✅ Drizzle (SQLite) ready!${NC}"
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

# Verify downloads if any DB was selected
if [[ $DB_CHOICE =~ ^[12]$ ]]; then
    if [[ $DB_CHOICE == "1" && (! -f "prisma/schema.prisma" || ! -f "src/lib/prisma.ts") ]]; then
        echo -e "${RED}❌ Error: Failed to download Prisma templates${NC}"
        elif [[ $DB_CHOICE == "2" && (! -f "src/lib/drizzle.ts" || ! -f "drizzle/config.ts") ]]; then
        echo -e "${RED}❌ Error: Failed to download Drizzle templates${NC}"
    fi
fi





# Step 5: Seeding Configuration
echo -e "\n${CYAN}🌱 Database Seeding Setup${NC}"

# Remote file URLs (replace with your actual raw GitHub URLs)
PRISMA_SEED_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/prisma/seed.ts"
DRIZZLE_SEED_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/drizzle/seed.ts"

# Only ask about seeding if database was configured
if [[ $DB_CHOICE =~ ^[12]$ ]]; then
    read -p "$(echo -e ${YELLOW}Add database seeding script? [y/N] '>' ${NC})" SEED_CHOICE
    
    if [[ "$SEED_CHOICE" =~ ^[Yy]$ ]]; then
        case $DB_CHOICE in
            1)
                # ===== PRISMA SEEDING =====
                echo -e "${CYAN}Downloading Prisma seed template...${NC}"
                if curl -sSL "$PRISMA_SEED_URL" -o "prisma/seed.ts"; then
                    pnpm pkg set scripts.seed="pnpm dlx tsx prisma/seed.ts"
                    echo -e "${GREEN}✅ Prisma seed script created!${NC}"
                    echo -e "${YELLOW}Run with: pnpm seed${NC}"
                else
                    echo -e "${RED}❌ Failed to download Prisma seed template${NC}"
                fi
            ;;
            2)
                # ===== DRIZZLE SEEDING =====
                echo -e "${CYAN}Downloading Drizzle seed template...${NC}"
                mkdir -p drizzle
                if curl -sSL "$DRIZZLE_SEED_URL" -o "drizzle/seed.ts"; then
                    pnpm pkg set scripts.seed="pnpm dlx tsx drizzle/seed.ts"
                    echo -e "${GREEN}✅ Drizzle seeding configured!${NC}"
                else
                    echo -e "${RED}❌ Failed to download Drizzle seed template${NC}"
                fi
            ;;
        esac
    else
        echo -e "${YELLOW}⚠️ Skipping seeding setup${NC}"
    fi
fi




# Step 6: Better-Auth Setup
echo -e "\n${CYAN}🔐 Better-Auth Configuration${NC}"

# Remote file URLs (replace with your actual raw GitHub URLs)
AUTH_PRISMA_CONFIG_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/lib/auth-prisma.ts"
AUTH_DRIZZLE_CONFIG_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/lib/auth-drizzle.ts"
AUTH_ROUTE_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/app/api/route.ts"
AUTH_CLIENT_URL="https://raw.githubusercontent.com/iamsuudi/nextjs-starter-cli/main/src/lib/auth-client.ts"

if [[ $DB_CHOICE =~ ^[12]$ ]]; then
    read -p "$(echo -e ${YELLOW}Enable Better-Auth? [y/N] '>' ${NC})" AUTH_CHOICE
    
    if [[ "$AUTH_CHOICE" =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}🛡️ Configuring Better-Auth...${NC}"
        
        # Install core packages
        pnpm add better-auth
        
        # Env configuration
        echo -e "\n\n# Better-Auth" >> .env
        echo "BETTER_AUTH_SECRET=$(openssl rand -hex 32)" >> .env
        echo "BETTER_AUTH_URL=http://localhost:3000" >> .env
        
        # Create required directories
        mkdir -p "src/app/api/auth/[...all]"
        
        # Config files based on DB adapter
        case $DB_CHOICE in
            1)
                # ===== PRISMA CONFIG =====
                
                # Download configuration files
                echo -e "${CYAN}Downloading auth templates...${NC}"
                curl -sSL "$AUTH_PRISMA_CONFIG_URL" -o "src/lib/auth.ts"
                curl -sSL "$AUTH_ROUTE_URL" -o "src/app/api/auth/[...all]/route.ts"
                curl -sSL "$AUTH_CLIENT_URL" -o "src/lib/auth-client.ts"
                
                # Generate Database Tables
                pnpm dlx @better-auth/cli generate
                
                # Add CLI script
                pnpm pkg set scripts.auth:gen="pnpm dlx @better-auth/cli generate"
                
                echo -e "${GREEN}✅ Better-Auth configured!${NC}"
                echo "Run: pnpm auth:gen to generate auth types"
            ;;
            2)
                # ===== DRIZZLE CONFIG =====
                
                # Download configuration files
                echo -e "${CYAN}Downloading auth templates...${NC}"
                curl -sSL "$AUTH_DRIZZLE_CONFIG_URL" -o "src/lib/auth.ts"
                curl -sSL "$AUTH_ROUTE_URL" -o "src/app/api/auth/[...all]/route.ts"
                curl -sSL "$AUTH_CLIENT_URL" -o "src/lib/auth-client.ts"
                
                # Generate Database Tables
                pnpm dlx @better-auth/cli generate
                
                # Add CLI script
                pnpm pkg set scripts.auth:gen="pnpm dlx @better-auth/cli generate"
                
                echo -e "${GREEN}✅ Better-Auth configured!${NC}"
                echo "Run: pnpm auth:gen to generate auth types"
            ;;
        esac
    else
        echo -e "${YELLOW}⚠️ Skipping authentication setup${NC}"
    fi
fi

echo -e "${GREEN}\n\n🎉 That's it. Your project is ready! 🚀🚀🚀${NC}\n\n"



# ---- Cleanup Section ----
cleanup() {
    echo -e "\n${CYAN}🧹 Cleaning up...${NC}"
    rm -f "nextjs-setup.sh" 2>/dev/null && \
    echo -e "  ${GREEN}✔ Removed: ${file}${NC}" || \
    echo -e "  ${YELLOW}⚠ Couldn't remove: ${file}${NC}"
}

# Set trap for normal exit and interrupts
trap cleanup EXIT INT TERM

# ... [rest of your script] ...

# Clear the trap at the end if everything succeeded
trap - EXIT INT TERM
cleanup