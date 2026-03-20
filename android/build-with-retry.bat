@echo off
setlocal enabledelayedexpansion
REM ------------------------------------------------------------------
REM build-with-retry.bat
REM Workaround for Sophos endpoint protection blocking Gradle's
REM atomic directory renames in the transforms cache on Windows.
REM After each failed build it renames orphaned tmp workspaces to
REM their immutable location (Sophos has already released the lock
REM by then) and retries.
REM ------------------------------------------------------------------

set MAX_RETRIES=6
set TRANSFORMS_DIR=%USERPROFILE%\.gradle\caches\8.8\transforms
set GRADLE_CMD=gradlew.bat app:assembleDebug -x lint -x test --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=arm64-v8a,armeabi-v7a

for /L %%i in (1,1,%MAX_RETRIES%) do (
    echo.
    echo ===============================================
    echo   BUILD ATTEMPT %%i of %MAX_RETRIES%
    echo ===============================================
    echo.

    call %GRADLE_CMD%
    if !errorlevel! equ 0 (
        echo.
        echo BUILD SUCCEEDED on attempt %%i
        goto :done
    )

    echo.
    echo Build failed. Fixing stale transform workspaces...
    timeout /t 3 /nobreak >nul

    REM Rename orphaned temp workspaces (HASH-UUID) to immutable locations (HASH)
    if exist "%TRANSFORMS_DIR%" (
        for /d %%D in ("%TRANSFORMS_DIR%\*-*-*-*-*") do (
            REM Extract the hash part (everything before the first UUID segment)
            set "FULL=%%~nxD"
            REM The hash is the first 32 hex chars
            set "HASH=!FULL:~0,32!"
            set "TARGET=%TRANSFORMS_DIR%\!HASH!"

            if not exist "!TARGET!" (
                echo   Renaming: %%~nxD -^> !HASH!
                rename "%%D" "!HASH!" 2>nul
                if !errorlevel! neq 0 (
                    echo   [WARN] Rename failed, trying copy...
                    xcopy "%%D" "!TARGET!\" /E /I /Q /Y >nul 2>&1
                    if !errorlevel! equ 0 (
                        rmdir /s /q "%%D" 2>nul
                        echo   [OK] Copied and cleaned up
                    )
                ) else (
                    echo   [OK] Renamed successfully
                )
            ) else (
                REM Immutable location already exists; remove stale temp
                rmdir /s /q "%%D" 2>nul
            )
        )
    )
)

echo.
echo BUILD FAILED after %MAX_RETRIES% attempts.
exit /b 1

:done
exit /b 0
