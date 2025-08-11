@echo off
echo Setting up Investment Matchmaker Local Development Environment...
echo.

REM Create root .env file
echo Creating root .env file...
(
echo # Database
echo DATABASE_URL=postgresql://app:app@localhost:5432/app
echo.
echo # JWT Configuration
echo JWT_SECRET=devsecret
echo JWT_REFRESH_SECRET=devrefresh
echo JWT_EXPIRES_IN=15m
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo # WebSocket
echo WS_PORT=4001
echo.
echo # SMTP Configuration (MailHog for local development)
echo SMTP_HOST=localhost
echo SMTP_PORT=1025
echo SMTP_USER=
echo SMTP_PASS=
echo SMTP_FROM=noreply@investmentmatchmaker.local
echo.
echo # App Configuration
echo PORT=4000
echo FRONTEND_URL=http://localhost:3000
echo NODE_ENV=development
echo.
echo # Rate Limiting
echo THROTTLE_TTL=60000
echo THROTTLE_LIMIT=100
echo THROTTLE_AUTH_TTL=60000
echo THROTTLE_AUTH_LIMIT=5
echo THROTTLE_MESSAGES_TTL=60000
echo THROTTLE_MESSAGES_LIMIT=50
echo.
echo # Frontend Configuration
echo NEXT_PUBLIC_API_URL=http://localhost:4000
echo NEXT_PUBLIC_WS_URL=ws://localhost:4001
echo NEXT_PUBLIC_APP_NAME=Investment Matchmaker
echo NEXT_PUBLIC_APP_DESCRIPTION=Connect entrepreneurs with investors
) > .env

REM Create uploads directory
if not exist "uploads" mkdir uploads
if not exist "backend/uploads" mkdir backend\uploads

echo.
echo Starting Docker services...
docker-compose up -d

echo.
echo Waiting for database to be ready...
timeout /t 10 /nobreak > nul

echo.
echo Installing backend dependencies...
cd backend
npm install

echo.
echo Running database migrations...
npx prisma migrate dev

echo.
echo Installing frontend dependencies...
cd ..\frontend
npm install

echo.
echo Setup complete! 
echo.
echo To start development:
echo 1. Backend: cd backend ^& npm run start:dev
echo 2. Frontend: cd frontend ^& npm run dev
echo 3. WebSocket: Backend will start WebSocket server on port 4001
echo 4. MailHog: http://localhost:8025
echo 5. Database: localhost:5432
echo.
echo Press any key to exit...
pause > nul
