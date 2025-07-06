@echo off
REM 设置项目标题
title 关闭“康康背词器”服务器

echo 正在查找在端口 3000 上运行的服务器...
echo.

REM 使用 netstat 命令查找监听 3000 端口的进程ID (PID)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    set PID=%%a
)

REM 检查是否找到了PID
if not defined PID (
    echo 未找到正在运行的服务器。
    echo.
    pause
    exit
)

echo 找到服务器进程，ID为 %PID%。
echo 正在关闭服务器...
echo.

REM 使用 taskkill 命令根据PID来终止进程
taskkill /F /PID %PID%

echo 服务器已成功关闭。
echo.
pause

