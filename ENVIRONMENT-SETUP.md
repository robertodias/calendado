# Environment Setup Guide

This guide explains how to set up environment variables for local development and testing.

## 📁 Environment Files

### Frontend (Root Directory)
- **`.env.example`** - Template with placeholder values
- **`.env`** - Local development values (connects to deployed functions)
- **`.env.production`** - Production values (if needed)

### Backend (Functions Directory)
- **`functions/.env.example`** - Template with placeholder values
- **`functions/.env`** - Local development values (for reference only)

## 🚀 Quick Start

### 1. Frontend Setup
The `.env` file is already created with **production Firebase configuration** for local testing:

```bash
# Firebase Configuration (Production values for local testing)
VITE_FIREBASE_API_KEY=AIzaSyB_6q5jQG1WywfsGpJ96VgmQfRSfsQ7T4k
VITE_FIREBASE_AUTH_DOMAIN=calendado-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=calendado-prod
# ... and more
```

**Why production config?** The frontend connects to the deployed Firebase project, which triggers the deployed Firebase Functions automatically when users sign up for the waitlist.

### 2. Backend Setup
The `functions/.env` file is for reference only since functions are deployed:

```bash
# Resend Configuration (Demo values for local testing)
RESEND_API_KEY=re_demo_key_for_local_testing
RESEND_WEBHOOK_SECRET=demo_webhook_secret
# ... and more
```

**Note:** Functions are deployed and running in production. Local `.env` is for reference only.

## 🔧 For Real Development

### Frontend
1. Copy `.env.example` to `.env`
2. Replace placeholder values with your actual Firebase credentials
3. Get Firebase config from [Firebase Console](https://console.firebase.google.com)

### Backend
1. Copy `functions/.env.example` to `functions/.env`
2. Replace placeholder values with your actual Resend credentials
3. Get Resend API key from [Resend Dashboard](https://resend.com)

## 🔒 Security Notes

- **Never commit `.env` files** - they're in `.gitignore`
- **Use `.env.example`** as a template for team members
- **Production secrets** are stored in Google Secret Manager
- **Demo values** are safe for local testing only

## 🧪 Testing

The production configuration allows you to:
- ✅ Run the frontend locally (`npm run dev`)
- ✅ Connect to deployed Firebase project (`calendado-prod`)
- ✅ Trigger deployed Firebase Functions when users sign up
- ✅ Test real email functionality (with production Resend setup)
- ✅ Test webhook endpoints (deployed functions)

## 🔄 How It Works

1. **Frontend** runs locally on `http://localhost:5173`
2. **Firebase** connects to production project (`calendado-prod`)
3. **User signs up** → Frontend writes to Firestore
4. **Firestore trigger** → Deployed function sends email
5. **Email sent** → Resend webhook updates status

## 📚 Next Steps

1. **Local Development**: Use the provided `.env` files
2. **Real Testing**: Replace with actual credentials
3. **Production**: Deploy with Google Secret Manager
4. **Team Setup**: Share `.env.example` files

## 🆘 Troubleshooting

### Frontend Issues
- Check that all `VITE_*` variables are set
- Verify Firebase project configuration
- Ensure `.env` file is in the root directory

### Backend Issues
- Check that all required variables are set
- Verify Resend API key format (`re_*`)
- Ensure `.env` file is in `functions/` directory

### Common Errors
- **"Firebase not configured"**: Check `.env` file exists and has correct values
- **"Invalid API key"**: Verify Resend API key format
- **"Project not found"**: Check Firebase project ID

---

**Need Help?** Check the main README files or contact the development team.
