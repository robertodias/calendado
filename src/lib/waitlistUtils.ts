/**
 * Waitlist utilities for client-side integration
 * Handles waitlist signup with proper data structure for Firebase Functions
 */

import { collection, addDoc, serverTimestamp, query, where, getDocs, type DocumentData, type Query } from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeEmail, generateDedupeKeySync } from './crypto';
import type { Locale } from '../types/models';

export interface WaitlistSignupData {
  email: string;
  name?: string;
  locale?: Locale;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface WaitlistSignupResult {
  success: boolean;
  waitlistId?: string;
  error?: string;
  alreadyJoined?: boolean;
}

/**
 * Sign up for the waitlist
 */
export async function signupForWaitlist(
  data: WaitlistSignupData
): Promise<WaitlistSignupResult> {
  try {
    // Validate email
    if (!data.email || !data.email.includes('@')) {
      return {
        success: false,
        error: 'Invalid email address'
      };
    }

    // Normalize email
    const normalizedEmail = normalizeEmail(data.email);
    
    // Check if already joined (optional - server will also check)
    const alreadyJoined = await checkIfAlreadyJoined(normalizedEmail);
    if (alreadyJoined) {
      return {
        success: false,
        error: 'Email already registered',
        alreadyJoined: true
      };
    }

    // Generate dedupe key
    const dedupeKey = generateDedupeKeySync(normalizedEmail);

    // Prepare waitlist data
    const waitlistData = {
      email: normalizedEmail,
      name: data.name || null,
      locale: data.locale || null,
      utm: data.utm || null,
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
      dedupeKey
    };

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'waitlist'), waitlistData as DocumentData);

    console.log('Waitlist signup successful:', {
      waitlistId: docRef.id,
      email: normalizedEmail,
      locale: data.locale
    });

    return {
      success: true,
      waitlistId: docRef.id
    };

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Check if email is already in waitlist
 */
export async function checkIfAlreadyJoined(email: string): Promise<boolean> {
  try {
    const normalizedEmail = normalizeEmail(email);
    const dedupeKey = generateDedupeKeySync(normalizedEmail);
    
    const q: Query<DocumentData> = query(
      collection(db, 'waitlist'),
      where('dedupeKey', '==', dedupeKey)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if already joined:', error);
    return false; // Allow signup if check fails
  }
}

/**
 * Get UTM parameters from URL
 */
export function getUtmParams(): WaitlistSignupData['utm'] {
  const urlParams = new URLSearchParams(window.location.search);
  
  const utm: WaitlistSignupData['utm'] = {};
  
  const source = urlParams.get('utm_source');
  const medium = urlParams.get('utm_medium');
  const campaign = urlParams.get('utm_campaign');
  
  if (source) utm.source = source;
  if (medium) utm.medium = medium;
  if (campaign) utm.campaign = campaign;
  
  return Object.keys(utm).length > 0 ? utm : undefined;
}

/**
 * Get user's locale from browser
 */
export function getBrowserLocale(): Locale {
  const browserLocale = navigator.language || 'en-US';
  
  // Map browser locale to supported locales
  if (browserLocale.startsWith('pt')) return 'pt-BR';
  if (browserLocale.startsWith('it')) return 'it-IT';
  return 'en-US';
}

/**
 * Set waitlist cookie to prevent duplicate signups
 */
export function setWaitlistCookie(): void {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1); // 1 year
  
  document.cookie = `calendado_waitlisted=true; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
}

/**
 * Check if user has already joined (from cookie)
 */
export function hasJoinedWaitlist(): boolean {
  return document.cookie.includes('calendado_waitlisted=true');
}

/**
 * Complete waitlist signup with all utilities
 */
export async function completeWaitlistSignup(
  email: string,
  name?: string,
  locale?: Locale
): Promise<WaitlistSignupResult> {
  // Check cookie first
  if (hasJoinedWaitlist()) {
    return {
      success: false,
      error: 'You have already joined the waitlist',
      alreadyJoined: true
    };
  }

  // Get UTM parameters
  const utm = getUtmParams();
  
  // Get locale if not provided
  const finalLocale = locale || getBrowserLocale();

  // Sign up
  const result = await signupForWaitlist({
    email,
    name,
    locale: finalLocale,
    utm
  });

  // Set cookie on success
  if (result.success) {
    setWaitlistCookie();
  }

  return result;
}
