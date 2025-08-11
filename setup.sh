#!/bin/bash

echo "Setting up Investment Matchmaker Local Development Environment..."
echo

# Create root .env file
echo "Creating root .env file..."
cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://app:app@localhost:5432/app

# JWT Configuration
JWT_SECRET=devsecret
JWT_REFRESH_SECRET=devrefresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# WebSocket
WS_PORT=4001

# SMTP Configuration (MailHog for local development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@investmentmatchmaker.local

# App Configuration
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
THROTTLE_AUTH_TTL=60000
THROTTLE_AUTH_LIMIT=5
THROTTLE_MESSAGES_TTL=60000
THROTTLE_MESSAGES_LIMIT=50

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4001
NEXT_PUBLIC_APP_NAME=Investment Matchmaker
NEXT_PUBLIC_APP_DESCRIPTION=Connect entrepreneurs with investors
EOF

# Create uploads directory
mkdir -p uploads
mkdir -p backend/uploads

echo
echo "Starting Docker services..."
docker-compose up -d

echo
echo "Waiting for database to be ready..."
sleep 10

echo
echo "Installing backend dependencies..."
cd backend
npm install

echo
echo "Running database migrations..."
npx prisma migrate dev

echo
echo "Installing frontend dependencies..."
cd ../frontend
npm install

echo
echo "Setup complete!"
echo
echo "To start development:"
echo "1. Backend: cd backend && npm run start:dev"
echo "2. Frontend: cd frontend && npm run dev"
echo "3. WebSocket: Backend will start WebSocket server on port 4001"
echo "4. MailHog: http://localhost:8025"
echo "5. Database: localhost:5432"
echo
