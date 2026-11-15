@echo off
rem Build the project with MSBuild, optionally running the tests.
setlocal EnableExtensions EnableDelayedExpansion

set "ROOT=%~dp0"
set CONFIG=Release
set PLATFORM=x64
set /a JOBS=%NUMBER_OF_PROCESSORS% * 2
set RUN_TESTS=

:parse
if "%~1"=="" goto :build
if /i "%~1"=="-c" (set "CONFIG=%~2" & shift & shift & goto :parse)
if /i "%~1"=="-t" (set RUN_TESTS=1) & shift & goto :parse
echo Unknown option: %1 1>&2
exit /b 2

:build
if not exist "%ROOT%build\" mkdir "%ROOT%build"
for /f "usebackq delims=" %%v in (`git describe --tags --always`) do set "VERSION=%%v"
echo Building %VERSION% (%CONFIG%^|%PLATFORM%) with %JOBS% jobs...

msbuild "%ROOT%project.sln" /m:%JOBS% /p:Configuration=%CONFIG% ^
    /p:Platform=%PLATFORM% /nologo /v:m >"%ROOT%build\msbuild.log" 2>&1
if errorlevel 1 (
    echo Build failed, see build\msbuild.log
    exit /b 1
) else if defined RUN_TESTS (
    for %%t in ("%ROOT%build\%CONFIG%\*_test.exe") do (
        echo Running %%~nxt
        "%%~t" || set /a FAILED+=1
    )
)

if !FAILED! GTR 0 echo !FAILED! test(s) failed & exit /b 1
echo Done.
endlocal
goto :eof
