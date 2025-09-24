@echo off
REM Production deployment script for Calendado
REM This script ensures all security checks pass before deployment

echo ========================================
echo Calendado Production Deployment
echo ========================================

REM Check if we're in the right directory
if not exist "functions\package.json" (
    echo ERROR: This script must be run from the calendado project root
    exit /b 1
)

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not found. Please install it first.
    exit /b 1
)

REM Check if gcloud CLI is installed
gcloud --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Google Cloud CLI not found. Please install it first.
    exit /b 1
)

echo.
echo Step 1: Running security and quality checks...
echo ========================================

REM Run linting
echo Running ESLint...
cd functions
call npm run lint
if errorlevel 1 (
    echo ERROR: Linting failed. Please fix issues before deploying.
    exit /b 1
)

REM Run tests
echo Running tests...
call npm test
if errorlevel 1 (
    echo ERROR: Tests failed. Please fix issues before deploying.
    exit /b 1
)

REM Build functions
echo Building functions...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed. Please fix issues before deploying.
    exit /b 1
)

cd ..

echo.
echo Step 2: Verifying Firebase project...
echo ========================================

REM Verify Firebase project
firebase use calendado-prod
if errorlevel 1 (
    echo ERROR: Failed to switch to calendado-prod project
    exit /b 1
)

echo.
echo Step 3: Deploying to production...
echo ========================================

REM Deploy functions
echo Deploying Firebase Functions...
firebase deploy --only functions
if errorlevel 1 (
    echo ERROR: Functions deployment failed
    exit /b 1
)

REM Deploy Firestore rules
echo Deploying Firestore rules...
firebase deploy --only firestore:rules
if errorlevel 1 (
    echo ERROR: Firestore rules deployment failed
    exit /b 1
)

REM Deploy hosting
echo Deploying hosting...
firebase deploy --only hosting
if errorlevel 1 (
    echo ERROR: Hosting deployment failed
    exit /b 1
)

echo.
echo Step 4: Post-deployment verification...
echo ========================================

REM Check function status
echo Checking function status...
firebase functions:list

REM Run smoke tests
echo Running smoke tests...
echo Testing webhook endpoint...
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn -H "Content-Type: application/json" -d "{}" --max-time 10
if errorlevel 1 (
    echo WARNING: Webhook endpoint test failed (this might be expected)
)

echo.
echo ========================================
echo ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Function URLs:
echo - Webhook: https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn
echo - Admin Resend: https://us-central1-calendado-prod.cloudfunctions.net/adminResendConfirmationFn
echo - DLQ Replayer: https://us-central1-calendado-prod.cloudfunctions.net/dlqReplayerFn
echo.
echo Next steps:
echo 1. Test the waitlist signup flow
echo 2. Verify email delivery
echo 3. Check function logs: firebase functions:log
echo 4. Monitor error rates in Firebase Console
echo.
