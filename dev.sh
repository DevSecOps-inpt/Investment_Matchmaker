#!/bin/bash

echo "Starting Investment Matchmaker Development Environment..."
echo

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please run setup.sh first."
    exit 1
fi

# Check if Docker services are running
echo "Checking Docker services..."
if ! docker-compose ps | grep -q "Up"; then
    echo "Starting Docker services..."
    docker-compose up -d
    echo "Waiting for services to be ready..."
    sleep 5
fi

echo
echo "Starting development servers..."
echo

# Start backend in background
echo "Starting backend server..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "Development servers started!"
echo
echo "Services:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:4000"
echo "- WebSocket: ws://localhost:4001"
echo "- MailHog: http://localhost:8025"
echo
echo "Press Ctrl+C to stop all services..."

# Function to cleanup on exit
cleanup() {
    echo
    echo "Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Development servers stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
