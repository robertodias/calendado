#!/bin/bash

# Calendado Production Deployment Script
# This script sets environment variables and deploys to Firebase Hosting

set -e  # Exit on any error

echo "🚀 Starting Calendado production deployment..."

# Set environment variables for production
export VITE_FIREBASE_API_KEY="AIzaSyB_6q5jQG1WywfsGpJ96VgmQfRSfsQ7T4k"
export VITE_FIREBASE_AUTH_DOMAIN="calendado-prod.firebaseapp.com"
export VITE_FIREBASE_PROJECT_ID="calendado-prod"
export VITE_FIREBASE_STORAGE_BUCKET="calendado-prod.firebasestorage.app"
export VITE_FIREBASE_MESSAGING_SENDER_ID="335629698770"
export VITE_FIREBASE_APP_ID="1:335629698770:web:935cd9c33c5b03ab354f0b"
export VITE_RECAPTCHA_SITE_KEY="6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K"
export VITE_APP_ENV="production"
export VITE_APP_BASE_URL="https://calendado.com"
export VITE_DEBUG_MODE="false"

echo "✅ Environment variables set for production deployment"
echo "   Firebase API Key: ${VITE_FIREBASE_API_KEY:0:10}..."
echo "   Firebase Project ID: $VITE_FIREBASE_PROJECT_ID"
echo "   App Environment: $VITE_APP_ENV"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🔨 Building project..."
npm run build

# Verify build
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully"

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "🎉 Deployment complete!"
echo "   Site: https://calendado.com"
