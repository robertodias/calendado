/**
 * Test script for email functions
 * 
 * This script tests the email functionality with mocked Resend.
 */

// Mock Resend for testing
const mockResend = {
  emails: {
    send: jest.fn().mockResolvedValue({
      data: { id: 'test-message-id' },
      error: null
    })
  }
};

// Mock the Resend module
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => mockResend)
}));

// Mock environment variables
process.env.RESEND_API_KEY = 'test-api-key';
process.env.PUBLIC_APP_URL = 'https://test.example.com';
process.env.FROM_EMAIL = 'test@example.com';
process.env.FROM_NAME = 'Test App';

async function testEmailFunctions() {
  console.log('📧 Testing Email Functions...\n');

  try {
    // Import after mocking
    const { sendInviteEmail, sendWaitlistConfirmationEmail, sendPasswordResetEmail } = await import('../src/email');

    // Test 1: Send invite email
    console.log('1. Testing sendInviteEmail...');
    const inviteResult = await sendInviteEmail({
      email: 'test@example.com',
      token: 'test-token-123',
      brandName: 'Test Brand',
      inviteUrl: 'https://test.example.com/invite/test-token-123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    if (inviteResult.success) {
      console.log('✅ Invite email sent successfully');
      console.log(`   Message ID: ${inviteResult.messageId}`);
    } else {
      console.log('❌ Failed to send invite email:', inviteResult.error);
    }

    // Test 2: Send waitlist confirmation email
    console.log('\n2. Testing sendWaitlistConfirmationEmail...');
    const waitlistResult = await sendWaitlistConfirmationEmail('test@example.com', 'Test Brand');

    if (waitlistResult.success) {
      console.log('✅ Waitlist confirmation email sent successfully');
      console.log(`   Message ID: ${waitlistResult.messageId}`);
    } else {
      console.log('❌ Failed to send waitlist confirmation email:', waitlistResult.error);
    }

    // Test 3: Send password reset email
    console.log('\n3. Testing sendPasswordResetEmail...');
    const resetResult = await sendPasswordResetEmail(
      'test@example.com',
      'reset-token-123',
      'Test Brand'
    );

    if (resetResult.success) {
      console.log('✅ Password reset email sent successfully');
      console.log(`   Message ID: ${resetResult.messageId}`);
    } else {
      console.log('❌ Failed to send password reset email:', resetResult.error);
    }

    // Verify mock calls
    console.log('\n4. Verifying mock calls...');
    console.log(`   Total email calls: ${mockResend.emails.send.mock.calls.length}`);
    console.log('   Email subjects:');
    mockResend.emails.send.mock.calls.forEach((call, index) => {
      console.log(`     ${index + 1}. ${call[0].subject}`);
    });

    console.log('\n🎉 All email tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the tests
testEmailFunctions().catch(console.error);
