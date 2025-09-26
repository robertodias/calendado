# Calendado

A modern, internationalized React application for calendar management with Firebase integration.

## 🚀 Features

- **🌍 Internationalization** - Portuguese and English support with browser language detection
- **🔥 Firebase Integration** - Authentication and Firestore database
- **🛡️ Security** - reCAPTCHA protection and form validation
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

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

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
```

**Important**: The app will fall back to demo mode if Firebase credentials are not properly configured. Check the browser console for configuration status.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   └── LoadingSpinner.tsx
├── contexts/           # React Context providers
│   └── LanguageContext.tsx
├── lib/               # Utility libraries
│   ├── cookieUtils.ts
│   ├── emailUtils.ts
│   ├── languageUtils.ts
│   ├── logger.ts
│   └── testUtils.ts
├── locales/           # Translation files
│   ├── en.json
│   └── pt.json
├── pages/             # Page components
│   ├── Dashboard.tsx
│   └── Landing.tsx
├── App.tsx
├── firebase.ts
└── main.tsx
```

## 🔒 Security Features

- **reCAPTCHA v3** - Invisible bot protection in production
- **Email Validation** - Client and server-side validation
- **Duplicate Prevention** - Firestore-based email uniqueness checks
- **Cookie Management** - Secure waitlist tracking

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
