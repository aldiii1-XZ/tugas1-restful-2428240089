@echo off
cd /d "%~dp0"
node verify-postman.js
if errorlevel 1 exit /b 1
node run-postman-tests.js
exit /b %errorlevel%
