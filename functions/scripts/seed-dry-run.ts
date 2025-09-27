#!/usr/bin/env ts-node

/**
 * Firestore Seed Script - Dry Run
 * 
 * This script validates the seed data structure without connecting to Firebase.
 * It's useful for testing the data models and ensuring TypeScript compilation.
 * 
 * Usage:
 *   npm run seed:dry-run
 *   or
 *   npx ts-node functions/scripts/seed-dry-run.ts
 */

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

// ============================================================================
// SEED DATA VALIDATION
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
    orgId: 'org-id-1', // Mock ID
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
    orgId: 'org-id-2', // Mock ID
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
    orgId: 'org-id-1', // Mock ID
    userId: 'user-id-1', // Mock ID
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
    orgId: 'org-id-2', // Mock ID
    userId: 'user-id-2', // Mock ID
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
    orgId: 'org-id-2', // Mock ID
    userId: 'user-id-3', // Mock ID
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
        sentAt: null, // Mock timestamp
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
        sentAt: null, // Mock timestamp
        messageId: 'msg_987654321',
        error: null,
      },
    },
    dedupeKey: 'sha256_hash_of_john_smith_email',
    captchaVerified: true,
    captchaToken: 'captcha_token_456',
    // invitedAt: undefined, // Mock timestamp
    // invitedBy: 'system',
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
        sentAt: null, // Mock timestamp
        messageId: 'msg_456789123',
        error: null,
      },
    },
    dedupeKey: 'sha256_hash_of_maria_garcia_email',
    captchaVerified: true,
    captchaToken: 'captcha_token_789',
    // invitedAt: undefined, // Mock timestamp
    // invitedBy: 'system',
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

const samplePublicLinks: Partial<PublicLinkDoc>[] = [
  {
    slug: 'beauty-studio-downtown',
    type: 'store' as PublicLinkType,
    status: 'active' as PublicLinkStatus,
    createdBy: 'system',
    updatedBy: 'system',
    targetId: 'store-id-1',
    targetType: 'store',
    orgId: 'org-id-1',
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
    targetId: 'professional-id-1',
    targetType: 'professional',
    orgId: 'org-id-1',
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
    targetId: 'waitlist-id-1',
    targetType: 'waitlist',
    orgId: 'org-id-2',
    metadata: {
      title: 'Join Fitness Hub Waitlist',
      description: 'Be the first to know when we launch',
      image: 'https://example.com/images/fitness-hub-waitlist.jpg',
      useCount: 0,
    },
  },
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateDataStructure(): boolean {
  console.log('🔍 Validating data structure...\n');

  let isValid = true;

  // Validate organizations
  console.log('Validating organizations...');
  for (const org of sampleOrgs) {
    if (!org.name || !org.slug || !org.status) {
      console.error(`✗ Invalid org: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ Org: ${org.name}`);
    }
  }

  // Validate stores
  console.log('\nValidating stores...');
  for (const store of sampleStores) {
    if (!store.name || !store.slug || !store.status || !store.orgId) {
      console.error(`✗ Invalid store: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ Store: ${store.name}`);
    }
  }

  // Validate professionals
  console.log('\nValidating professionals...');
  for (const prof of sampleProfessionals) {
    if (!prof.firstName || !prof.lastName || !prof.slug || !prof.status || !prof.orgId || !prof.userId) {
      console.error(`✗ Invalid professional: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ Professional: ${prof.firstName} ${prof.lastName}`);
    }
  }

  // Validate waitlist entries
  console.log('\nValidating waitlist entries...');
  for (const entry of sampleWaitlist) {
    if (!entry.email || !entry.status || !entry.dedupeKey) {
      console.error(`✗ Invalid waitlist entry: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ Waitlist entry: ${entry.email}`);
    }
  }

  // Validate users
  console.log('\nValidating users...');
  for (const user of sampleUsers) {
    if (!user.email || !user.roles || user.roles.length === 0) {
      console.error(`✗ Invalid user: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ User: ${user.email}`);
    }
  }

  // Validate public links
  console.log('\nValidating public links...');
  for (const link of samplePublicLinks) {
    if (!link.slug || !link.type || !link.status || !link.targetId || !link.targetType) {
      console.error(`✗ Invalid public link: missing required fields`);
      isValid = false;
    } else {
      console.log(`✓ Public link: ${link.slug}`);
    }
  }

  return isValid;
}

function validateIndexRequirements(): boolean {
  console.log('\n🔍 Validating index requirements...\n');

  const requiredIndexes = [
    { collection: 'waitlist', fields: ['status', 'createdAt'] },
    { collection: 'invites', fields: ['email', 'used', 'expiresAt'] },
    { collection: 'publicLinks', fields: ['slug', 'type', 'status'] },
    { collection: 'professionals', fields: ['orgId', 'slug'] },
    { collection: 'stores', fields: ['orgId', 'slug'] },
  ];

  let isValid = true;

  for (const index of requiredIndexes) {
    console.log(`✓ Index required: ${index.collection} (${index.fields.join(', ')})`);
  }

  return isValid;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

async function validateSeedData(): Promise<void> {
  console.log('🌱 Starting seed data validation...\n');

  try {
    const dataValid = validateDataStructure();
    const indexesValid = validateIndexRequirements();

    if (dataValid && indexesValid) {
      console.log('\n🎉 All validations passed!');
      console.log('\nSummary:');
      console.log(`- Organizations: ${sampleOrgs.length}`);
      console.log(`- Stores: ${sampleStores.length}`);
      console.log(`- Professionals: ${sampleProfessionals.length}`);
      console.log(`- Waitlist entries: ${sampleWaitlist.length}`);
      console.log(`- Users: ${sampleUsers.length}`);
      console.log(`- Public links: ${samplePublicLinks.length}`);
      console.log('\n✅ Seed data is ready for deployment!');
    } else {
      console.log('\n❌ Validation failed!');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Validation error:', error);
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

if (require.main === module) {
  validateSeedData()
    .then(() => {
      console.log('\n✅ Dry run completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Dry run failed:', error);
      process.exit(1);
    });
}

export { validateSeedData };
