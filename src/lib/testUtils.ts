/**
 * Test utilities for development and debugging
 * These functions help test the cookie functionality
 */

import { clearWaitlistCookie, markWaitlistJoined, hasJoinedWaitlist } from './cookieUtils';

/**
 * Test function to clear the waitlist cookie
 * Useful for testing the form display logic
 */
export const clearWaitlistForTesting = (): void => {
  clearWaitlistCookie();
  console.log('✅ Waitlist cookie cleared. Form should now be visible.');
  // Reload the page to see the changes
  window.location.reload();
};

/**
 * Test function to simulate a user who has already joined
 * Useful for testing the "already joined" message
 */
export const simulateJoinedUser = (): void => {
  markWaitlistJoined();
  console.log('✅ Waitlist cookie set. "Already joined" message should now be visible.');
  // Reload the page to see the changes
  window.location.reload();
};

/**
 * Check current waitlist status
 * Useful for debugging
 */
export const checkWaitlistStatus = (): boolean => {
  const hasJoined = hasJoinedWaitlist();
  console.log(`Waitlist status: ${hasJoined ? 'Already joined' : 'Not joined yet'}`);
  return hasJoined;
};

// Make functions available globally for testing in browser console
if (typeof window !== 'undefined') {
  (window as any).clearWaitlistForTesting = clearWaitlistForTesting;
  (window as any).simulateJoinedUser = simulateJoinedUser;
  (window as any).checkWaitlistStatus = checkWaitlistStatus;
}
