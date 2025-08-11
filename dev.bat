@echo off
echo Starting Investment Matchmaker Development Environment...
echo.

REM Check if .env exists
if not exist ".env" (
    echo Error: .env file not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Check if Docker services are running
echo Checking Docker services...
docker-compose ps | findstr "Up" >nul
if %errorlevel% neq 0 (
    echo Starting Docker services...
    docker-compose up -d
    echo Waiting for services to be ready...
    timeout /t 5 /nobreak > nul
)

echo.
echo Starting development servers...
echo.

REM Start backend in new window
start "Backend + WebSocket" cmd /k "cd backend && npm run start:dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in new window
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers started!
echo.
echo Services:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:4000
echo - WebSocket: ws://localhost:4001
echo - MailHog: http://localhost:8025
echo.
echo Press any key to exit this launcher...
pause > nul
