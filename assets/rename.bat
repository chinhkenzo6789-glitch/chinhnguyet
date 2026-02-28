@echo off
setlocal enabledelayedexpansion

REM Đổi tên tạm để tránh trùng
set count=1
for %%f in (*.jpg *.jpeg *.png) do (
    ren "%%f" "temp_!count!%%~xf"
    set /a count+=1
)

REM Đổi từ temp sang 001, 002...
set count=1
for %%f in (temp_*) do (
    set num=00!count!
    set num=!num:~-3!
    ren "%%f" "!num!%%~xf"
    set /a count+=1
)

echo Done!
pause