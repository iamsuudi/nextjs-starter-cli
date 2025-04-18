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

