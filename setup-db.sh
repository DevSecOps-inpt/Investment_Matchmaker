#!/bin/bash

echo "Setting up Investment Matchmaker Database..."
echo

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies first..."
    cd backend
    npm install
    cd ..
    echo
fi

echo "Setting up database..."
cd backend

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate dev --name init

echo
echo "Database setup complete!"
echo
echo "To view your database in the browser, run:"
echo "npm run db:studio"
echo
