# Environment Variables Configuration

This document provides a comprehensive guide to environment variable configuration in the Calendado project.

## 🎯 **Current Approach: Environment Variables (Not .env Files)**

Calendado uses environment variables set by the hosting platform or deployment script, **not** `.env` files. This approach is more secure and professional.

### ✅ **Why Environment Variables are Better**
- **Security**: Secrets are stored securely by the hosting platform
- **No Git Pollution**: Secrets never end up in your repository
- **Environment Separation**: Different values for dev/staging/production
- **Team Friendly**: Everyone gets the same environment without sharing files

## 📋 **Environment Variables Reference**

### Frontend Variables (VITE_ prefixed)

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `demo-key` | Yes (production) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `demo.firebaseapp.com` | Yes (production) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `demo-project` | Yes (production) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `demo.appspot.com` | Yes (production) |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` | Yes (production) |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:demo` | Yes (production) |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key | `6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K` | Yes (production) |
| `VITE_APP_ENV` | Application environment | `production` | No |
| `VITE_APP_BASE_URL` | Application base URL | `https://calendado.com` | No |
| `VITE_DEBUG_MODE` | Debug mode flag | `false` (prod), `true` (dev) | No |

### Backend Variables (Firebase Functions Secrets)

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_BASE_URL` | Application base URL for email templates | Yes |
| `RESEND_API_KEY` | Resend API key for email sending | Yes |
| `FROM_EMAIL` | From email address | Yes |
| `FROM_NAME` | From name for emails | Yes |
| `RESEND_WEBHOOK_SECRET` | Webhook secret for Resend | Yes |

### Built-in Vite Variables (Automatically Provided)

| Variable | Description | Values |
|----------|-------------|--------|
| `import.meta.env.DEV` | Development mode flag | `true` (dev), `false` (prod) |
| `import.meta.env.PROD` | Production mode flag | `false` (dev), `true` (prod) |
| `import.meta.env.MODE` | Current mode | `development`, `production` |
| `import.meta.env.BASE_URL` | Base URL for the app | `/` |

## 🔧 **Configuration Files**

### 1. **vite.config.ts**
All frontend environment variables are defined in the `define` section:

```typescript
define: {
  // Built-in Vite environment variables
  'import.meta.env.DEV': JSON.stringify(mode === 'development'),
  'import.meta.env.PROD': JSON.stringify(mode === 'production'),
  'import.meta.env.MODE': JSON.stringify(mode),
  'import.meta.env.BASE_URL': JSON.stringify('/'),
  
  // App configuration
  'import.meta.env.VITE_APP_ENV': JSON.stringify(getEnvValue('VITE_APP_ENV', mode)),
  'import.meta.env.VITE_APP_BASE_URL': JSON.stringify(getEnvValue('VITE_APP_BASE_URL', 'https://calendado.com')),
  'import.meta.env.VITE_DEBUG_MODE': JSON.stringify(getEnvValue('VITE_DEBUG_MODE', mode === 'development' ? 'true' : 'false')),
  
  // Firebase configuration
  'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(getEnvValue('VITE_FIREBASE_API_KEY', 'demo-key')),
  // ... other Firebase variables
  
  // reCAPTCHA configuration
  'import.meta.env.VITE_RECAPTCHA_SITE_KEY': JSON.stringify(getEnvValue('VITE_RECAPTCHA_SITE_KEY', '6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K')),
}
```

### 2. **.env.example**
Template file with all required environment variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# App Configuration
VITE_APP_ENV=production
VITE_APP_BASE_URL=https://calendado.com
VITE_DEBUG_MODE=false

# Firebase Functions Configuration
APP_BASE_URL=https://calendado.com
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=noreply@calendado.com
FROM_NAME=Calendado
RESEND_WEBHOOK_SECRET=your_webhook_secret_here
```

## 🛠️ **Validation Tools**

### Environment Variable Validation Script
A comprehensive validation script is available at `scripts/validate-env.js`:

```bash
# Run validation
npm run validate-env

# Or directly
node scripts/validate-env.js
```

The script checks for:
- ✅ All environment variables are properly defined in Vite config
- ✅ No missing variable definitions
- ✅ No case sensitivity issues
- ✅ Consistent usage across frontend and backend

## 🚀 **Setup Instructions**

### 1. **Development Setup**
```bash
# Start development server (uses fallback values for local development)
npm run dev
```

### 2. **Production Deployment**
```bash
# Deploy with environment variables (recommended)
npm run deploy

# Or deploy without environment variables (uses fallback values)
npm run deploy:production
```

### 3. **Manual Environment Variable Setup**
```bash
# Set environment variables manually
export VITE_FIREBASE_API_KEY="your_actual_api_key"
export VITE_FIREBASE_PROJECT_ID="your_actual_project_id"
# ... other variables

# Then build and deploy
npm run build
firebase deploy --only hosting
```

### 3. **Firebase Functions Setup**
```bash
# Set secrets in Firebase
firebase functions:secrets:set APP_BASE_URL
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set FROM_EMAIL
firebase functions:secrets:set FROM_NAME
firebase functions:secrets:set RESEND_WEBHOOK_SECRET

# Deploy functions
firebase deploy --only functions
```

## 🔍 **Troubleshooting**

### Common Issues

1. **"Firebase not configured" error**
   - Check that all `VITE_FIREBASE_*` variables are set
   - Verify they're not using demo values in production
   - Run `npm run validate-env` to check configuration

2. **Environment variables not loading**
   - Ensure variables are prefixed with `VITE_` for frontend
   - Check that they're defined in `vite.config.ts`
   - Restart the development server after changes

3. **Case sensitivity issues**
   - Use consistent casing (UPPER_CASE for environment variables)
   - Run validation script to detect issues

### Debug Commands

```bash
# Validate environment configuration
npm run validate-env

# Check build output
npm run build

# Test in development
npm run dev
```

## 📝 **Best Practices**

1. **Always use the validation script** before deploying
2. **Keep .env.example up to date** with all required variables
3. **Use descriptive variable names** with consistent casing
4. **Document any new environment variables** in this file
5. **Test both development and production builds** after changes

## 🔄 **Maintenance**

- Run `npm run validate-env` regularly to ensure consistency
- Update this document when adding new environment variables
- Keep `.env.example` synchronized with actual requirements
- Monitor for any new environment variable usage in the codebase

