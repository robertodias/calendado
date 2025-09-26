# Admin Console Setup Guide

This document provides instructions for setting up and bootstrapping the Calendado Admin Console with Firebase Authentication and Role-Based Access Control (RBAC).

## 🚀 Quick Start

### 1. Deploy Functions

First, deploy the admin functions to Firebase:

```bash
cd functions
npm run build
npm run deploy
```

### 2. Bootstrap First Superadmin

**⚠️ IMPORTANT**: This is a one-time setup that must be done before anyone can access the admin console.

Choose **ONE** of the following methods to create your first superadmin:

#### Method A: Using Firebase Admin SDK (Recommended)

Create a temporary Node.js script:

```javascript
// bootstrap-admin.js
const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // or use a service account key file:
  // credential: admin.credential.cert('./path/to/serviceAccountKey.json'),
});

async function createSuperadmin() {
  const email = 'your-email@domain.com'; // Replace with your email
  
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      roles: ['superadmin']
    });
    
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      roles: ['superadmin'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      bootstrapped: true
    });
    
    console.log(`✅ Successfully created superadmin: ${email}`);
    console.log(`User UID: ${user.uid}`);
    console.log('🔐 User must sign out and sign back in to see new permissions.');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error('❌ User not found. Please ensure the user has signed in to the app at least once.');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

createSuperadmin().then(() => process.exit(0));
```

Run the script:

```bash
node bootstrap-admin.js
```

#### Method B: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Use Firebase shell to run admin commands
firebase functions:shell

# In the shell, run:
admin.auth().getUserByEmail('your-email@domain.com').then(user => {
  return admin.auth().setCustomUserClaims(user.uid, { roles: ['superadmin'] });
}).then(() => console.log('Superadmin created'));
```

#### Method C: Using a Temporary Cloud Function

Create a temporary function (delete after use):

```typescript
// functions/src/bootstrap.ts
import { onRequest } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const bootstrapSuperadmin = onRequest(
  { cors: true },
  async (request, response) => {
    const SECRET_KEY = 'your-secret-bootstrap-key'; // Change this!
    const SUPERADMIN_EMAIL = 'your-email@domain.com'; // Change this!
    
    if (request.query.secret !== SECRET_KEY) {
      response.status(403).send('Forbidden');
      return;
    }
    
    try {
      const user = await getAuth().getUserByEmail(SUPERADMIN_EMAIL);
      await getAuth().setCustomUserClaims(user.uid, { roles: ['superadmin'] });
      
      await getFirestore().collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        roles: ['superadmin'],
        createdAt: FieldValue.serverTimestamp(),
        bootstrapped: true
      });
      
      response.json({ 
        success: true, 
        message: `Superadmin created: ${SUPERADMIN_EMAIL}`,
        uid: user.uid
      });
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  }
);
```

Deploy and call once, then **delete the function immediately**:

```bash
# Deploy
firebase deploy --only functions:bootstrapSuperadmin

# Call (replace with your secret and project ID)
curl "https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/bootstrapSuperadmin?secret=your-secret-bootstrap-key"

# Delete the function
# Remove from functions/src/index.ts and redeploy
```

### 3. Verify Setup

1. Sign out of the application completely
2. Sign back in with your superadmin email
3. Navigate to `/admin` 
4. Verify you can access all panels and manage roles

## 🔐 Role Definitions

| Role | Permissions |
|------|-------------|
| **superadmin** | Full access: manage roles, all admin functions |
| **admin** | Operate waitlist, content, feature flags (no role management) |
| **support** | Read-only PII access, resend transactional emails |
| **editor** | Edit public content and changelog |
| **viewer** | Read-only analytics and reports |

## 🏗️ Architecture Overview

### Authentication Flow

1. **Google Sign-In**: Users authenticate via Google OAuth
2. **Custom Claims**: Roles stored in Firebase Auth custom claims (authoritative)
3. **Firestore Mirror**: User data mirrored to Firestore for UI queries
4. **Route Guards**: Frontend protects routes based on token claims

### Security Model

- **Custom Claims**: Single source of truth for roles
- **Firestore Rules**: Enforce role-based access at database level  
- **Function Security**: Backend functions validate roles before operations
- **Audit Logging**: All role changes and admin actions logged

### Data Collections

```
firestore/
├── users/{uid}                    # User profiles (roles mirrored)
├── waitlist/{id}                  # Waitlist entries  
├── admin/
│   ├── featureFlags               # Application feature toggles
│   └── auditLogs/
│       └── entries/{id}           # Audit trail
└── email_events/{id}              # Email delivery events
```

## 🛠️ Development

### Local Development

```bash
# Start Firebase emulators
cd functions
npm run emulate

# In another terminal, start the frontend
npm run dev
```

**Note**: In emulator mode, authentication and custom claims work differently. You may need to manually set claims in the emulator UI.

### Adding New Roles

1. Update `UserRole` type in `src/contexts/AuthContext.tsx`
2. Update role validation in `functions/src/handlers/updateUserRoles.ts`
3. Update Firestore security rules in `firestore.rules`
4. Update admin panel permissions as needed

### Environment Variables

Ensure these are set in your environment:

```bash
# Frontend (VITE_ prefixed)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config

# Backend (Firebase Functions secrets)
# Set via: firebase functions:secrets:set SECRET_NAME
RESEND_API_KEY=your_resend_key
FROM_EMAIL=hello@yourdomain.com
# ... other secrets
```

## 🚨 Security Checklist

- [ ] First superadmin created and tested
- [ ] Bootstrap method deleted/secured after use
- [ ] Firestore rules deployed and tested
- [ ] Admin functions deployed with proper authentication
- [ ] All admin users have appropriate minimum roles
- [ ] Audit logging is working
- [ ] Test role changes and token refresh flow

## 🐛 Troubleshooting

### "Not Authorized" after role assignment

**Solution**: User must sign out and sign back in, or call the refresh token function:

```javascript
// In admin console, after role change
await refreshToken();
```

### Functions deployment fails

**Solution**: Check that all required secrets are set:

```bash
firebase functions:secrets:list
```

### Firestore rules not working

**Solution**: Verify custom claims are properly set:

```javascript
// Check in browser console
firebase.auth().currentUser.getIdTokenResult().then(result => {
  console.log('Custom claims:', result.claims);
});
```

### Admin console not loading

**Solution**: Check browser console for Firebase configuration errors and ensure all environment variables are set.

## 📞 Support

For issues with the admin console:

1. Check browser console for errors
2. Verify Firebase configuration
3. Check Firestore security rules
4. Review function logs in Firebase Console
5. Ensure user has proper roles and has refreshed their token

---

**⚠️ Remember to delete any bootstrap functions/scripts after initial setup for security!**
