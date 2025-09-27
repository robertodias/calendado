/**
 * Cookie utility functions for managing browser cookies
 * Used to track if user has already joined the waitlist
 */

// Cookie configuration
const COOKIE_NAME = 'waitlist_joined';
const COOKIE_EXPIRY_DAYS = 365; // Cookie expires in 1 year

/**
 * Set a cookie with the given name, value, and expiry days
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiry
 */
export const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (const cookie of ca) {
    let c = cookie;
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

/**
 * Check if user has already joined the waitlist
 * @returns true if user has joined, false otherwise
 */
export const hasJoinedWaitlist = (): boolean => {
  return getCookie(COOKIE_NAME) === 'true';
};

/**
 * Mark user as having joined the waitlist
 * Sets a cookie that expires in 1 year
 */
export const markWaitlistJoined = (): void => {
  setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS);
};

/**
 * Remove the waitlist joined cookie (for testing purposes)
 */
export const clearWaitlistCookie = (): void => {
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
