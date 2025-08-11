@echo off
echo Setting up Investment Matchmaker Database...
echo.

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies first...
    cd backend
    npm install
    cd ..
    echo.
)

echo Setting up database...
cd backend

REM Generate Prisma client
echo Generating Prisma client...
npx prisma generate

REM Run database migrations
echo Running database migrations...
npx prisma migrate dev --name init

echo.
echo Database setup complete!
echo.
echo To view your database in the browser, run:
echo npm run db:studio
echo.
echo Press any key to exit...
pause > nul
