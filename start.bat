@echo off
echo ===================================================
echo Starting LabelLens - Legal Metrology System
echo Problem Statement ID 26034 (SIH 2026)
echo ===================================================

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "LabelLens Backend" cmd /k "cd backend && uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak > nul

echo Starting React Vite Frontend on http://127.0.0.1:3000 ...
start "LabelLens Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 3000"

echo LabelLens is launching. Opening browser...
timeout /t 2 /nobreak > nul
start http://127.0.0.1:3000

echo System started. Press any key to exit this launcher window.
pause > nul
