#!/bin/bash

echo "Starting Investment Matchmaker with npm..."
echo

# Check if node_modules exists in root
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm run install:all
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
    echo "Dependencies installed successfully!"
    echo
fi

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "Backend dependencies installed!"
    echo
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "Frontend dependencies installed!"
    echo
fi

echo "Starting development servers..."
echo
echo "Services will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:4000"
echo "- WebSocket: ws://localhost:4001"
echo "- API Docs: http://localhost:4000/docs"
echo
echo "Press any key to start both services..."
read -n 1

# Start both services using npm
npm run dev
