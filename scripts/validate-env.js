#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * 
 * This script validates that all required environment variables are available
 * for the Calendado application. Environment variables should be set by the
 * hosting platform or deployment script, not through .env files.
 */

// Required environment variables
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_RECAPTCHA_SITE_KEY',
  'VITE_APP_ENV',
  'VITE_APP_BASE_URL',
  'VITE_DEBUG_MODE'
];

// Demo/fallback values that should not be used in production
const DEMO_VALUES = {
  'VITE_FIREBASE_API_KEY': 'demo-key',
  'VITE_FIREBASE_AUTH_DOMAIN': 'demo.firebaseapp.com',
  'VITE_FIREBASE_PROJECT_ID': 'demo-project',
  'VITE_FIREBASE_STORAGE_BUCKET': 'demo.appspot.com',
  'VITE_FIREBASE_MESSAGING_SENDER_ID': '123456789',
  'VITE_FIREBASE_APP_ID': '1:123456789:web:demo'
};

function validateEnvironmentVariables() {
  console.log('🔍 Validating Calendado environment variables...\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check each required variable
  REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName];
    const demoValue = DEMO_VALUES[varName];
    
    if (!value) {
      console.log(`❌ ${varName}: Not set`);
      hasErrors = true;
    } else if (demoValue && value === demoValue) {
      console.log(`⚠️  ${varName}: Using demo value (${demoValue})`);
      hasWarnings = true;
    } else {
      const displayValue = varName.includes('KEY') || varName.includes('ID') 
        ? `${value.substring(0, 10)}...` 
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });
  
  console.log('\n📋 Summary:');
  
  if (hasErrors) {
    console.log('❌ Validation failed - missing required environment variables');
    console.log('\n💡 To fix this:');
    console.log('   1. Run: npm run deploy (uses built-in environment variables)');
    console.log('   2. Or set environment variables in your hosting platform');
    console.log('   3. Or set them manually: export VITE_FIREBASE_API_KEY="your-key"');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  Validation completed with warnings');
    console.log('\n💡 Recommendations:');
    console.log('   - Use production values instead of demo values');
    console.log('   - Run: npm run deploy for production deployment');
    process.exit(0);
  } else {
    console.log('✅ All environment variables are properly configured');
    console.log('🚀 Ready for deployment!');
    process.exit(0);
  }
}

// Run validation
validateEnvironmentVariables();