@echo off
setlocal

cd /d "%~dp0"

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm is not installed or is not available in PATH.
  echo Install pnpm 10 and try again.
  exit /b 1
)

pnpm dev
exit /b %ERRORLEVEL%
