#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Azure environment config
AZURE_CONFIG=".azure/config.json"
AZURE_ENV_DIR=".azure"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  German Tutor - Local Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

print_status() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# 1. Check Prerequisites
echo -e "${BLUE}[1/7] Checking Prerequisites...${NC}"

command -v python >/dev/null 2>&1 || { print_error "Python not found"; exit 1; }
print_status "Python $(python --version | cut -d' ' -f2)"

command -v node >/dev/null 2>&1 || { print_error "Node.js not found"; exit 1; }
print_status "Node.js $(node --version)"

command -v npm >/dev/null 2>&1 || { print_error "npm not found"; exit 1; }
print_status "npm $(npm --version)"

command -v uv >/dev/null 2>&1 || { print_error "uv not found"; exit 1; }
print_status "uv $(uv --version | cut -d' ' -f2)"

# 2. Load Azure environment variables
echo -e "\n${BLUE}[2/7] Loading Azure Environment...${NC}"

# Get default environment name from .azure/config.json
if [ ! -f "$AZURE_CONFIG" ]; then
    print_error "Azure config not found. Run 'azd init' or 'azd up' first"
    exit 1
fi

ENV_NAME=$(grep -o '"defaultEnvironment":"[^"]*"' "$AZURE_CONFIG" | cut -d'"' -f4)
if [ -z "$ENV_NAME" ]; then
    print_error "No default environment found in $AZURE_CONFIG"
    exit 1
fi
print_status "Azure environment: $ENV_NAME"

# Load .env from Azure environment folder
ENV_FILE="$AZURE_ENV_DIR/$ENV_NAME/.env"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    print_warning "Run 'azd up' to provision Azure resources first"
    exit 1
fi

# Export variables from Azure env file
set -a
source "$ENV_FILE"
set +a

# Set local overrides for development
export BACKEND_HOST="0.0.0.0"
export BACKEND_PORT="8000"
export CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
export VITE_API_URL="http://localhost:8000"
export VITE_WS_URL="ws://localhost:8000"

if [ -z "$AZURE_OPENAI_ENDPOINT" ]; then
    print_error "AZURE_OPENAI_ENDPOINT not set in $ENV_FILE"
    exit 1
fi
print_status "Loaded from: $ENV_FILE"
print_status "Azure OpenAI: $AZURE_OPENAI_ENDPOINT"

# 3. Install Backend Dependencies
echo -e "\n${BLUE}[3/7] Installing Backend Dependencies...${NC}"
uv sync --dev
print_status "Backend dependencies installed"

# 4. Install Frontend Dependencies
echo -e "\n${BLUE}[4/7] Installing Frontend Dependencies...${NC}"
cd src/frontend
[ ! -d "node_modules" ] && npm install || print_status "Already installed (skipping)"
cd ../..
print_status "Frontend dependencies ready"

# 5. Backend Quality Checks
echo -e "\n${BLUE}[5/7] Backend Quality Checks...${NC}"
uv run ruff check src/backend 2>/dev/null && print_status "Ruff lint passed" || print_warning "Ruff issues (non-blocking)"
uv run ruff format src/backend --check 2>/dev/null && print_status "Ruff format passed" || print_warning "Format issues (non-blocking)"
uv run mypy src/backend 2>/dev/null && print_status "MyPy passed" || print_warning "Type issues (non-blocking)"

# 6. Frontend Quality Checks
echo -e "\n${BLUE}[6/7] Frontend Quality Checks...${NC}"
cd src/frontend
npm run lint 2>/dev/null && print_status "ESLint passed" || print_warning "ESLint issues (non-blocking)"
cd ../..

# 7. Start Services & Test
echo -e "\n${BLUE}[7/7] Starting Services...${NC}"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Stopping services...${NC}"
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    pkill -f "uvicorn app.main:app" 2>/dev/null || true
    rm -f backend.log frontend.log
    echo -e "${GREEN}Cleanup complete${NC}"
    exit 0
}
trap cleanup INT TERM

# Start backend
uv run uvicorn app.main:app --app-dir src/backend --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Test backend health
for i in {1..10}; do
    curl -s http://localhost:8000/health | grep -q "healthy" && break
    [ $i -eq 10 ] && { print_error "Backend failed to start"; cat backend.log; cleanup; }
    sleep 1
done
print_status "Backend running (http://localhost:8000)"

# Start frontend
cd src/frontend
npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ../..
sleep 2
print_status "Frontend running (http://localhost:5173)"

# Success
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ All Services Running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\n  Backend:  ${BLUE}http://localhost:8000${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"
echo -e "  Env:      ${BLUE}$ENV_FILE${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop${NC}\n"

# Keep alive
wait
