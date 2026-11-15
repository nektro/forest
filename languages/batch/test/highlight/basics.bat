@echo off
:: <- keyword
:: ^ function.builtin
:main
:: <- label
set "NAME=%~1"
:: <- keyword
::    ^ variable
::         ^ variable.parameter
if /i "%NAME%"=="x" goto :main
:: <- keyword.conditional
::  ^ keyword.conditional
::     ^ variable
::            ^ operator
::                  ^ function.builtin
::                       ^ label
for %%f in (*.txt) do type "%%f" >nul 2>&1
:: <- keyword.repeat
::  ^ variable.parameter
::      ^ keyword.repeat
::                 ^ keyword.repeat
::                            ^ variable.parameter
::                               ^ operator
::                                    ^ operator
msbuild /m echo^&x !delayed!
:: <- function.call
::      ^ variable.parameter
::             ^ string.escape
::                 ^ variable
