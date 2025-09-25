/**
 * reCAPTCHA validation utilities for Firebase Functions
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Validates a reCAPTCHA token with Google's verification API
 */
export async function validateRecaptchaToken(token: string, remoteip?: string): Promise<boolean> {
  try {
    // Get the reCAPTCHA secret key from Google Secret Manager
    const client = new SecretManagerServiceClient();
    const secretName = 'projects/calendado-prod/secrets/recaptcha-secret-key/versions/latest';
    const [secret] = await client.accessSecretVersion({ name: secretName });
    const secretKey = secret.payload?.data?.toString();
    
    if (!secretKey) {
      console.error('reCAPTCHA secret key not found in Secret Manager');
      return false;
    }

    // Prepare the verification request
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteip && { remoteip })
    });

    // Make the verification request
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('reCAPTCHA verification request failed:', response.status, response.statusText);
      return false;
    }

    const result: RecaptchaResponse = await response.json();
    
    // Log the result for debugging (without sensitive data)
    console.log('reCAPTCHA verification result:', {
      success: result.success,
      hostname: result.hostname,
      errorCodes: result['error-codes']
    });

    return result.success;
  } catch (error) {
    console.error('Error validating reCAPTCHA token:', error);
    return false;
  }
}

/**
 * Validates reCAPTCHA token with additional security checks
 */
export async function validateRecaptchaWithSecurity(
  token: string, 
  expectedHostname?: string,
  remoteip?: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    // Get the reCAPTCHA secret key from Google Secret Manager
    const client = new SecretManagerServiceClient();
    const secretName = 'projects/calendado-prod/secrets/recaptcha-secret-key/versions/latest';
    const [secret] = await client.accessSecretVersion({ name: secretName });
    const secretKey = secret.payload?.data?.toString();
    
    if (!secretKey) {
      return { valid: false, reason: 'reCAPTCHA secret key not found' };
    }

    // Prepare the verification request
    const verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
      ...(remoteip && { remoteip })
    });

    // Make the verification request
    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return { valid: false, reason: `Verification request failed: ${response.status}` };
    }

    const result: RecaptchaResponse = await response.json();
    
    // Check if verification was successful
    if (!result.success) {
      const errorCodes = result['error-codes'] || [];
      return { 
        valid: false, 
        reason: `reCAPTCHA verification failed: ${errorCodes.join(', ')}` 
      };
    }

    // Additional security checks
    if (expectedHostname && result.hostname !== expectedHostname) {
      return { 
        valid: false, 
        reason: `Hostname mismatch: expected ${expectedHostname}, got ${result.hostname}` 
      };
    }

    // Check if the challenge timestamp is recent (within 2 minutes)
    if (result.challenge_ts) {
      const challengeTime = new Date(result.challenge_ts).getTime();
      const now = Date.now();
      const timeDiff = now - challengeTime;
      
      if (timeDiff > 120000) { // 2 minutes
        return { 
          valid: false, 
          reason: 'reCAPTCHA token expired (older than 2 minutes)' 
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating reCAPTCHA token:', error);
    return { valid: false, reason: 'Internal validation error' };
  }
}
