# 🚀 Calendado Production Deployment Guide

This guide covers the complete production deployment process for the Calendado waitlist confirmation system.

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] All secrets are stored in Google Secret Manager
- [ ] Firebase project has billing enabled
- [ ] Firestore security rules are properly configured
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] Webhook signature verification is working
- [ ] Admin authentication is properly configured

### ✅ Infrastructure Requirements
- [ ] Firebase project: `calendado-prod`
- [ ] Resend domain: `updates.calendado.com` (verified)
- [ ] Resend webhook configured
- [ ] Google Cloud CLI installed and authenticated
- [ ] Firebase CLI installed and authenticated

### ✅ Code Quality Requirements
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No security vulnerabilities detected
- [ ] TypeScript compilation successful

## 🔧 Deployment Process

### 1. Automated Deployment (Recommended)

```bash
# Run the production deployment script
./scripts/deploy-production.bat
```

This script will:
- Run all security and quality checks
- Build the functions
- Deploy to Firebase
- Run post-deployment verification

### 2. Manual Deployment

```bash
# 1. Install dependencies
cd functions
npm ci

# 2. Run tests
npm test

# 3. Run linting
npm run lint

# 4. Build functions
npm run build

# 5. Deploy to Firebase
cd ..
firebase deploy --only functions,firestore:rules,hosting
```

## 🔐 Security Configuration

### Secrets Management
All sensitive data is stored in Google Secret Manager:

```bash
# Verify secrets are configured
gcloud secrets list --project=calendado-prod
```

Required secrets:
- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `FROM_EMAIL`
- `FROM_NAME`
- `APP_BASE_URL`

### Firestore Security Rules
The Firestore rules enforce:
- Public read access to waitlist collection (for duplicate checking)
- Server-only access to email events and dead letter queue
- Strict validation of waitlist document structure
- Prevention of client-side updates to sensitive fields

### Rate Limiting
- **General endpoints**: 10 requests per minute per IP
- **Webhook endpoints**: 100 requests per minute per IP
- **Admin endpoints**: 5 requests per minute per user

## 📊 Monitoring & Observability

### Function Logs
```bash
# View all function logs
firebase functions:log

# View specific function logs
firebase functions:log --only sendWaitlistConfirmationFn
```

### Error Monitoring
- Check Firebase Console for function errors
- Monitor dead letter queue for failed emails
- Set up alerts for high error rates

### Performance Monitoring
- Monitor function execution times
- Track memory usage
- Monitor cold start frequency

## 🧪 Testing

### Unit Tests
```bash
cd functions
npm test
```

### Integration Tests
```bash
# Test waitlist signup
curl -X POST https://calendado.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Test webhook (requires valid signature)
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <signature>" \
  -d '{"type":"email.delivered","data":{"messageId":"123","email":"test@example.com"}}'
```

### Smoke Tests
The deployment script includes automated smoke tests to verify:
- Function endpoints are accessible
- Basic request/response flow works
- Error handling is working

## 🔄 Rollback Procedure

If deployment fails or issues are detected:

```bash
# 1. Check function status
firebase functions:list

# 2. View recent deployments
firebase functions:log --only sendWaitlistConfirmationFn

# 3. If needed, redeploy previous version
git checkout <previous-commit>
firebase deploy --only functions
```

## 📈 Performance Optimization

### Function Configuration
- **Memory**: 256MiB (optimized for email processing)
- **Timeout**: 60 seconds (sufficient for email sending)
- **Region**: us-central1 (optimal for Resend API)

### Caching Strategy
- Email templates are cached in memory
- Resend client is reused across requests
- Firestore connections are pooled

### Scaling Considerations
- Functions auto-scale based on demand
- Firestore can handle high write volumes
- Resend API has rate limits (monitor usage)

## 🚨 Incident Response

### Common Issues

1. **Function Deployment Fails**
   - Check Firebase CLI authentication
   - Verify project permissions
   - Check for TypeScript compilation errors

2. **Email Sending Fails**
   - Verify Resend API key is correct
   - Check Resend domain verification
   - Monitor dead letter queue

3. **Webhook Verification Fails**
   - Verify webhook secret is correct
   - Check signature generation logic
   - Test with Resend webhook tester

4. **High Error Rates**
   - Check function logs for patterns
   - Verify input validation is working
   - Check for rate limiting issues

### Emergency Contacts
- **Firebase Support**: [Firebase Console](https://console.firebase.google.com)
- **Resend Support**: [Resend Dashboard](https://resend.com)
- **Google Cloud Support**: [Cloud Console](https://console.cloud.google.com)

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Resend API Documentation](https://resend.com/docs)
- [Google Secret Manager Documentation](https://cloud.google.com/secret-manager)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## 🔍 Security Audit

### Regular Security Checks
- [ ] Review access logs monthly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Review Firestore rules quarterly
- [ ] Test webhook security monthly

### Compliance
- **GDPR**: Email data is processed securely
- **CCPA**: User data can be deleted on request
- **SOC 2**: Infrastructure meets security standards

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Calendado Team
