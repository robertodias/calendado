/**
 * Email validation and normalization utilities
 * Handles Gmail-specific rules (dots and plus signs)
 */

/**
 * Normalize email address for Gmail and similar providers
 * Gmail ignores dots in the local part and everything after + sign
 * @param email - Raw email address
 * @returns Normalized email address
 */
export const normalizeEmail = (email: string): string => {
  if (!email) return email;

  const trimmedEmail = email.trim().toLowerCase();
  const [localPart, domain] = trimmedEmail.split('@');

  if (!localPart || !domain) return trimmedEmail;

  // Gmail normalization rules
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remove dots from local part
    let normalizedLocal = localPart.replace(/\./g, '');

    // Remove everything after + sign
    const plusIndex = normalizedLocal.indexOf('+');
    if (plusIndex !== -1) {
      normalizedLocal = normalizedLocal.substring(0, plusIndex);
    }

    return `${normalizedLocal}@gmail.com`;
  }

  // For other providers, just normalize case and trim
  return trimmedEmail;
};

/**
 * Validate email format using a comprehensive regex
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export const isValidEmailFormat = (email: string): boolean => {
  if (!email) return false;

  // Comprehensive email regex that covers most valid email formats
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email.trim());
};

/**
 * Check if email is from a common provider that supports normalization
 * @param email - Email address to check
 * @returns true if email is from a provider that supports normalization
 */
export const isNormalizableProvider = (email: string): boolean => {
  if (!email) return false;

  const domain = email.split('@')[1]?.toLowerCase();
  const normalizableProviders = [
    'gmail.com',
    'googlemail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'yahoo.com',
  ];

  return normalizableProviders.includes(domain || '');
};

/**
 * Get a user-friendly message about email normalization
 * @param email - Email address
 * @returns Message explaining normalization if applicable
 */
export const getEmailNormalizationMessage = (_email: string): string => {
  // UI should not display provider-specific validation/normalization notes
  return '';
};
