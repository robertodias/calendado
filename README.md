# Calendado

A modern, internationalized React application for calendar management with Firebase integration and comprehensive admin console.

## 🚀 Features

- **🌍 Internationalization** - Portuguese and English support with browser language detection
- **🔥 Firebase Integration** - Authentication, Firestore database, and Cloud Functions
- **👑 Admin Console** - Complete RBAC system with role-based access control
- **🛡️ Security** - reCAPTCHA protection, form validation, and secure admin functions
- **📱 Responsive Design** - Mobile-first approach with TailwindCSS
- **⚡ Performance** - Optimized bundle with code splitting
- **🔧 Developer Experience** - Comprehensive linting, formatting, and error handling

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **Backend**: Firebase (Auth + Firestore)
- **Security**: Google reCAPTCHA v3
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

## 📦 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking

# Utilities
npm run clean        # Clean build artifacts
npm run pre-commit   # Run all checks before commit
```

## 🌍 Internationalization

The app supports automatic language detection based on browser settings:

- **Portuguese** (`pt`) - Default for Portuguese browsers
- **English** (`en`) - Default for all other languages

Language preferences are saved in localStorage and persist across sessions.

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd calendado
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

### Environment Variables

**🔐 Production Deployment:** Environment variables are managed via **GitHub Secrets** and automatically injected during CI/CD deployment. See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed configuration.

**🏠 Local Development:** The app will fall back to demo mode if Firebase credentials are not configured. For local development with real Firebase:
- Check [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for setup instructions
- The app gracefully handles missing configuration and shows appropriate warnings in console

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin console components
│   │   ├── AuditLogsPanel.tsx
│   │   ├── FeatureFlagsPanel.tsx
│   │   ├── UsersRolesPanel.tsx
│   │   └── WaitlistPanel.tsx
│   ├── AdminRouteGuard.tsx
│   ├── ErrorBoundary.tsx
│   └── LoadingSpinner.tsx
├── contexts/           # React Context providers
│   ├── AuthContext.tsx  # Firebase Auth with RBAC
│   └── LanguageContext.tsx
├── lib/               # Utility libraries
│   ├── cookieUtils.ts
│   ├── crypto.ts
│   ├── emailUtils.ts
│   ├── languageUtils.ts
│   ├── logger.ts
│   └── waitlistUtils.ts
├── locales/           # Translation files
│   ├── en.json
│   └── pt.json
├── pages/             # Page components
│   ├── Admin.tsx      # Admin console main page
│   └── Landing.tsx    # Public landing page
├── types/             # TypeScript type definitions
│   └── models.ts
├── App.tsx            # Main app component with routing
├── firebase.ts        # Firebase configuration
└── main.tsx          # Application entry point
```

### Backend Structure (Firebase Functions)

```
functions/src/
├── handlers/          # Function handlers
│   ├── adminResendConfirmation.ts
│   ├── dlqReplayer.ts
│   ├── healthCheck.ts
│   ├── resendWebhook.ts
│   ├── sendWaitlistConfirmation.ts
│   └── updateUserRoles.ts    # RBAC role management
├── lib/              # Shared utilities
│   ├── circuitBreaker.ts
│   ├── config.ts
│   ├── crypto.ts
│   ├── email.ts
│   ├── errorHandler.ts
│   ├── firestore.ts
│   ├── i18n.ts
│   ├── monitoring.ts
│   ├── rateLimiter.ts
│   ├── recaptcha.ts
│   ├── resend.ts
│   ├── sanitizer.ts
│   ├── security.ts
│   └── validation.ts
├── types/            # TypeScript definitions
│   └── models.ts
└── index.ts          # Functions export
```

## 🔒 Security Features

### Public Application
- **reCAPTCHA v3** - Invisible bot protection in production
- **Email Validation** - Client and server-side validation
- **Duplicate Prevention** - Firestore-based email uniqueness checks
- **Cookie Management** - Secure waitlist tracking

### Admin Console Security
- **Role-Based Access Control (RBAC)** - 5 distinct user roles with granular permissions
- **Firebase Auth Integration** - Google Sign-In with custom claims
- **Route Protection** - Client-side route guards based on user roles
- **Firestore Security Rules** - Database-level access control enforcement
- **Audit Logging** - Complete activity tracking for all admin actions
- **Secure Role Management** - Server-side only role assignment via Cloud Functions

## 👑 Admin Console Features

The admin console provides comprehensive management tools with role-based access:

### User Roles
- **superadmin** - Full system access, role management
- **admin** - Waitlist management, feature flags, content
- **support** - Read-only access to user data, email resending
- **editor** - Content and changelog management
- **viewer** - Read-only analytics and reports

### Admin Panels
1. **👥 Users & Roles** - Search users, view roles, manage permissions (superadmin only)
2. **📋 Waitlist Management** - Filter, search, export waitlist entries
3. **🚀 Feature Flags** - Toggle application features in real-time
4. **📊 Audit Logs** - Complete administrative activity tracking

### Access the Admin Console
- **URL**: `/admin`
- **Authentication**: Google Sign-In required
- **Authorization**: Requires admin, superadmin, or support role
- **Setup**: See [ADMIN_SETUP.md](./ADMIN_SETUP.md) for configuration

## 📱 Responsive Design

The application is built with a mobile-first approach using TailwindCSS:

- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Enhanced layout for tablets (768px+)
- **Desktop**: Full-featured desktop experience (1024px+)

## 🚀 Deployment

The app is configured for Firebase Hosting with automatic deployments:

1. **Manual deployment:**
   ```bash
   firebase deploy --only hosting
   ```

2. **Automatic deployment:** Push to `master` branch triggers GitHub Actions

## 🧪 Testing

Development utilities are available in the browser console:

```javascript
// Check waitlist status
checkWaitlistStatus()

// Clear waitlist cookie (for testing)
clearWaitlistForTesting()

// Simulate joined user
simulateJoinedUser()
```

## 📊 Performance

- **Bundle Analysis**: Run `npm run build:analyze` for detailed bundle analysis
- **Code Splitting**: Automatic vendor and feature-based chunking
- **Tree Shaking**: Unused code elimination
- **Minification**: ESBuild for fast, efficient builds

## 🔧 Code Quality

- **ESLint**: Comprehensive linting rules with TypeScript support
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Error Boundaries**: Graceful error handling
- **Logging**: Environment-aware logging system

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `npm run pre-commit`
5. Submit a pull request

## 📄 License

This project is private and proprietary.
# Firebase config via GitHub Secrets
