#!/bin/bash

# AI Fashion Designer - Start Script
# This script sets up and runs the complete application

set -e

echo "============================================="
echo "    AI Fashion Designer - Starting Up"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "${GREEN}[OK]${NC} Environment variables loaded"
else
  echo -e "${RED}[ERROR]${NC} .env file not found!"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Function to kill processes on specific ports
cleanup_ports() {
  echo -e "\n${YELLOW}[CLEANUP]${NC} Checking for processes on ports $BACKEND_PORT and $FRONTEND_PORT..."

  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo -e "${YELLOW}[CLEANUP]${NC} Killing process on port $PORT (PID: $PID)"
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done

  echo -e "${GREEN}[OK]${NC} Ports are clean"
}

# Function to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}[SHUTDOWN]${NC} Shutting down AI Fashion Designer..."

  # Kill background processes
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi

  # Kill any remaining processes on our ports
  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      kill -9 $PID 2>/dev/null || true
    fi
  done

  echo -e "${GREEN}[OK]${NC} All processes stopped. Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Clean up ports first
cleanup_ports

# Check for PostgreSQL
echo -e "\n${BLUE}[DB]${NC} Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
  # Try to create the database if it doesn't exist
  psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ai_fashion_designer'" 2>/dev/null | grep -q 1 || \
    psql -h localhost -U postgres -c "CREATE DATABASE ai_fashion_designer" 2>/dev/null || true
  echo -e "${GREEN}[OK]${NC} PostgreSQL database ready"
else
  echo -e "${YELLOW}[WARN]${NC} psql not found, assuming database exists"
fi

# Install backend dependencies
echo -e "\n${BLUE}[BACKEND]${NC} Installing backend dependencies..."
cd backend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}[OK]${NC} Backend dependencies installed"

# Run database seed
echo -e "\n${BLUE}[SEED]${NC} Seeding database with sample data..."
node seeds/seed.js
echo -e "${GREEN}[OK]${NC} Database seeded successfully"

# Start backend with nodemon for hot reload
echo -e "\n${BLUE}[BACKEND]${NC} Starting backend server on port $BACKEND_PORT with hot reload..."
npx nodemon server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo -e "${YELLOW}[WAIT]${NC} Waiting for backend to start..."
for i in {1..30}; do
  if curl -s http://localhost:$BACKEND_PORT/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}[OK]${NC} Backend is running on port $BACKEND_PORT"
    break
  fi
  sleep 1
done

# Install frontend dependencies
echo -e "\n${BLUE}[FRONTEND]${NC} Installing frontend dependencies..."
cd frontend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}[OK]${NC} Frontend dependencies installed"

# Start frontend with hot reload (React's built-in)
echo -e "\n${BLUE}[FRONTEND]${NC} Starting frontend on port $FRONTEND_PORT with hot reload..."
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
cd ..

echo -e "\n============================================="
echo -e "${GREEN}    AI Fashion Designer is running!${NC}"
echo -e "============================================="
echo -e ""
echo -e "  Frontend:  ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend:   ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo -e ""
echo -e "  Demo Login:"
echo -e "    Email:    demo@fashionai.com"
echo -e "    Password: password123"
echo -e ""
echo -e "  Both servers have hot reload enabled."
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services."
echo -e "============================================="

# Wait for any background process to exit
wait
