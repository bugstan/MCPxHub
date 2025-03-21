@echo off
setlocal

echo ===================================================
echo MCP x Hub Release Verification Script
echo ===================================================
echo.

echo Step 1: Checking git status...
git status
echo.
set /p CONTINUE=Is the working directory clean? (y/n): 
if /i not "%CONTINUE%"=="y" (
    echo Please commit all changes before release.
    goto :end
)
echo.

echo Step 2: Building project...
call pnpm build
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    goto :end
)
echo Build successful.
echo.

echo Step 3: Bundling project...
call pnpm bundle
if %ERRORLEVEL% neq 0 (
    echo Bundle failed!
    goto :end
)
echo Bundle successful.
echo.

echo Step 4: Testing bundled application...
echo.
echo This step will start the application for testing.
echo Please have JetBrains IDE or VS Code running with MCP plugin installed.
echo.
set /p CONTINUE=Ready to run the test? (y/n): 
if /i not "%CONTINUE%"=="y" (
    goto :skip_test
)

REM Set environment variables
set LOG_ENABLED=true
set IDE_TYPE=jetbrains
echo.
echo Starting MCP x Hub in test mode...
echo Press Ctrl+C to stop the test when finished.
echo.
echo --------------------------------------------------
node dist/bundle.js
echo --------------------------------------------------
echo.

:skip_test
echo Step 5: Verifying release checklist:
echo.
echo 1. Verify package version in package.json
echo 2. Build and bundle are successful
echo 3. GitHub workflow file is updated
echo.

echo Release preparation checklist:
echo.
echo - Commit all changes
echo - Create and push a new tag (git tag v1.0.x)
echo - Create a new release on GitHub based on this tag
echo - Ensure NPM_TOKEN is set in GitHub repository secrets
echo - Verify GitHub Actions workflow execution
echo.

set /p CREATE_TAG=Do you want to create a tag now? Enter version (e.g. 1.0.5) or leave empty to skip: 
if "%CREATE_TAG%"=="" goto :no_tag
echo Creating tag v%CREATE_TAG%...
git tag v%CREATE_TAG%

set /p PUSH_TAG=Push tag to GitHub? (y/n): 
if /i "%PUSH_TAG%"=="y" (
    git push origin v%CREATE_TAG%
    echo Tag v%CREATE_TAG% created and pushed.
) else (
    echo Tag created but not pushed. Use 'git push origin v%CREATE_TAG%' to push.
)
goto :end_tag

:no_tag
echo Skipping tag creation.

:end_tag
echo.
echo Release verification complete!
echo.

:end
endlocal
