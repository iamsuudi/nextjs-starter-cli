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


# Step 3: Choose Database Adapter
echo -e "${YELLOW}Choose a database adapter > ${NC}"
select DB_ADAPTER in "prisma"; do
    case $DB_ADAPTER in
        prisma)
            echo -e "${GREEN}✔ Selected database adapter: Prisma${NC}"
            echo -e "${GREEN}📦 Installing Prisma dependencies...${NC}"
            pnpm add -D prisma && pnpm add @prisma/client
            
            echo -e "${GREEN}⚙️ Initializing Prisma...${NC}"
            pnpm dlx prisma init
            break
        ;;
        * )
            echo -e "${YELLOW}Invalid selection. Please choose a valid adapter.${NC}"
        ;;
    esac
done

