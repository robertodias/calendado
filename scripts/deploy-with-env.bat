@echo off
REM Calendado Production Deployment Script
REM This script sets environment variables and deploys to Firebase Hosting

echo 🚀 Starting Calendado production deployment...

REM Set environment variables for production
set VITE_FIREBASE_API_KEY=AIzaSyB_6q5jQG1WywfsGpJ96VgmQfRSfsQ7T4k
set VITE_FIREBASE_AUTH_DOMAIN=calendado-prod.firebaseapp.com
set VITE_FIREBASE_PROJECT_ID=calendado-prod
set VITE_FIREBASE_STORAGE_BUCKET=calendado-prod.firebasestorage.app
set VITE_FIREBASE_MESSAGING_SENDER_ID=335629698770
set VITE_FIREBASE_APP_ID=1:335629698770:web:935cd9c33c5b03ab354f0b
set VITE_RECAPTCHA_SITE_KEY=6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K
set VITE_APP_ENV=production
set VITE_APP_BASE_URL=https://calendado.com
set VITE_DEBUG_MODE=false

echo ✅ Environment variables set for production deployment
echo    Firebase API Key: %VITE_FIREBASE_API_KEY:~0,10%...
echo    Firebase Project ID: %VITE_FIREBASE_PROJECT_ID%
echo    App Environment: %VITE_APP_ENV%

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist dist rmdir /s /q dist

REM Build the project
echo 🔨 Building project...
call npm run build

REM Verify build
if not exist dist (
    echo ❌ Build failed - dist directory not found
    exit /b 1
)

echo ✅ Build completed successfully

REM Deploy to Firebase Hosting
echo 🚀 Deploying to Firebase Hosting...
call firebase deploy --only hosting

echo 🎉 Deployment complete!
echo    Site: https://calendado.com
