# Invite Consumption Endpoint

## Overview

The invite consumption endpoint (`consumeInvite`) is a Firebase Cloud Function that handles magic link token validation and user account creation when users click on invitation links. This endpoint is the final step in the invitation flow, converting magic link tokens into active user accounts.

## Endpoint Details

- **URL**: `POST /api/invite/consume`
- **Function**: `consumeInvite`
- **Region**: `us-central1`
- **Memory**: `256MiB`
- **Timeout**: `30 seconds`

## Request Format

```typescript
interface ConsumeInviteRequest {
  token: string;                    // Required: Magic link token
  userData?: {                     // Optional: Additional user data
    displayName?: string;
    preferences?: Record<string, unknown>;
  };
}
```

## Response Format

```typescript
interface ConsumeInviteResponse {
  success: boolean;
  message: string;
  user?: {
    uid: string;
    email: string;
    displayName?: string;
    roles: string[];
    orgId?: string;
  };
  redirectUrl?: string;
  error?: string;
}
```

## Functionality

### 1. Token Validation
- Validates the magic link token using JWT verification
- Checks token expiration and signature
- Ensures token type is 'invite'

### 2. Invite Verification
- Loads invite document from Firestore
- Verifies invite exists and is not already used
- Checks invite expiration
- Validates email matches token payload

### 3. User Account Handling

#### New User Creation
- Creates new Firebase Auth user account
- Sets custom claims with roles and organization access
- Creates user document in Firestore with:
  - Basic profile information
  - Role assignments
  - Default preferences
  - Contact information

#### Existing User Update
- Updates existing user's custom claims
- Adds new roles/organization access
- Updates user document in Firestore
- Preserves existing user data

### 4. Status Updates
- Marks invite as used with timestamp and user ID
- Updates waitlist status to 'accepted' if applicable
- Creates audit log entries for all actions

### 5. Response Generation
- Returns user information and success message
- Generates redirect URL for frontend
- Provides appropriate error messages for failures

## Error Handling

The endpoint handles various error scenarios:

### 4xx Client Errors
- **400**: Invalid or missing token
- **400**: Invalid token type (not invite)
- **400**: Invitation already used
- **400**: Invitation expired
- **400**: Email mismatch
- **400**: User already has access
- **404**: Invitation not found
- **405**: Wrong HTTP method

### 5xx Server Errors
- **500**: Internal server error
- Database connection issues
- Authentication service errors
- Transaction failures

## Security Features

### CORS Support
- Handles preflight OPTIONS requests
- Sets appropriate CORS headers
- Allows cross-origin requests from frontend

### Input Validation
- Validates request method (POST only)
- Validates token format and type
- Sanitizes user input data

### Transaction Safety
- Uses Firestore transactions for atomic operations
- Ensures data consistency across multiple collections
- Rollback on any failure

## Testing

### Unit Tests
- Function export and configuration tests
- Type definition validation
- Basic functionality verification

### Integration Tests
- End-to-end testing with Firebase emulator
- Token generation and validation flow
- User creation and role assignment
- Error scenario testing

### Manual Testing
- Postman collection provided for API testing
- Test script for automated validation
- Various test scenarios covered

## Usage Examples

### Basic Invite Consumption
```bash
curl -X POST https://your-project-id.us-central1.cloudfunctions.net/consumeInvite \
  -H "Content-Type: application/json" \
  -d '{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userData": {
      "displayName": "John Doe",
      "preferences": {
        "theme": "dark"
      }
    }
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to Calendado.",
  "user": {
    "uid": "user123",
    "email": "john@example.com",
    "displayName": "John Doe",
    "roles": ["viewer"],
    "orgId": "org456"
  },
  "redirectUrl": "https://app.calendado.com/dashboard?welcome=true"
}
```

## Dependencies

- `firebase-functions/v2/https` - Cloud Function framework
- `firebase-admin/firestore` - Firestore database access
- `firebase-admin/auth` - Authentication management
- `./tokens` - Magic link token validation
- `./lib/audit` - Audit logging utilities
- `./models` - Type definitions

## Environment Variables

- `PUBLIC_APP_URL` - Frontend application URL for redirects

## Related Functions

- `issueMagicLink` - Generates magic link tokens
- `validateMagicLink` - Validates magic link tokens
- `inviteFromWaitlist` - Creates invitations from waitlist entries

## Monitoring and Logging

- All actions are logged to audit logs collection
- Error details logged for debugging
- Performance metrics tracked
- User creation and role changes tracked

## Deployment

The function is automatically deployed when pushed to the main branch via GitHub Actions. Manual deployment:

```bash
cd functions
npm run build
firebase deploy --only functions:consumeInvite
```

## Maintenance

- Regular security updates for dependencies
- Monitor error rates and performance
- Update type definitions as needed
- Review and update audit logging

