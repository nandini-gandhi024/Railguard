@echo off
REM RailGuard Secure Administrator Setup Launcher
cd /d "%~dp0"
if exist "backend\venv\Scripts\python.exe" (
    backend\venv\Scripts\python.exe backend\setup_admin.py %*
) else (
    python backend\setup_admin.py %*
)
