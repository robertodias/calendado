# Local Development Setup Guide

This guide explains how to set up your local development environment with the same Firebase configuration as production.

## 🔑 Getting Your Firebase Credentials

You have two options to get the Firebase credentials:

### Option 1: From GitHub Secrets (Easiest)
1. Go to: https://github.com/robertodias/calendado/settings/secrets/actions
2. You'll see all the `VITE_FIREBASE_*` secrets
3. Copy the values (you'll need access to the repository)

### Option 2: From Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project Settings**
4. Scroll down to **Your apps** section
5. Click on the web app (or create one if it doesn't exist)
6. Copy the values from the Firebase SDK snippet:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",           // → VITE_FIREBASE_API_KEY
     authDomain: "...",           // → VITE_FIREBASE_AUTH_DOMAIN
     projectId: "...",            // → VITE_FIREBASE_PROJECT_ID
     storageBucket: "...",        // → VITE_FIREBASE_STORAGE_BUCKET
     messagingSenderId: "...",    // → VITE_FIREBASE_MESSAGING_SENDER_ID
     appId: "1:..."              // → VITE_FIREBASE_APP_ID
   };
   ```

### Getting reCAPTCHA Key
1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Select your site
3. Copy the **Site Key** → `VITE_RECAPTCHA_SITE_KEY`

## 📝 Setting Up Local Environment

### Step 1: Create `.env.local` File

Copy the example file:
```bash
cp .env.local.example .env.local
```

### Step 2: Fill in Your Values

Open `.env.local` and replace the placeholder values with your actual Firebase credentials:

```bash
VITE_FIREBASE_API_KEY=AIzaSyC...your-actual-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_RECAPTCHA_SITE_KEY=6Le...your-site-key
```

### Step 3: Verify Setup

Run the validation script:
```bash
npm run validate-env
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app should now connect to your Firebase project!

## ✅ Verification

You should see in the console:
- ✅ "Firebase initialized successfully" (instead of the warning)
- ✅ No "Firebase not configured" errors
- ✅ Authentication should work

## 🔒 Security Notes

- **`.env.local` is already in `.gitignore`** - your secrets won't be committed
- **Never commit `.env.local`** to git
- **Share credentials securely** with team members (use password managers or secure channels)
- **Rotate credentials** if they're accidentally exposed

## 🐛 Troubleshooting

### Firebase still not working?

1. **Check file name**: Must be exactly `.env.local` (not `.env` or `.env.local.txt`)
2. **Restart dev server**: Stop and restart `npm run dev` after creating/updating `.env.local`
3. **Check variable names**: Must start with `VITE_` prefix
4. **Verify values**: Run `npm run validate-env` to check
5. **Check console**: Look for errors in browser console

### Environment variables not loading?

Vite loads environment variables in this order:
1. `.env.local` (highest priority, not committed to git)
2. `.env.development` or `.env.production` (depending on mode)
3. `.env`
4. System environment variables

If you have multiple files, `.env.local` takes precedence.

## 📚 Additional Resources

- [Vite Environment Variables Docs](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Setup Guide](https://firebase.google.com/docs/web/setup)
- See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for full documentation

