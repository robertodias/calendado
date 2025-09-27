/**
 * Test script for magic link functions
 * 
 * This script tests the magic link functionality without requiring
 * the full Firebase emulator setup.
 */

import { createInviteToken, validateMagicLinkToken, extractTokenFromUrl } from '../src/tokens';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.PUBLIC_APP_URL = 'https://test.example.com';

async function testMagicLinks() {
  console.log('🧪 Testing Magic Link Functions...\n');

  try {
    // Test 1: Create invite token
    console.log('1. Testing createInviteToken...');
    const tokenResult = createInviteToken('test@example.com', 'test@example.com', 72);
    
    if (tokenResult.success) {
      console.log('✅ Token created successfully');
      console.log(`   Token: ${tokenResult.token?.substring(0, 20)}...`);
      console.log(`   URL: ${tokenResult.url}`);
      console.log(`   Expires: ${tokenResult.expiresAt}`);
    } else {
      console.log('❌ Failed to create token:', tokenResult.error);
      return;
    }

    // Test 2: Validate token
    console.log('\n2. Testing validateMagicLinkToken...');
    const validationResult = validateMagicLinkToken(tokenResult.token!);
    
    if (validationResult.valid) {
      console.log('✅ Token validated successfully');
      console.log(`   Invite ID: ${validationResult.payload?.inviteId}`);
      console.log(`   Email: ${validationResult.payload?.email}`);
      console.log(`   Type: ${validationResult.payload?.type}`);
    } else {
      console.log('❌ Token validation failed:', validationResult.error);
      return;
    }

    // Test 3: Extract token from URL
    console.log('\n3. Testing extractTokenFromUrl...');
    const extractedToken = extractTokenFromUrl(tokenResult.url!);
    
    if (extractedToken === tokenResult.token) {
      console.log('✅ Token extracted from URL successfully');
    } else {
      console.log('❌ Token extraction failed');
      return;
    }

    // Test 4: Test password reset token
    console.log('\n4. Testing createPasswordResetToken...');
    const { createPasswordResetToken } = await import('../src/tokens');
    const resetTokenResult = createPasswordResetToken('user123', 'test@example.com', 1);
    
    if (resetTokenResult.success) {
      console.log('✅ Password reset token created successfully');
      console.log(`   URL: ${resetTokenResult.url}`);
    } else {
      console.log('❌ Failed to create password reset token:', resetTokenResult.error);
    }

    console.log('\n🎉 All magic link tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
testMagicLinks().catch(console.error);

