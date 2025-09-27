#!/usr/bin/env ts-node

/**
 * Firestore Seed Script
 * 
 * This script seeds the Firestore database with sample data for development and testing.
 * It creates organizations, stores, professionals, waitlist entries, and users.
 * 
 * Usage:
 *   npm run seed
 *   or
 *   npx ts-node functions/scripts/seed.ts
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import type {
  OrgDoc,
  StoreDoc,
  ProfessionalDoc,
  WaitlistDoc,
  UserDoc,
  PublicLinkDoc,
  Locale,
  UserRole,
  WaitlistStatus,
  OrgStatus,
  StoreStatus,
  ProfessionalStatus,
  PublicLinkType,
  PublicLinkStatus,
} from '../src/models';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'calendado-dev',
  });
}

const db = getFirestore();
const auth = getAuth();

// ============================================================================
// SEED DATA
// ============================================================================

const sampleOrgs: Partial<OrgDoc>[] = [
  {
    name: 'Beauty Studio Pro',
    slug: 'beauty-studio-pro',
    description: 'Premium beauty and wellness services',
    status: 'active' as OrgStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'hello@beautystudiopro.com',
      phone: '+1-555-0123',
      website: 'https://beautystudiopro.com',
      socialMedia: {
        instagram: '@beautystudiopro',
        facebook: 'beautystudiopro',
      },
    },
    address: {
      street: '123 Beauty Lane',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060,
      },
    },
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en-US' as Locale,
      branding: {
        logo: 'https://example.com/logos/beauty-studio-pro.png',
        primaryColor: '#FF6B9D',
        secondaryColor: '#4ECDC4',
      },
      features: {
        waitlist: true,
        booking: true,
        payments: true,
        analytics: true,
      },
    },
  },
  {
    name: 'Fitness Hub',
    slug: 'fitness-hub',
    description: 'Complete fitness and wellness solutions',
    status: 'active' as OrgStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'info@fitnesshub.com',
      phone: '+1-555-0456',
      website: 'https://fitnesshub.com',
      socialMedia: {
        instagram: '@fitnesshub',
        twitter: '@fitnesshub',
      },
    },
    address: {
      street: '456 Fitness Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'US',
      coordinates: {
        lat: 34.0522,
        lng: -118.2437,
      },
    },
    settings: {
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      language: 'en-US' as Locale,
      branding: {
        logo: 'https://example.com/logos/fitness-hub.png',
        primaryColor: '#FF6B35',
        secondaryColor: '#F7931E',
      },
      features: {
        waitlist: true,
        booking: true,
        payments: true,
        analytics: true,
      },
    },
  },
];

const sampleStores: Partial<StoreDoc>[] = [
  {
    orgId: '', // Will be set dynamically
    name: 'Downtown Location',
    slug: 'downtown',
    description: 'Main downtown beauty studio',
    status: 'active' as StoreStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'downtown@beautystudiopro.com',
      phone: '+1-555-0123',
    },
    address: {
      street: '123 Beauty Lane',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US',
    },
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en-US' as Locale,
      operatingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '10:00', close: '16:00' },
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      services: ['Hair Styling', 'Makeup', 'Facial Treatments', 'Manicure', 'Pedicure'],
      capacity: 10,
      bookingSettings: {
        advanceBookingDays: 30,
        minBookingHours: 2,
        maxBookingHours: 24,
        slotDuration: 30,
      },
    },
  },
  {
    orgId: '', // Will be set dynamically
    name: 'Westside Location',
    slug: 'westside',
    description: 'Westside fitness center',
    status: 'active' as StoreStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'westside@fitnesshub.com',
      phone: '+1-555-0456',
    },
    address: {
      street: '456 Fitness Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'US',
    },
    settings: {
      timezone: 'America/Los_Angeles',
      currency: 'USD',
      language: 'en-US' as Locale,
      operatingHours: {
        monday: { open: '05:00', close: '22:00' },
        tuesday: { open: '05:00', close: '22:00' },
        wednesday: { open: '05:00', close: '22:00' },
        thursday: { open: '05:00', close: '22:00' },
        friday: { open: '05:00', close: '22:00' },
        saturday: { open: '06:00', close: '20:00' },
        sunday: { open: '07:00', close: '18:00' },
      },
      services: ['Personal Training', 'Group Classes', 'Yoga', 'Pilates', 'CrossFit'],
      capacity: 50,
      bookingSettings: {
        advanceBookingDays: 14,
        minBookingHours: 1,
        maxBookingHours: 12,
        slotDuration: 60,
      },
    },
  },
];

const sampleProfessionals: Partial<ProfessionalDoc>[] = [
  {
    orgId: '', // Will be set dynamically
    userId: '', // Will be set dynamically
    firstName: 'Sarah',
    lastName: 'Johnson',
    slug: 'sarah-johnson',
    title: 'Senior Hair Stylist',
    bio: 'Sarah has over 10 years of experience in hair styling and color. She specializes in balayage and bridal hair.',
    status: 'active' as ProfessionalStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'sarah@beautystudiopro.com',
      phone: '+1-555-0124',
    },
    specialties: ['Hair Styling', 'Hair Color', 'Bridal Hair', 'Balayage'],
    certifications: ['Licensed Cosmetologist', 'Bridal Hair Specialist'],
    experience: {
      years: 10,
      description: 'Specialized in modern hair techniques and color trends',
    },
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '19:00' },
      friday: { start: '09:00', end: '19:00' },
      saturday: { start: '10:00', end: '16:00' },
    },
    services: ['Hair Cut', 'Hair Color', 'Bridal Hair', 'Hair Treatment'],
    rating: {
      average: 4.8,
      count: 127,
    },
  },
  {
    orgId: '', // Will be set dynamically
    userId: '', // Will be set dynamically
    firstName: 'Mike',
    lastName: 'Chen',
    slug: 'mike-chen',
    title: 'Personal Trainer',
    bio: 'Mike is a certified personal trainer with expertise in strength training and functional fitness.',
    status: 'active' as ProfessionalStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'mike@fitnesshub.com',
      phone: '+1-555-0457',
    },
    specialties: ['Strength Training', 'Functional Fitness', 'Weight Loss', 'Muscle Building'],
    certifications: ['NASM-CPT', 'Functional Movement Screen'],
    experience: {
      years: 8,
      description: 'Specialized in strength training and functional movement patterns',
    },
    availability: {
      monday: { start: '06:00', end: '20:00' },
      tuesday: { start: '06:00', end: '20:00' },
      wednesday: { start: '06:00', end: '20:00' },
      thursday: { start: '06:00', end: '20:00' },
      friday: { start: '06:00', end: '20:00' },
      saturday: { start: '07:00', end: '15:00' },
    },
    services: ['Personal Training', 'Strength Training', 'Weight Loss Coaching'],
    rating: {
      average: 4.9,
      count: 89,
    },
  },
  {
    orgId: '', // Will be set dynamically
    userId: '', // Will be set dynamically
    firstName: 'Emma',
    lastName: 'Rodriguez',
    slug: 'emma-rodriguez',
    title: 'Yoga Instructor',
    bio: 'Emma is a certified yoga instructor specializing in Vinyasa and restorative yoga.',
    status: 'active' as ProfessionalStatus,
    createdBy: 'system',
    updatedBy: 'system',
    contact: {
      email: 'emma@fitnesshub.com',
      phone: '+1-555-0458',
    },
    specialties: ['Vinyasa Yoga', 'Restorative Yoga', 'Meditation', 'Breathwork'],
    certifications: ['RYT-200', 'Yin Yoga Certification'],
    experience: {
      years: 6,
      description: 'Specialized in mindful movement and breath awareness',
    },
    availability: {
      monday: { start: '07:00', end: '19:00' },
      tuesday: { start: '07:00', end: '19:00' },
      wednesday: { start: '07:00', end: '19:00' },
      thursday: { start: '07:00', end: '19:00' },
      friday: { start: '07:00', end: '19:00' },
      saturday: { start: '08:00', end: '16:00' },
      sunday: { start: '09:00', end: '15:00' },
    },
    services: ['Vinyasa Yoga', 'Restorative Yoga', 'Meditation Classes'],
    rating: {
      average: 4.7,
      count: 156,
    },
  },
];

const sampleWaitlist: Partial<WaitlistDoc>[] = [
  {
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
    locale: 'en-US' as Locale,
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'beauty-services',
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: '192.168.1.100',
    status: 'pending' as WaitlistStatus,
    comms: {
      confirmation: {
        sent: true,
        sentAt: FieldValue.serverTimestamp() as any,
        messageId: 'msg_123456789',
        error: null,
      },
    },
    dedupeKey: 'sha256_hash_of_jane_doe_email',
    captchaVerified: true,
    captchaToken: 'captcha_token_123',
    notes: 'Interested in hair services',
  },
  {
    email: 'john.smith@example.com',
    name: 'John Smith',
    locale: 'en-US' as Locale,
    utm: {
      source: 'facebook',
      medium: 'social',
      campaign: 'fitness-promo',
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ip: '192.168.1.101',
    status: 'confirmed' as WaitlistStatus,
    comms: {
      confirmation: {
        sent: true,
        sentAt: FieldValue.serverTimestamp() as any,
        messageId: 'msg_987654321',
        error: null,
      },
    },
    dedupeKey: 'sha256_hash_of_john_smith_email',
    captchaVerified: true,
    captchaToken: 'captcha_token_456',
    invitedAt: FieldValue.serverTimestamp() as any,
    invitedBy: 'system',
    notes: 'Looking for personal training',
  },
  {
    email: 'maria.garcia@example.com',
    name: 'Maria Garcia',
    locale: 'pt-BR' as Locale,
    utm: {
      source: 'instagram',
      medium: 'social',
      campaign: 'beauty-br',
    },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
    ip: '192.168.1.102',
    status: 'invited' as WaitlistStatus,
    comms: {
      confirmation: {
        sent: true,
        sentAt: FieldValue.serverTimestamp() as any,
        messageId: 'msg_456789123',
        error: null,
      },
    },
    dedupeKey: 'sha256_hash_of_maria_garcia_email',
    captchaVerified: true,
    captchaToken: 'captcha_token_789',
    invitedAt: FieldValue.serverTimestamp() as any,
    invitedBy: 'system',
    notes: 'Interested in makeup services',
  },
];

const sampleUsers: Partial<UserDoc>[] = [
  {
    email: 'admin@calendado.com',
    displayName: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['superadmin'] as UserRole[],
    preferences: {
      language: 'en-US' as Locale,
      timezone: 'America/New_York',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
    contact: {
      email: 'admin@calendado.com',
    },
  },
  {
    email: 'manager@beautystudiopro.com',
    displayName: 'Studio Manager',
    firstName: 'Studio',
    lastName: 'Manager',
    roles: ['admin'] as UserRole[],
    preferences: {
      language: 'en-US' as Locale,
      timezone: 'America/New_York',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
    contact: {
      email: 'manager@beautystudiopro.com',
    },
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function createUsers(): Promise<Map<string, string>> {
  console.log('Creating users...');
  const userIdMap = new Map<string, string>();

  for (const userData of sampleUsers) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: true,
      });

      // Set custom claims
      await auth.setCustomUserClaims(userRecord.uid, {
        roles: userData.roles,
      });

      // Create user document in Firestore
      const userDoc: UserDoc = {
        id: userRecord.uid,
        email: userData.email!,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roles!,
        createdAt: FieldValue.serverTimestamp() as any,
        updatedAt: FieldValue.serverTimestamp() as any,
        preferences: userData.preferences!,
        contact: userData.contact!,
        address: userData.address,
        metadata: userData.metadata,
      };

      await db.collection('users').doc(userRecord.uid).set(userDoc);
      userIdMap.set(userData.email!, userRecord.uid);
      console.log(`✓ Created user: ${userData.email}`);
    } catch (error) {
      console.error(`✗ Failed to create user ${userData.email}:`, error);
    }
  }

  return userIdMap;
}

async function createOrgs(): Promise<Map<string, string>> {
  console.log('Creating organizations...');
  const orgIdMap = new Map<string, string>();

  for (const orgData of sampleOrgs) {
    try {
      const orgId = uuidv4();
      const orgDoc: OrgDoc = {
        id: orgId,
        name: orgData.name!,
        slug: orgData.slug!,
        description: orgData.description,
        status: orgData.status!,
        createdAt: FieldValue.serverTimestamp() as any,
        updatedAt: FieldValue.serverTimestamp() as any,
        createdBy: orgData.createdBy!,
        updatedBy: orgData.updatedBy!,
        contact: orgData.contact!,
        address: orgData.address,
        settings: orgData.settings!,
        metadata: orgData.metadata || {},
      };

      await db.collection('orgs').doc(orgId).set(orgDoc);
      orgIdMap.set(orgData.slug!, orgId);
      console.log(`✓ Created org: ${orgData.name}`);
    } catch (error) {
      console.error(`✗ Failed to create org ${orgData.name}:`, error);
    }
  }

  return orgIdMap;
}

async function createStores(orgIdMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('Creating stores...');
  const storeIdMap = new Map<string, string>();

  for (let i = 0; i < sampleStores.length; i++) {
    const storeData = sampleStores[i];
    const orgSlug = i === 0 ? 'beauty-studio-pro' : 'fitness-hub';
    const orgId = orgIdMap.get(orgSlug);

    if (!orgId) {
      console.error(`✗ Org not found for store: ${orgSlug}`);
      continue;
    }

    try {
      const storeId = uuidv4();
      const storeDoc: StoreDoc = {
        id: storeId,
        orgId: orgId,
        name: storeData.name!,
        slug: storeData.slug!,
        description: storeData.description,
        status: storeData.status!,
        createdAt: FieldValue.serverTimestamp() as any,
        updatedAt: FieldValue.serverTimestamp() as any,
        createdBy: storeData.createdBy!,
        updatedBy: storeData.updatedBy!,
        contact: storeData.contact!,
        address: storeData.address,
        settings: storeData.settings!,
        metadata: storeData.metadata || {},
      };

      await db.collection('orgs').doc(orgId).collection('stores').doc(storeId).set(storeDoc);
      storeIdMap.set(`${orgSlug}-${storeData.slug}`, storeId);
      console.log(`✓ Created store: ${storeData.name}`);
    } catch (error) {
      console.error(`✗ Failed to create store ${storeData.name}:`, error);
    }
  }

  return storeIdMap;
}

async function createProfessionals(orgIdMap: Map<string, string>, userIdMap: Map<string, string>): Promise<void> {
  console.log('Creating professionals...');

  for (let i = 0; i < sampleProfessionals.length; i++) {
    const profData = sampleProfessionals[i];
    const orgSlug = i === 0 ? 'beauty-studio-pro' : 'fitness-hub';
    const orgId = orgIdMap.get(orgSlug);

    if (!orgId) {
      console.error(`✗ Org not found for professional: ${orgSlug}`);
      continue;
    }

    // Create a user for the professional
    const profEmail = profData.contact?.email || `professional${i + 1}@example.com`;
    let userId = userIdMap.get(profEmail);

    if (!userId) {
      try {
        const userRecord = await auth.createUser({
          email: profEmail,
          displayName: `${profData.firstName} ${profData.lastName}`,
          emailVerified: true,
        });
        userId = userRecord.uid;
        userIdMap.set(profEmail, userId);

        // Create user document
        const userDoc: UserDoc = {
          id: userId,
          email: profEmail,
          displayName: `${profData.firstName} ${profData.lastName}`,
          firstName: profData.firstName!,
          lastName: profData.lastName!,
          roles: ['editor'] as UserRole[],
          createdAt: FieldValue.serverTimestamp() as any,
          updatedAt: FieldValue.serverTimestamp() as any,
          preferences: {
            language: 'en-US' as Locale,
            timezone: 'America/New_York',
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
          },
          contact: profData.contact!,
        };

        await db.collection('users').doc(userId).set(userDoc);
      } catch (error) {
        console.error(`✗ Failed to create user for professional ${profEmail}:`, error);
        continue;
      }
    }

    try {
      const profId = uuidv4();
      const profDoc: ProfessionalDoc = {
        id: profId,
        orgId: orgId,
        userId: userId,
        firstName: profData.firstName!,
        lastName: profData.lastName!,
        slug: profData.slug!,
        title: profData.title,
        bio: profData.bio,
        status: profData.status!,
        createdAt: FieldValue.serverTimestamp() as any,
        updatedAt: FieldValue.serverTimestamp() as any,
        createdBy: profData.createdBy!,
        updatedBy: profData.updatedBy!,
        contact: profData.contact!,
        specialties: profData.specialties!,
        certifications: profData.certifications,
        experience: profData.experience,
        availability: profData.availability!,
        services: profData.services!,
        rating: profData.rating,
        metadata: profData.metadata || {},
      };

      await db.collection('orgs').doc(orgId).collection('professionals').doc(profId).set(profDoc);
      console.log(`✓ Created professional: ${profData.firstName} ${profData.lastName}`);
    } catch (error) {
      console.error(`✗ Failed to create professional ${profData.firstName} ${profData.lastName}:`, error);
    }
  }
}

async function createWaitlist(): Promise<void> {
  console.log('Creating waitlist entries...');

  for (const waitlistData of sampleWaitlist) {
    try {
      const waitlistId = uuidv4();
      const waitlistDoc: WaitlistDoc = {
        id: waitlistId,
        email: waitlistData.email!,
        name: waitlistData.name || null,
        locale: waitlistData.locale || null,
        utm: waitlistData.utm || null,
        userAgent: waitlistData.userAgent || null,
        ip: waitlistData.ip || null,
        createdAt: FieldValue.serverTimestamp() as any,
        status: waitlistData.status!,
        comms: waitlistData.comms!,
        dedupeKey: waitlistData.dedupeKey!,
        captchaVerified: waitlistData.captchaVerified!,
        captchaToken: waitlistData.captchaToken || null,
        invitedAt: waitlistData.invitedAt || null,
        invitedBy: waitlistData.invitedBy || null,
        notes: waitlistData.notes || null,
      };

      await db.collection('waitlist').doc(waitlistId).set(waitlistDoc);
      console.log(`✓ Created waitlist entry: ${waitlistData.email}`);
    } catch (error) {
      console.error(`✗ Failed to create waitlist entry ${waitlistData.email}:`, error);
    }
  }
}

async function createPublicLinks(orgIdMap: Map<string, string>): Promise<void> {
  console.log('Creating public links...');

  const publicLinks: Partial<PublicLinkDoc>[] = [
    {
      slug: 'beauty-studio-downtown',
      type: 'store' as PublicLinkType,
      status: 'active' as PublicLinkStatus,
      createdBy: 'system',
      updatedBy: 'system',
      targetId: 'store-id-1', // Would be actual store ID
      targetType: 'store',
      orgId: orgIdMap.get('beauty-studio-pro'),
      metadata: {
        title: 'Beauty Studio Pro - Downtown',
        description: 'Book your beauty services at our downtown location',
        image: 'https://example.com/images/beauty-studio-downtown.jpg',
        useCount: 0,
      },
    },
    {
      slug: 'sarah-johnson-hair',
      type: 'professional' as PublicLinkType,
      status: 'active' as PublicLinkStatus,
      createdBy: 'system',
      updatedBy: 'system',
      targetId: 'professional-id-1', // Would be actual professional ID
      targetType: 'professional',
      orgId: orgIdMap.get('beauty-studio-pro'),
      metadata: {
        title: 'Sarah Johnson - Hair Stylist',
        description: 'Book with Sarah for expert hair styling and color',
        image: 'https://example.com/images/sarah-johnson.jpg',
        useCount: 0,
      },
    },
    {
      slug: 'fitness-hub-waitlist',
      type: 'waitlist' as PublicLinkType,
      status: 'active' as PublicLinkStatus,
      createdBy: 'system',
      updatedBy: 'system',
      targetId: 'waitlist-id-1', // Would be actual waitlist ID
      targetType: 'waitlist',
      orgId: orgIdMap.get('fitness-hub'),
      metadata: {
        title: 'Join Fitness Hub Waitlist',
        description: 'Be the first to know when we launch',
        image: 'https://example.com/images/fitness-hub-waitlist.jpg',
        useCount: 0,
      },
    },
  ];

  for (const linkData of publicLinks) {
    try {
      const linkId = uuidv4();
      const linkDoc: PublicLinkDoc = {
        id: linkId,
        slug: linkData.slug!,
        type: linkData.type!,
        status: linkData.status!,
        createdAt: FieldValue.serverTimestamp() as any,
        updatedAt: FieldValue.serverTimestamp() as any,
        createdBy: linkData.createdBy!,
        updatedBy: linkData.updatedBy!,
        expiresAt: linkData.expiresAt || null,
        targetId: linkData.targetId!,
        targetType: linkData.targetType!,
        orgId: linkData.orgId,
        metadata: linkData.metadata!,
      };

      await db.collection('publicLinks').doc(linkId).set(linkDoc);
      console.log(`✓ Created public link: ${linkData.slug}`);
    } catch (error) {
      console.error(`✗ Failed to create public link ${linkData.slug}:`, error);
    }
  }
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seedDatabase(): Promise<void> {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Create users first
    const userIdMap = await createUsers();
    console.log('');

    // Create organizations
    const orgIdMap = await createOrgs();
    console.log('');

    // Create stores
    const storeIdMap = await createStores(orgIdMap);
    console.log('');

    // Create professionals
    await createProfessionals(orgIdMap, userIdMap);
    console.log('');

    // Create waitlist entries
    await createWaitlist();
    console.log('');

    // Create public links
    await createPublicLinks(orgIdMap);
    console.log('');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Users created: ${userIdMap.size}`);
    console.log(`- Organizations created: ${orgIdMap.size}`);
    console.log(`- Stores created: ${storeIdMap.size}`);
    console.log(`- Professionals created: ${sampleProfessionals.length}`);
    console.log(`- Waitlist entries created: ${sampleWaitlist.length}`);
    console.log(`- Public links created: 3`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seed script failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };
