# Environment Variables Configuration

This document provides a comprehensive guide to environment variable configuration in the Calendado project.

## 🎯 **Current Approach: GitHub Secrets + Actions**

Calendado uses **GitHub Secrets** for secure environment variable management with automatic deployment via **GitHub Actions**. This is a professional, secure, and maintainable approach.

### ✅ **Why GitHub Secrets + Actions is Better**
- **Security**: Secrets are encrypted and managed by GitHub
- **Automation**: Automatic deployment on every push to master
- **No Local Configuration**: No need for local `.env` files or scripts
- **Team Friendly**: Centralized secret management
- **CI/CD Best Practices**: Industry-standard deployment pipeline

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
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 site key | `6Le6nNArAAAAANxArJSBlIZ1kGrtQ03N8Z1BkI2K` | Yes (production) |
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

### 2. **GitHub Secrets**
Environment variables are configured as GitHub Secrets in the repository:

- **Location**: `https://github.com/robertodias/calendado/settings/secrets/actions`
- **Required Secrets**:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN` 
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_RECAPTCHA_SITE_KEY`
  - `FIREBASE_SERVICE_ACCOUNT_CALENDADO_PROD` (for deployment)

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
# Start development server (uses demo fallback values for local development)
npm run dev
```

### 2. **Production Deployment**
Production deployment is **automatic** via GitHub Actions:

1. **Push to master branch** → GitHub Actions automatically builds and deploys
2. **Monitor deployment** at `https://github.com/robertodias/calendado/actions`
3. **Manual deployment** (if needed): `npm run deploy`

### 3. **GitHub Secrets Management**
To update environment variables:

1. Go to `https://github.com/robertodias/calendado/settings/secrets/actions`
2. Click "New repository secret"
3. Add/update the required secrets listed above

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

