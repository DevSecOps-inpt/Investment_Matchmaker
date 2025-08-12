@echo off
echo Starting Investment Matchmaker Backend...
echo.
cd backend
echo Installing dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server...
python run.py
pause
