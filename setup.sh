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

