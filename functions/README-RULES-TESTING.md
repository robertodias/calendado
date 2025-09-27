# Firestore Security Rules Testing

This document explains how to test the Firestore security rules implemented for Calendado.

## Prerequisites

1. **Java 8 or higher** - Required for Firebase emulator
2. **Firebase CLI** - Install with `npm install -g firebase-tools`
3. **Node.js 20+** - For running the test suite

## Running the Tests

### Option 1: Using Firebase Emulator (Recommended)

```bash
# From the project root directory
firebase emulators:exec --only firestore "cd functions && npm run test:rules"
```

### Option 2: Manual Emulator Setup

```bash
# Terminal 1: Start the emulator
firebase emulators:start --only firestore

# Terminal 2: Run the tests
cd functions
npm run test:rules
```

### Option 3: Deploy and Test in Development

```bash
# Deploy rules to a development project
firebase use your-dev-project
firebase deploy --only firestore:rules

# Run integration tests against the deployed rules
npm run test:rules
```

## Test Coverage

The test suite covers the following scenarios:

### Platform Admin Access
- ✅ Platform admin can read all users
- ✅ Platform admin can write to admin collections
- ✅ Platform admin can create organizations

### Organization Access Control
- ✅ Org owner can read and write organization
- ✅ Org admin can read and write organization
- ✅ Store manager cannot write organization
- ✅ Professional cannot write organization
- ✅ Viewer can only read organization
- ✅ Non-member cannot access organization

### Store Access Control
- ✅ Org admin can read and write stores
- ✅ Store manager can read and write stores
- ✅ Professional can read but not write stores
- ✅ Viewer can only read stores

### Professional Access Control
- ✅ Professional can update own profile
- ✅ Professional cannot update other profiles
- ✅ Org admin can update any professional profile
- ✅ Store manager can update any professional profile

### Public Links Access
- ✅ Anyone can read public links
- ✅ Org members can create public links
- ✅ Non-members cannot create public links

### Waitlist Access
- ✅ Unauthenticated users can create waitlist entries
- ✅ Unauthenticated users can read waitlist entries
- ✅ Unauthenticated users cannot update waitlist entries

### User Profile Access
- ✅ Users can read and update their own profile
- ✅ Users cannot update their own roles
- ✅ Users cannot read other users profiles

### Public Organization Access
- ✅ Public can read public organizations
- ✅ Public can read stores of public organizations
- ✅ Public can read professionals of public organizations

## Security Rules Overview

### Platform-Level Roles
- **Platform Admin** (`platformAdmin: true`): Full access to everything
- **Platform Roles** (`roles: ['admin', 'superadmin', 'support']`): Legacy admin console access

### Organization-Level Roles
- **Owner** (`roles[orgId]: 'owner'`): Full control over organization
- **Org Admin** (`roles[orgId]: 'org_admin'`): Manage organization and all stores/professionals
- **Store Manager** (`roles[orgId]: 'store_manager'`): Manage stores and their professionals
- **Professional** (`roles[orgId]: 'professional'`): Update own profile only
- **Viewer** (`roles[orgId]: 'viewer'`): Read-only access

### Access Patterns

#### Read Access
- Platform admin: Everything
- Org members: Their organization's data
- Public: Public organizations and public links
- Users: Their own profile

#### Write Access
- Platform admin: Everything
- Org owner/admin: Organization-level changes
- Store manager: Store and professional management
- Professional: Own profile only
- Public: Waitlist signup only

## Troubleshooting

### Java Not Found
```bash
# Install Java (Windows with Chocolatey)
choco install openjdk

# Install Java (macOS with Homebrew)
brew install openjdk

# Install Java (Ubuntu/Debian)
sudo apt-get install openjdk-11-jdk
```

### Emulator Port Conflicts
```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill the process or use a different port
firebase emulators:start --only firestore --port 8081
```

### Test Environment Issues
```bash
# Clear emulator data
firebase emulators:start --only firestore --import=./emulator-data --export-on-exit

# Reset test environment
rm -rf emulator-data
```

## Continuous Integration

To run these tests in CI/CD:

```yaml
# GitHub Actions example
- name: Install Java
  uses: actions/setup-java@v3
  with:
    java-version: '11'
    distribution: 'adopt'

- name: Run Firestore Rules Tests
  run: |
    firebase emulators:exec --only firestore "cd functions && npm run test:rules"
```

## Security Rules Validation

The rules are also validated for syntax errors during deployment:

```bash
# Validate rules syntax
firebase deploy --only firestore:rules --dry-run
```

## Performance Considerations

- Rules are evaluated on every read/write operation
- Complex rules with multiple `get()` calls can impact performance
- Consider caching frequently accessed data
- Use composite indexes for efficient queries

## Best Practices

1. **Principle of Least Privilege**: Users get minimum required access
2. **Defense in Depth**: Multiple layers of validation
3. **Audit Trail**: All changes are logged
4. **Regular Testing**: Run tests on every rule change
5. **Documentation**: Keep rules and tests in sync
