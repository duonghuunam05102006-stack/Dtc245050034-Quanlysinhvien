@echo off
chcp 65001 >nul
echo ================================================================
echo   Đang khởi động Hệ Thống Quản Lý Sinh Viên ICTU...
echo ================================================================
echo.
start http://localhost:3000
node server.js
pause
