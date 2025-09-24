# Calendado Firebase Functions

This directory contains Firebase Functions for the Calendado waitlist confirmation system using Firebase Functions Gen2, Resend, and Google Secret Manager.

## Features

- **Waitlist Confirmation**: Automatically sends confirmation emails when users join the waitlist
- **Resend Integration**: Uses Resend for reliable email delivery with webhook support
- **Multi-language Support**: Supports English (en-US), Portuguese (pt-BR), and Italian (it-IT)
- **Dead Letter Queue**: Handles failed email sends with retry logic
- **Admin Tools**: Admin functions for resending emails and managing failures
- **Observability**: Comprehensive logging and error tracking

## Architecture

### Functions

1. **`sendWaitlistConfirmation`** - Firestore trigger that sends confirmation emails
2. **`resendWebhook`** - HTTP endpoint for Resend webhook events
3. **`adminResendConfirmation`** - Admin-only function to resend emails
4. **`dlqReplayer`** - Admin-only function to retry failed emails

### Data Models

- **`/waitlist/{id}`** - Waitlist entries with communication status
- **`/email_events/{id}`** - Resend webhook events (delivered, bounced, etc.)
- **`/email_dlq/{id}`** - Dead letter queue for failed emails

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Google Secret Manager Setup

Create the following secrets in Google Secret Manager:

```bash
# Set your project ID
export PROJECT_ID=calendado-prod

# Create secrets
gcloud secrets create RESEND_API_KEY --data-file=- <<< "re_your_resend_api_key"
gcloud secrets create RESEND_WEBHOOK_SECRET --data-file=- <<< "your_webhook_secret"
gcloud secrets create FROM_EMAIL --data-file=- <<< "hello@updates.calendado.com"
gcloud secrets create FROM_NAME --data-file=- <<< "Calendado Updates"
gcloud secrets create APP_BASE_URL --data-file=- <<< "https://calendado.com"

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

### 3. Resend Setup

1. **Domain Verification**:
   - Add `updates.calendado.com` to your Resend account
   - Verify domain ownership (DNS records)
   - Ensure DKIM and SPF records are configured

2. **Webhook Configuration**:
   - Set webhook URL to: `https://us-central1-calendado-prod.cloudfunctions.net/resendWebhookFn`
   - Use the same secret you stored in Secret Manager
   - Enable events: `delivered`, `bounced`, `opened`, `clicked`, `complained`, `dropped`

### 4. Firestore Security Rules

Update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Waitlist collection - public create, server-only read/update
    match /waitlist/{id} {
      allow create: if true;
      allow read, update, delete: if false;
    }
    
    // Email events - server only
    match /email_events/{id} {
      allow read, write: if false;
    }
    
    // Dead letter queue - server only
    match /email_dlq/{id} {
      allow read, write: if false;
    }
  }
}
```

## Development

### Local Development

```bash
# Start Firebase emulators
npm run emulate

# Or start functions emulator only
npm run serve
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Deployment

### Deploy Functions

```bash
# Deploy all functions
npm run deploy

# Or deploy specific function
firebase deploy --only functions:sendWaitlistConfirmationFn
```

### Environment Variables

The functions use Google Secret Manager for configuration. No environment variables need to be set in the Firebase console.

## Usage

### Client Integration

When a user joins the waitlist, create a document in Firestore:

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { generateDedupeKey, normalizeEmail } from './lib/crypto';

const waitlistData = {
  email: normalizeEmail('user@example.com'),
  name: 'John Doe',
  locale: 'en-US',
  utm: { source: 'google', medium: 'cpc', campaign: 'waitlist' },
  userAgent: navigator.userAgent,
  ip: null, // Will be set by server
  createdAt: serverTimestamp(),
  status: 'pending',
  comms: {
    confirmation: {
      sent: false,
      sentAt: null,
      messageId: null,
      error: null
    }
  },
  dedupeKey: generateDedupeKey('user@example.com')
};

await addDoc(collection(db, 'waitlist'), waitlistData);
```

### Admin Functions

#### Resend Confirmation

```bash
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/adminResendConfirmationFn \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"waitlistId": "waitlist-id", "force": false}'
```

#### Retry Failed Emails

```bash
curl -X POST https://us-central1-calendado-prod.cloudfunctions.net/dlqReplayerFn \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

## Monitoring

### Logs

```bash
# View function logs
npm run logs

# Or use Firebase CLI
firebase functions:log
```

### Metrics

- **Email Delivery Rate**: Monitor Resend dashboard
- **Function Invocations**: Firebase Console > Functions
- **Error Rate**: Firebase Console > Functions > Logs
- **Dead Letter Queue Size**: Firestore collection size

### Alerts

Set up alerts for:
- High bounce rate (>5%)
- Function error rate (>1%)
- Dead letter queue size (>100 items)

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

### Debug Mode

Enable debug logging by setting the log level in Firebase Console or using:

```bash
firebase functions:config:set logging.level=debug
```

## Security

- All secrets stored in Google Secret Manager
- Webhook signature verification
- Admin-only access for sensitive operations
- Firestore security rules prevent unauthorized access
- Rate limiting on admin functions

## Performance

- Functions use 256MiB memory
- 60-second timeout for email functions
- 30-second timeout for webhook
- Automatic retries with exponential backoff
- Dead letter queue for failed operations

## Support

For issues or questions:
1. Check the logs first
2. Review this documentation
3. Check Resend dashboard for email delivery issues
4. Contact the development team
