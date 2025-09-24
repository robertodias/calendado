# Calendado Waitlist Confirmation Setup Guide

This guide will help you set up the complete Calendado waitlist confirmation system using Firebase Functions Gen2, Resend, and Google Secret Manager.

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud CLI (`gcloud`)
- Resend account
- Firebase project with Firestore enabled

## Step 1: Firebase Project Setup

### 1.1 Initialize Firebase Functions

```bash
cd calendado
firebase init functions
```

When prompted:
- Select TypeScript
- Use ESLint
- Install dependencies now

### 1.2 Install Dependencies

```bash
cd functions
npm install
```

## Step 2: Google Secret Manager Setup

### 2.1 Create Secrets

```bash
# Set your project ID
export PROJECT_ID=calendado-prod

# Create secrets
gcloud secrets create RESEND_API_KEY --data-file=- <<< "re_your_resend_api_key"
gcloud secrets create RESEND_WEBHOOK_SECRET --data-file=- <<< "your_webhook_secret"
gcloud secrets create FROM_EMAIL --data-file=- <<< "hello@updates.calendado.com"
gcloud secrets create FROM_NAME --data-file=- <<< "Calendado Updates"
gcloud secrets create APP_BASE_URL --data-file=- <<< "https://calendado.com"
```

### 2.2 Grant Permissions

```bash
# Grant access to the functions runtime service account
gcloud secrets add-iam-policy-binding RESEND_API_KEY \
  --member="serviceAccount:calendado-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding RESEND_WEBHOOK_SECRET \
  --member="serviceAccount:calendado-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FROM_EMAIL \
  --member="serviceAccount:calendado-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding FROM_NAME \
  --member="serviceAccount:calendado-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding APP_BASE_URL \
  --member="serviceAccount:calendado-prod@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Step 3: Resend Setup

### 3.1 Domain Verification

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add domain: `updates.calendado.com`
3. Verify domain ownership by adding DNS records:
   - **TXT Record**: `resend._domainkey.updates.calendado.com`
   - **CNAME Record**: `resend.updates.calendado.com`
4. Wait for verification (usually 5-10 minutes)

### 3.2 API Key

1. Go to [Resend API Keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `re_`)
4. Add it to Google Secret Manager (see Step 2.1)

### 3.3 Webhook Configuration

1. Go to [Resend Webhooks](https://resend.com/webhooks)
2. Create a new webhook with:
   - **URL**: `https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn`
   - **Secret**: Use the same secret you stored in Secret Manager
   - **Events**: Select all events (delivered, bounced, opened, clicked, complained, dropped)

## Step 4: Deploy Functions

### 4.1 Build and Test

```bash
cd functions
npm run build
npm test
npm run lint
```

### 4.2 Deploy

```bash
# Deploy all functions
firebase deploy --only functions

# Or use the deployment script
cd ..
scripts/deploy-functions.bat  # Windows
# or
scripts/deploy-functions.sh   # Linux/Mac
```

## Step 5: Test the System

### 5.1 Test Waitlist Signup

1. Go to your Calendado app
2. Sign up for the waitlist
3. Check Firestore for the new document in `/waitlist`
4. Check function logs: `firebase functions:log`
5. Check Resend dashboard for email delivery

### 5.2 Test Webhook

1. Send a test email from Resend dashboard
2. Check Firestore for events in `/email_events`
3. Verify webhook is receiving events

### 5.3 Test Admin Functions

```bash
# Get admin token (you'll need to implement this)
ADMIN_TOKEN="your-admin-token"

# Test resend confirmation
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/adminResendConfirmationFn \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"waitlistId": "your-waitlist-id"}'

# Test DLQ replayer
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/dlqReplayerFn \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Step 6: Monitor and Maintain

### 6.1 Monitoring

- **Function Logs**: `firebase functions:log`
- **Resend Dashboard**: Monitor delivery rates
- **Firestore**: Check for errors in documents
- **Dead Letter Queue**: Monitor `/email_dlq` collection

### 6.2 Alerts

Set up alerts for:
- High bounce rate (>5%)
- Function error rate (>1%)
- Dead letter queue size (>100 items)

### 6.3 Maintenance

- **Weekly**: Check dead letter queue
- **Monthly**: Review bounce rates and clean blocked emails
- **Quarterly**: Update dependencies and review security

## Troubleshooting

### Common Issues

1. **Email not sent**:
   - Check Firestore document for error details
   - Verify Resend API key and domain
   - Check dead letter queue

2. **Webhook not working**:
   - Verify webhook URL and secret
   - Check function logs for signature validation errors

3. **Admin functions failing**:
   - Verify user has admin custom claim
   - Check Firebase Auth token

4. **Secrets not accessible**:
   - Verify service account permissions
   - Check secret names and project ID

### Debug Commands

```bash
# Check function status
firebase functions:list

# View logs
firebase functions:log --only sendWaitlistConfirmationFn

# Test locally
firebase emulators:start --only functions,firestore

# Check secrets
gcloud secrets list
gcloud secrets versions access latest --secret="RESEND_API_KEY"
```

## Security Checklist

- [ ] All secrets stored in Google Secret Manager
- [ ] Webhook signature verification enabled
- [ ] Admin-only access for sensitive operations
- [ ] Firestore security rules prevent unauthorized access
- [ ] Rate limiting on admin functions
- [ ] Domain verification completed
- [ ] DKIM/SPF records configured

## Performance Optimization

- [ ] Functions use appropriate memory allocation (256MiB)
- [ ] Timeout settings optimized (60s for email, 30s for webhook)
- [ ] Retry configuration with exponential backoff
- [ ] Dead letter queue for failed operations
- [ ] Monitoring and alerting configured

## Next Steps

1. **Production Deployment**: Deploy to production environment
2. **Monitoring Setup**: Configure comprehensive monitoring
3. **Admin Dashboard**: Build admin interface for managing emails
4. **Analytics**: Add email analytics and reporting
5. **A/B Testing**: Implement email template testing
6. **Lifecycle Emails**: Add more email types (reminders, updates, etc.)

## Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Check Resend dashboard for email delivery issues
4. Contact the development team

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Resend Documentation](https://resend.com/docs)
- [Google Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
