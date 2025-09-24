# 🚀 GitHub Repository Setup for Calendado

This guide will help you set up your GitHub repository for automatic deployment to production.

## 📋 Prerequisites

- [ ] GitHub repository created
- [ ] Firebase project: `calendado-prod`
- [ ] Firebase CLI installed and authenticated
- [ ] Google Cloud CLI installed and authenticated

## 🔧 Repository Setup

### 1. Initialize Git Repository

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Calendado waitlist system with Firebase Functions"

# Add remote origin (replace with your GitHub repository URL)
git remote add origin https://github.com/yourusername/calendado.git

# Push to main branch
git push -u origin main
```

### 2. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Required Secrets:
- **`FIREBASE_TOKEN`**: Your Firebase CI token
  ```bash
  # Generate Firebase token
  firebase login:ci
  # Copy the token and add it to GitHub secrets
  ```

#### Optional Secrets (for enhanced security):
- **`RESEND_API_KEY`**: Your Resend API key (if you want to test in CI)
- **`RESEND_WEBHOOK_SECRET`**: Your Resend webhook secret (if you want to test in CI)

### 3. Branch Protection Rules

Go to Settings → Branches → Add rule:

- **Branch name pattern**: `main`
- **Require a pull request before merging**: ✅
- **Require status checks to pass before merging**: ✅
  - Select: `test` and `security-scan`
- **Require branches to be up to date before merging**: ✅
- **Restrict pushes that create files**: ✅

## 🔄 Automatic Deployment Flow

### What Happens on Push to Main:

1. **🧪 Tests Run** (Required)
   - Unit tests
   - Security tests
   - Build verification

2. **🔍 Security Scan** (Required)
   - Vulnerability scanning with Trivy
   - Code quality checks

3. **🚀 Automatic Deployment** (Only if tests pass)
   - Deploy Firebase Functions
   - Deploy Firestore rules
   - Deploy hosting
   - Run post-deployment smoke tests

### What Happens on Pull Requests:

1. **🧪 Tests Run** (Required)
   - Same as main branch
   - No deployment

2. **🔍 Security Scan** (Required)
   - Same as main branch

## 📊 Monitoring Deployments

### GitHub Actions Dashboard
- Go to your repository → Actions tab
- View deployment history and status
- Check logs for any failures

### Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com)
- Select `calendado-prod` project
- Check Functions, Firestore, and Hosting status

### Function Logs
```bash
# View function logs
firebase functions:log

# View specific function logs
firebase functions:log --only sendWaitlistConfirmationFn
```

## 🚨 Troubleshooting

### Common Issues:

1. **Deployment Fails - Tests**
   - Check test logs in GitHub Actions
   - Fix failing tests locally
   - Push fixes to trigger new deployment

2. **Deployment Fails - Firebase Token**
   - Regenerate Firebase token: `firebase login:ci`
   - Update `FIREBASE_TOKEN` secret in GitHub

3. **Deployment Fails - Permissions**
   - Check Firebase project permissions
   - Verify service account roles
   - Check Google Cloud IAM permissions

4. **Functions Not Working**
   - Check function logs
   - Verify secrets are configured
   - Test functions manually

### Rollback Procedure:

```bash
# If deployment fails, you can rollback by:
# 1. Reverting to previous commit
git revert <commit-hash>

# 2. Or manually deploying previous version
git checkout <previous-commit>
firebase deploy --only functions
```

## 🔐 Security Considerations

### Repository Security:
- ✅ Branch protection rules enabled
- ✅ Required status checks before merge
- ✅ No direct pushes to main allowed
- ✅ All secrets stored securely in GitHub

### Deployment Security:
- ✅ Tests must pass before deployment
- ✅ Security scans run on every push
- ✅ Functions deployed with proper secrets
- ✅ Firestore rules deployed with functions

## 📈 Best Practices

### Development Workflow:
1. Create feature branch from `main`
2. Make changes and test locally
3. Push to feature branch
4. Create pull request
5. Wait for CI checks to pass
6. Merge to `main` (triggers deployment)

### Code Quality:
- Write tests for new features
- Follow TypeScript best practices
- Use meaningful commit messages
- Keep functions small and focused

### Security:
- Never commit secrets to repository
- Use environment variables for configuration
- Validate all inputs
- Monitor function logs regularly

## 🎯 Next Steps

1. **Set up the repository** following this guide
2. **Configure GitHub secrets** with your Firebase token
3. **Push your code** to trigger the first deployment
4. **Monitor the deployment** in GitHub Actions
5. **Test the live system** to ensure everything works

## 📞 Support

If you encounter any issues:
- Check GitHub Actions logs
- Check Firebase Console for errors
- Review this documentation
- Check Firebase and Google Cloud documentation

---

**Happy Deploying! 🚀**
