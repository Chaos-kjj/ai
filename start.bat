@echo off
REM 设置项目标题
title 康康背词器 - 本地服务器

REM 切换到您的项目文件夹路径
cd /d "C:\Users\10562\Desktop\ai"

REM 检查Ollama是否正在运行 (这是一个简单的检查，可能不完全准确)
echo 正在检查Ollama服务状态...
tasklist /FI "IMAGENAME eq ollama.exe" | find "ollama.exe" > nul
if %errorlevel% == 0 (
    echo Ollama服务已在运行。
) else (
    echo Ollama服务未运行。如果您尚未手动启动Ollama，请先启动它。
)

echo.
echo 正在启动“康康背词器”本地服务器...
echo 您可以随时在这个窗口按 Ctrl+C 来关闭服务器。
echo.

REM 启动Node.js服务器
start "KangKang Reciter Server" node server.js

REM 等待几秒钟让服务器有时间启动
timeout /t 3 /nobreak > nul

REM 自动在默认浏览器中打开应用
echo 正在浏览器中打开应用...
start http://localhost:3000

