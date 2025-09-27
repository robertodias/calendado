/**
 * Test script for invite consumption endpoint
 * 
 * This script tests the invite consumption endpoint with various scenarios
 * to ensure it works correctly in the Firebase emulator.
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { createInviteToken } from '../src/tokens';

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const auth = getAuth();

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  response?: any;
}

async function testInviteConsumption(): Promise<void> {
  console.log('🧪 Starting invite consumption tests...\n');

  const results: TestResult[] = [];

  // Test 1: Create a valid invite and test consumption
  try {
    console.log('Test 1: Valid invite consumption (new user)');
    
    // Create a test invite
    const inviteId = 'test-invite-' + Date.now();
    const email = 'test@example.com';
    const role = 'viewer';
    const orgId = 'test-org-123';

    // Create invite document
    await db.collection('invites').doc(inviteId).set({
      id: inviteId,
      email,
      status: 'pending',
      createdAt: new Date(),
      createdBy: 'test-admin',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      role,
      orgId,
      usedAt: null,
      usedBy: null,
    });

    // Create magic link token
    const tokenResult = createInviteToken(inviteId, email, 24);
    if (!tokenResult.success || !tokenResult.token) {
      throw new Error('Failed to create magic link token');
    }

    // Test the endpoint
    const response = await fetch('http://localhost:5001/your-project-id/us-central1/consumeInvite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenResult.token,
        userData: {
          displayName: 'Test User',
          preferences: { theme: 'dark' },
        },
      }),
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      results.push({
        testName: 'Valid invite consumption (new user)',
        success: true,
        response: responseData,
      });
      console.log('✅ Success:', responseData.message);
    } else {
      results.push({
        testName: 'Valid invite consumption (new user)',
        success: false,
        error: responseData.error || 'Unknown error',
        response: responseData,
      });
      console.log('❌ Failed:', responseData.error);
    }
  } catch (error) {
    results.push({
      testName: 'Valid invite consumption (new user)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ Error:', error);
  }

  // Test 2: Test with existing user
  try {
    console.log('\nTest 2: Valid invite consumption (existing user)');
    
    // Create a test user first
    const existingUser = await auth.createUser({
      email: 'existing@example.com',
      displayName: 'Existing User',
    });

    // Create another invite
    const inviteId2 = 'test-invite-2-' + Date.now();
    const email2 = 'existing@example.com';

    await db.collection('invites').doc(inviteId2).set({
      id: inviteId2,
      email: email2,
      status: 'pending',
      createdAt: new Date(),
      createdBy: 'test-admin',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      role: 'admin',
      orgId: 'test-org-456',
      usedAt: null,
      usedBy: null,
    });

    // Create magic link token
    const tokenResult2 = createInviteToken(inviteId2, email2, 24);
    if (!tokenResult2.success || !tokenResult2.token) {
      throw new Error('Failed to create magic link token');
    }

    // Test the endpoint
    const response2 = await fetch('http://localhost:5001/your-project-id/us-central1/consumeInvite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenResult2.token,
      }),
    });

    const responseData2 = await response2.json();

    if (response2.ok && responseData2.success) {
      results.push({
        testName: 'Valid invite consumption (existing user)',
        success: true,
        response: responseData2,
      });
      console.log('✅ Success:', responseData2.message);
    } else {
      results.push({
        testName: 'Valid invite consumption (existing user)',
        success: false,
        error: responseData2.error || 'Unknown error',
        response: responseData2,
      });
      console.log('❌ Failed:', responseData2.error);
    }
  } catch (error) {
    results.push({
      testName: 'Valid invite consumption (existing user)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ Error:', error);
  }

  // Test 3: Test invalid token
  try {
    console.log('\nTest 3: Invalid token');
    
    const response3 = await fetch('http://localhost:5001/your-project-id/us-central1/consumeInvite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'invalid-token',
      }),
    });

    const responseData3 = await response3.json();

    if (!response3.ok && responseData3.error) {
      results.push({
        testName: 'Invalid token',
        success: true,
        response: responseData3,
      });
      console.log('✅ Success: Correctly rejected invalid token');
    } else {
      results.push({
        testName: 'Invalid token',
        success: false,
        error: 'Should have rejected invalid token',
        response: responseData3,
      });
      console.log('❌ Failed: Should have rejected invalid token');
    }
  } catch (error) {
    results.push({
      testName: 'Invalid token',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ Error:', error);
  }

  // Test 4: Test missing token
  try {
    console.log('\nTest 4: Missing token');
    
    const response4 = await fetch('http://localhost:5001/your-project-id/us-central1/consumeInvite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const responseData4 = await response4.json();

    if (!response4.ok && responseData4.error) {
      results.push({
        testName: 'Missing token',
        success: true,
        response: responseData4,
      });
      console.log('✅ Success: Correctly rejected missing token');
    } else {
      results.push({
        testName: 'Missing token',
        success: false,
        error: 'Should have rejected missing token',
        response: responseData4,
      });
      console.log('❌ Failed: Should have rejected missing token');
    }
  } catch (error) {
    results.push({
      testName: 'Missing token',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ Error:', error);
  }

  // Test 5: Test wrong HTTP method
  try {
    console.log('\nTest 5: Wrong HTTP method (GET)');
    
    const response5 = await fetch('http://localhost:5001/your-project-id/us-central1/consumeInvite', {
      method: 'GET',
    });

    const responseData5 = await response5.json();

    if (!response5.ok && responseData5.error) {
      results.push({
        testName: 'Wrong HTTP method (GET)',
        success: true,
        response: responseData5,
      });
      console.log('✅ Success: Correctly rejected GET request');
    } else {
      results.push({
        testName: 'Wrong HTTP method (GET)',
        success: false,
        error: 'Should have rejected GET request',
        response: responseData5,
      });
      console.log('❌ Failed: Should have rejected GET request');
    }
  } catch (error) {
    results.push({
      testName: 'Wrong HTTP method (GET)',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    console.log('❌ Error:', error);
  }

  // Print summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.testName}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\nResults: ${successful}/${total} tests passed`);
  
  if (successful === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
}

// Run the tests
if (require.main === module) {
  testInviteConsumption().catch(console.error);
}

export { testInviteConsumption };

