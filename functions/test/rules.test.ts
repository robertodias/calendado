import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { join } from 'path';

// Test data
const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  token: {
    platformAdmin: false,
    roles: {}
  }
};

const mockPlatformAdmin = {
  uid: 'platform-admin-123',
  email: 'admin@calendado.com',
  token: {
    platformAdmin: true,
    roles: {}
  }
};

const mockOrgOwner = {
  uid: 'org-owner-123',
  email: 'owner@example.com',
  token: {
    platformAdmin: false,
    roles: {
      'org-123': 'owner'
    }
  }
};

const mockOrgAdmin = {
  uid: 'org-admin-123',
  email: 'admin@example.com',
  token: {
    platformAdmin: false,
    roles: {
      'org-123': 'org_admin'
    }
  }
};

const mockStoreManager = {
  uid: 'store-manager-123',
  email: 'manager@example.com',
  token: {
    platformAdmin: false,
    roles: {
      'org-123': 'store_manager'
    }
  }
};

const mockProfessional = {
  uid: 'professional-123',
  email: 'pro@example.com',
  token: {
    platformAdmin: false,
    roles: {
      'org-123': 'professional'
    }
  }
};

const mockViewer = {
  uid: 'viewer-123',
  email: 'viewer@example.com',
  token: {
    platformAdmin: false,
    roles: {
      'org-123': 'viewer'
    }
  }
};

const mockOrgData = {
  id: 'org-123',
  name: 'Test Organization',
  slug: 'test-org',
  status: 'active',
  public: false,
  createdAt: new Date(),
  createdBy: 'platform-admin-123'
};

const mockStoreData = {
  id: 'store-123',
  orgId: 'org-123',
  name: 'Test Store',
  slug: 'test-store',
  status: 'active',
  createdAt: new Date(),
  createdBy: 'org-admin-123'
};

const mockProfessionalData = {
  id: 'professional-123',
  orgId: 'org-123',
  firstName: 'John',
  lastName: 'Doe',
  slug: 'john-doe',
  status: 'active',
  userId: 'professional-123',
  createdAt: new Date(),
  createdBy: 'org-admin-123'
};

const mockPublicLinkData = {
  id: 'link-123',
  slug: 'test-link',
  type: 'store',
  targetId: 'store-123',
  orgId: 'org-123',
  status: 'active',
  createdAt: new Date(),
  createdBy: 'org-admin-123'
};

const mockWaitlistData = {
  id: 'waitlist-123',
  email: 'waitlist@example.com',
  name: 'Test User',
  status: 'pending',
  createdAt: new Date(),
  comms: {
    confirmation: {
      sent: false,
      sentAt: null,
      messageId: null,
      error: null
    }
  },
  dedupeKey: 'test-dedupe-key',
  captchaVerified: true,
  captchaToken: 'test-token'
};

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    // Initialize test environment with rules
    const rules = readFileSync(join(__dirname, '../../firestore.rules'), 'utf8');
    
    testEnv = await initializeTestEnvironment({
      projectId: 'calendado-test',
      firestore: {
        rules
      }
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    // Clear all data before each test
    await testEnv.clearFirestore();
  });

  describe('Platform Admin Access', () => {
    test('platform admin can read all users', async () => {
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      
      // Create a test user
      await db.collection('users').doc('test-user').set({
        uid: 'test-user',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['viewer'],
        createdAt: new Date()
      });

      // Platform admin should be able to read
      const doc = await db.collection('users').doc('test-user').get();
      expect(doc.exists).toBe(true);
    });

    test('platform admin can write to admin collections', async () => {
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      
      // Platform admin should be able to write to admin collections
      await expect(
        db.collection('admin').doc('featureFlags').set({
          bookingAlpha: true,
          paymentsAlpha: false
        })
      ).resolves.not.toThrow();
    });

    test('platform admin can create organizations', async () => {
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      
      await expect(
        db.collection('orgs').doc('org-123').set(mockOrgData)
      ).resolves.not.toThrow();
    });
  });

  describe('Organization Access Control', () => {
    beforeEach(async () => {
      // Set up test organization
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await db.collection('orgs').doc('org-123').set(mockOrgData);
    });

    test('org owner can read and write organization', async () => {
      const db = testEnv.authenticatedContext('org-owner-123', mockOrgOwner).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);

      // Should be able to write
      await expect(
        db.collection('orgs').doc('org-123').update({
          name: 'Updated Organization'
        })
      ).resolves.not.toThrow();
    });

    test('org admin can read and write organization', async () => {
      const db = testEnv.authenticatedContext('org-admin-123', mockOrgAdmin).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);

      // Should be able to write
      await expect(
        db.collection('orgs').doc('org-123').update({
          name: 'Updated Organization'
        })
      ).resolves.not.toThrow();
    });

    test('store manager cannot write organization', async () => {
      const db = testEnv.authenticatedContext('store-manager-123', mockStoreManager).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);

      // Should not be able to write
      await expect(
        db.collection('orgs').doc('org-123').update({
          name: 'Updated Organization'
        })
      ).rejects.toThrow();
    });

    test('professional cannot write organization', async () => {
      const db = testEnv.authenticatedContext('professional-123', mockProfessional).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);

      // Should not be able to write
      await expect(
        db.collection('orgs').doc('org-123').update({
          name: 'Updated Organization'
        })
      ).rejects.toThrow();
    });

    test('viewer can only read organization', async () => {
      const db = testEnv.authenticatedContext('viewer-123', mockViewer).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);

      // Should not be able to write
      await expect(
        db.collection('orgs').doc('org-123').update({
          name: 'Updated Organization'
        })
      ).rejects.toThrow();
    });

    test('non-member cannot access organization', async () => {
      const db = testEnv.authenticatedContext('test-user-123', mockUser).firestore();
      
      // Should not be able to read
      await expect(
        db.collection('orgs').doc('org-123').get()
      ).rejects.toThrow();
    });
  });

  describe('Store Access Control', () => {
    beforeEach(async () => {
      // Set up test organization and store
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await db.collection('orgs').doc('org-123').set(mockOrgData);
      await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').set(mockStoreData);
    });

    test('org admin can read and write stores', async () => {
      const db = testEnv.authenticatedContext('org-admin-123', mockOrgAdmin).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').get();
      expect(doc.exists).toBe(true);

      // Should be able to write
      await expect(
        db.collection('orgs').doc('org-123').collection('stores').doc('store-123').update({
          name: 'Updated Store'
        })
      ).resolves.not.toThrow();
    });

    test('store manager can read and write stores', async () => {
      const db = testEnv.authenticatedContext('store-manager-123', mockStoreManager).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').get();
      expect(doc.exists).toBe(true);

      // Should be able to write
      await expect(
        db.collection('orgs').doc('org-123').collection('stores').doc('store-123').update({
          name: 'Updated Store'
        })
      ).resolves.not.toThrow();
    });

    test('professional can read but not write stores', async () => {
      const db = testEnv.authenticatedContext('professional-123', mockProfessional).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').get();
      expect(doc.exists).toBe(true);

      // Should not be able to write
      await expect(
        db.collection('orgs').doc('org-123').collection('stores').doc('store-123').update({
          name: 'Updated Store'
        })
      ).rejects.toThrow();
    });

    test('viewer can only read stores', async () => {
      const db = testEnv.authenticatedContext('viewer-123', mockViewer).firestore();
      
      // Should be able to read
      const doc = await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').get();
      expect(doc.exists).toBe(true);

      // Should not be able to write
      await expect(
        db.collection('orgs').doc('org-123').collection('stores').doc('store-123').update({
          name: 'Updated Store'
        })
      ).rejects.toThrow();
    });
  });

  describe('Professional Access Control', () => {
    beforeEach(async () => {
      // Set up test organization and professional
      const db = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await db.collection('orgs').doc('org-123').set(mockOrgData);
      await db.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').set(mockProfessionalData);
    });

    test('professional can update own profile', async () => {
      const db = testEnv.authenticatedContext('professional-123', mockProfessional).firestore();
      
      // Should be able to update own profile
      await expect(
        db.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').update({
          bio: 'Updated bio'
        })
      ).resolves.not.toThrow();
    });

    test('professional cannot update other profiles', async () => {
      const db = testEnv.authenticatedContext('professional-123', mockProfessional).firestore();
      
      // Create another professional
      await db.collection('orgs').doc('org-123').collection('professionals').doc('other-professional').set({
        ...mockProfessionalData,
        id: 'other-professional',
        userId: 'other-user-123'
      });

      // Should not be able to update other professional's profile
      await expect(
        db.collection('orgs').doc('org-123').collection('professionals').doc('other-professional').update({
          bio: 'Updated bio'
        })
      ).rejects.toThrow();
    });

    test('org admin can update any professional profile', async () => {
      const db = testEnv.authenticatedContext('org-admin-123', mockOrgAdmin).firestore();
      
      // Should be able to update any professional profile
      await expect(
        db.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').update({
          bio: 'Updated bio by admin'
        })
      ).resolves.not.toThrow();
    });

    test('store manager can update any professional profile', async () => {
      const db = testEnv.authenticatedContext('store-manager-123', mockStoreManager).firestore();
      
      // Should be able to update any professional profile
      await expect(
        db.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').update({
          bio: 'Updated bio by manager'
        })
      ).resolves.not.toThrow();
    });
  });

  describe('Public Links Access', () => {
    test('anyone can read public links', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up a public link
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('publicLinks').doc('link-123').set(mockPublicLinkData);

      // Unauthenticated user should be able to read
      const doc = await db.collection('publicLinks').doc('link-123').get();
      expect(doc.exists).toBe(true);
    });

    test('org members can create public links', async () => {
      const db = testEnv.authenticatedContext('org-admin-123', mockOrgAdmin).firestore();
      
      // Should be able to create public link for their org
      await expect(
        db.collection('publicLinks').doc('link-123').set(mockPublicLinkData)
      ).resolves.not.toThrow();
    });

    test('non-members cannot create public links', async () => {
      const db = testEnv.authenticatedContext('test-user-123', mockUser).firestore();
      
      // Should not be able to create public link
      await expect(
        db.collection('publicLinks').doc('link-123').set(mockPublicLinkData)
      ).rejects.toThrow();
    });
  });

  describe('Waitlist Access', () => {
    test('unauthenticated users can create waitlist entries', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Should be able to create waitlist entry
      await expect(
        db.collection('waitlist').doc('waitlist-123').set(mockWaitlistData)
      ).resolves.not.toThrow();
    });

    test('unauthenticated users can read waitlist entries', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up a waitlist entry
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('waitlist').doc('waitlist-123').set(mockWaitlistData);

      // Should be able to read
      const doc = await db.collection('waitlist').doc('waitlist-123').get();
      expect(doc.exists).toBe(true);
    });

    test('unauthenticated users cannot update waitlist entries', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up a waitlist entry
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('waitlist').doc('waitlist-123').set(mockWaitlistData);

      // Should not be able to update
      await expect(
        db.collection('waitlist').doc('waitlist-123').update({
          status: 'confirmed'
        })
      ).rejects.toThrow();
    });
  });

  describe('User Profile Access', () => {
    test('users can read and update their own profile', async () => {
      const db = testEnv.authenticatedContext('test-user-123', mockUser).firestore();
      
      // Create user profile
      await db.collection('users').doc('test-user-123').set({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['viewer'],
        createdAt: new Date()
      });

      // Should be able to read own profile
      const doc = await db.collection('users').doc('test-user-123').get();
      expect(doc.exists).toBe(true);

      // Should be able to update own profile
      await expect(
        db.collection('users').doc('test-user-123').update({
          displayName: 'Updated Name'
        })
      ).resolves.not.toThrow();
    });

    test('users cannot update their own roles', async () => {
      const db = testEnv.authenticatedContext('test-user-123', mockUser).firestore();
      
      // Create user profile
      await db.collection('users').doc('test-user-123').set({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        roles: ['viewer'],
        createdAt: new Date()
      });

      // Should not be able to update roles
      await expect(
        db.collection('users').doc('test-user-123').update({
          roles: ['admin']
        })
      ).rejects.toThrow();
    });

    test('users cannot read other users profiles', async () => {
      const db = testEnv.authenticatedContext('test-user-123', mockUser).firestore();
      
      // Create another user profile
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('users').doc('other-user').set({
        uid: 'other-user',
        email: 'other@example.com',
        displayName: 'Other User',
        roles: ['viewer'],
        createdAt: new Date()
      });

      // Should not be able to read other user's profile
      await expect(
        db.collection('users').doc('other-user').get()
      ).rejects.toThrow();
    });
  });

  describe('Public Organization Access', () => {
    test('public can read public organizations', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up public organization
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('orgs').doc('org-123').set({
        ...mockOrgData,
        public: true
      });

      // Unauthenticated user should be able to read
      const doc = await db.collection('orgs').doc('org-123').get();
      expect(doc.exists).toBe(true);
    });

    test('public can read stores of public organizations', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up public organization and store
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('orgs').doc('org-123').set({
        ...mockOrgData,
        public: true
      });
      await adminDb.collection('orgs').doc('org-123').collection('stores').doc('store-123').set(mockStoreData);

      // Unauthenticated user should be able to read store
      const doc = await db.collection('orgs').doc('org-123').collection('stores').doc('store-123').get();
      expect(doc.exists).toBe(true);
    });

    test('public can read professionals of public organizations', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      
      // Set up public organization and professional
      const adminDb = testEnv.authenticatedContext('platform-admin-123', mockPlatformAdmin).firestore();
      await adminDb.collection('orgs').doc('org-123').set({
        ...mockOrgData,
        public: true
      });
      await adminDb.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').set(mockProfessionalData);

      // Unauthenticated user should be able to read professional
      const doc = await db.collection('orgs').doc('org-123').collection('professionals').doc('professional-123').get();
      expect(doc.exists).toBe(true);
    });
  });
});
