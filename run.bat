@echo off
echo Starting Investment Matchmaker with npm...
echo.

REM Check if node_modules exists in root
if not exist "node_modules" (
    echo Installing dependencies...
    npm run install:all
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Check if backend node_modules exists
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
    echo Backend dependencies installed!
    echo.
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo Frontend dependencies installed!
    echo.
)

echo Starting development servers...
echo.
echo Services will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:4000
echo - WebSocket: ws://localhost:4001
echo - API Docs: http://localhost:4000/docs
echo.
echo Press any key to start both services...
pause > nul

REM Start both services using npm
npm run dev
