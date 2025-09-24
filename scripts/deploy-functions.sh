#!/bin/bash

# Calendado Functions Deployment Script
# This script deploys the Firebase Functions with proper configuration

set -e

echo "🚀 Starting Calendado Functions Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Navigate to functions directory
cd functions

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building functions..."
npm run build

echo "🧪 Running tests..."
npm test

echo "🔍 Linting code..."
npm run lint

echo "📝 Formatting code..."
npm run format

echo "🚀 Deploying functions..."
firebase deploy --only functions

echo "✅ Functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up Resend domain verification for updates.calendado.com"
echo "2. Configure Resend webhook URL: https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn"
echo "3. Test the waitlist confirmation flow"
echo "4. Monitor function logs: firebase functions:log"
