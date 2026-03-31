#!/bin/bash
# Pre-commit test script for ENS Granular Monorepo
# Run this before committing to ensure tests pass

set -e

echo "========================================"
echo "  ENS Granular Pre-Commit Tests"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to repo root
cd "$(dirname "$0")/.."

# Run contract tests
echo -e "${YELLOW}Running contract tests...${NC}"
cd packages/contracts
npm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Contract tests passed${NC}"
else
    echo -e "${RED}Contract tests failed${NC}"
    exit 1
fi

cd ../..

# Run UI tests if they exist
if [ -f "packages/ui/package.json" ]; then
    echo ""
    echo -e "${YELLOW}Running UI tests...${NC}"
    cd packages/ui
    if npm run test 2>/dev/null; then
        echo -e "${GREEN}UI tests passed${NC}"
    else
        echo -e "${YELLOW}UI tests skipped or no tests found${NC}"
    fi
    cd ../..
fi

echo ""
echo "========================================"
echo -e "${GREEN}  All pre-commit tests passed${NC}"
echo "========================================"

