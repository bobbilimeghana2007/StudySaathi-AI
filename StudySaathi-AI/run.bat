@echo off
TITLE StudySaathi AI - Open-Source Study Companion
COLOR 0A

echo =======================================================
echo          🚀 STUDYSAATHI AI 2.0 - STARTUP SYSTEM
echo     An Open-Source Study Companion for School & College
echo    Multilingual (EN / Telugu / Hindi) + Voice + Diagrams
echo =======================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo [ERROR] Python is not found in your PATH.
    echo Please install Python 3.10+ from python.org and check "Add Python to PATH".
    pause
    exit /b
)

echo [1/3] Checking Python dependencies...
python -m pip install -r requirements.txt --quiet

echo [2/3] Checking Local AI Engine...
echo Notice: Running with Instant Zero-Lag Engine + Ollama integration.
echo.

echo [3/3] Launching StudySaathi AI Server...
echo 🌐 Opening Web Interface in your default browser: http://localhost:5000/login
echo.

start http://localhost:5000/login
python backend/app.py

pause
