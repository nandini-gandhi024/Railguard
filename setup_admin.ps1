# RailGuard Secure Administrator Setup Launcher (PowerShell)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$VenvPython = Join-Path $ScriptDir "backend\venv\Scripts\python.exe"
$AdminScript = Join-Path $ScriptDir "backend\setup_admin.py"

if (Test-Path $VenvPython) {
    & $VenvPython $AdminScript @args
} else {
    & python $AdminScript @args
}
