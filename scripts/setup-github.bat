@echo off
REM GitHub repository setup script for Calendado
REM This script helps you set up your GitHub repository for automatic deployment

echo ========================================
echo Calendado GitHub Setup
echo ========================================

REM Check if we're in the right directory
if not exist "functions\package.json" (
    echo ERROR: This script must be run from the calendado project root
    exit /b 1
)

REM Check if git is initialized
if not exist ".git" (
    echo Initializing git repository...
    git init
    echo.
)

REM Check if we have a remote origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo ========================================
    echo GitHub Repository Setup Required
    echo ========================================
    echo.
    echo Please follow these steps:
    echo.
    echo 1. Create a new repository on GitHub:
    echo    - Go to https://github.com/new
    echo    - Repository name: calendado
    echo    - Description: Calendado waitlist system with Firebase Functions
    echo    - Make it PRIVATE (recommended for production)
    echo    - Don't initialize with README, .gitignore, or license
    echo.
    echo 2. Add the remote origin:
    echo    git remote add origin https://github.com/YOURUSERNAME/calendado.git
    echo.
    echo 3. Push your code:
    echo    git add .
    echo    git commit -m "Initial commit: Calendado waitlist system"
    echo    git push -u origin main
    echo.
    echo 4. Set up GitHub secrets:
    echo    - Go to your repository Settings ^> Secrets and variables ^> Actions
    echo    - Add FIREBASE_TOKEN secret
    echo    - Generate token with: firebase login:ci
    echo.
    echo 5. Enable branch protection:
    echo    - Go to Settings ^> Branches
    echo    - Add rule for 'main' branch
    echo    - Require pull request reviews
    echo    - Require status checks to pass
    echo.
    pause
    exit /b 0
)

echo.
echo ========================================
echo Repository Status Check
echo ========================================

REM Check git status
echo Checking git status...
git status --porcelain
if errorlevel 1 (
    echo WARNING: There are uncommitted changes
    echo Please commit or stash your changes before pushing
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Pre-deployment Checks
echo ========================================

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found. Please install it first.
    exit /b 1
)

REM Check if we're logged in to Firebase
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not logged in to Firebase. Please run: firebase login
    exit /b 1
)

REM Check if we're using the right project
firebase use calendado-prod >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not using calendado-prod project. Please run: firebase use calendado-prod
    exit /b 1
)

echo.
echo ========================================
echo Ready to Deploy!
echo ========================================

echo.
echo Your repository is ready for automatic deployment!
echo.
echo Next steps:
echo 1. Make sure you've added FIREBASE_TOKEN to GitHub secrets
echo 2. Push your code to trigger deployment:
echo    git add .
echo    git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
echo    git push origin main
echo.
echo 3. Monitor deployment in GitHub Actions
echo 4. Check Firebase Console for function status
echo.

REM Ask if user wants to push now
set /p push_now="Do you want to push to GitHub now? (y/n): "
if /i "%push_now%"=="y" (
    echo.
    echo Pushing to GitHub...
    git add .
    git commit -m "Deploy: %date% %time%"
    git push origin main
    echo.
    echo ✅ Code pushed to GitHub!
    echo Check the Actions tab in your repository to monitor deployment.
) else (
    echo.
    echo No problem! You can push later when you're ready.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your Calendado system is ready for production deployment!
echo.
echo 📊 Monitor deployments: GitHub Actions tab
echo 🔧 Firebase Console: https://console.firebase.google.com/project/calendado-prod
echo 📚 Documentation: See GITHUB-SETUP.md for detailed instructions
echo.
pause
