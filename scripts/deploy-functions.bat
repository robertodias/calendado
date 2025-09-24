@echo off
REM Calendado Functions Deployment Script for Windows
REM This script deploys the Firebase Functions with proper configuration

setlocal enabledelayedexpansion

echo 🚀 Starting Calendado Functions Deployment...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please run:
    echo firebase login
    exit /b 1
)

REM Navigate to functions directory
cd functions

echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🔧 Building functions...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build functions
    exit /b 1
)

echo 🧪 Running tests...
call npm test
if %errorlevel% neq 0 (
    echo ❌ Tests failed
    exit /b 1
)

echo 🔍 Linting code...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed
    exit /b 1
)

echo 📝 Formatting code...
call npm run format

echo 🚀 Deploying functions...
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    exit /b 1
)

echo ✅ Functions deployed successfully!
echo.
echo 📋 Next steps:
echo 1. Set up Resend domain verification for updates.calendado.com
echo 2. Configure Resend webhook URL: https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn
echo 3. Test the waitlist confirmation flow
echo 4. Monitor function logs: firebase functions:log
