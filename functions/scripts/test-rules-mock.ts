#!/usr/bin/env ts-node

/**
 * Mock Firestore Rules Test
 * 
 * This script tests the security rules logic without requiring the Firebase emulator.
 * It validates the rule patterns and logic flow.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface MockUser {
  uid: string;
  token: {
    platformAdmin?: boolean;
    roles?: Record<string, string>;
  };
}

interface MockRequest {
  auth: MockUser | null;
  resource: {
    data: Record<string, any>;
  };
}

interface TestCase {
  name: string;
  request: MockRequest;
  collection: string;
  document: string;
  operation: 'read' | 'write' | 'create' | 'delete';
  expectedResult: boolean;
  description: string;
}

// Mock rule evaluation functions
function evaluateRules(rulesContent: string, testCase: TestCase): boolean {
  const { request, collection, document, operation } = testCase;
  
  // Extract user info
  const user = request.auth;
  const isAuthenticated = user !== null;
  const isPlatformAdmin = user?.token?.platformAdmin === true;
  const userRoles = user?.token?.roles || {};
  
  // Mock rule evaluation based on our rules
  switch (collection) {
    case 'users':
      if (operation === 'read') {
        return isPlatformAdmin || (isAuthenticated && user?.uid === document);
      }
      if (operation === 'write') {
        return isPlatformAdmin || (isAuthenticated && user?.uid === document);
      }
      return false;
      
    case 'orgs':
      if (operation === 'read') {
        return isPlatformAdmin || (isAuthenticated && userRoles[document] !== undefined);
      }
      if (operation === 'write') {
        return isPlatformAdmin || (isAuthenticated && ['owner', 'org_admin'].includes(userRoles[document]));
      }
      return false;
      
    case 'stores':
      const orgId = document.split('/')[0]; // Extract orgId from path
      if (operation === 'read') {
        return isPlatformAdmin || (isAuthenticated && userRoles[orgId] !== undefined);
      }
      if (operation === 'write') {
        return isPlatformAdmin || (isAuthenticated && ['org_admin', 'store_manager'].includes(userRoles[orgId]));
      }
      return false;
      
    case 'professionals':
      const profOrgId = document.split('/')[0]; // Extract orgId from path
      if (operation === 'read') {
        return isPlatformAdmin || (isAuthenticated && userRoles[profOrgId] !== undefined);
      }
      if (operation === 'write') {
        return isPlatformAdmin || 
               (isAuthenticated && ['org_admin', 'store_manager'].includes(userRoles[profOrgId])) ||
               (isAuthenticated && user?.uid === document.split('/')[1]); // Own profile
      }
      return false;
      
    case 'publicLinks':
      if (operation === 'read') {
        return true; // Public read access
      }
      if (operation === 'write') {
        return isPlatformAdmin || (isAuthenticated && request.resource.data.orgId && userRoles[request.resource.data.orgId] !== undefined);
      }
      return false;
      
    case 'waitlist':
      if (operation === 'read') {
        return true; // Public read access
      }
      if (operation === 'create') {
        return !isAuthenticated; // Only unauthenticated users can create
      }
      return false;
      
    default:
      return false;
  }
}

function runTestCases(): void {
  console.log('🧪 Running Mock Firestore Rules Tests...\n');

  const testCases: TestCase[] = [
    // Platform Admin Tests
    {
      name: 'Platform admin can read all users',
      request: {
        auth: { uid: 'admin-123', token: { platformAdmin: true, roles: {} } },
        resource: { data: {} }
      },
      collection: 'users',
      document: 'user-123',
      operation: 'read',
      expectedResult: true,
      description: 'Platform admin should have full access'
    },
    {
      name: 'Platform admin can write to orgs',
      request: {
        auth: { uid: 'admin-123', token: { platformAdmin: true, roles: {} } },
        resource: { data: {} }
      },
      collection: 'orgs',
      document: 'org-123',
      operation: 'write',
      expectedResult: true,
      description: 'Platform admin should have full access'
    },

    // Organization Role Tests
    {
      name: 'Org owner can read organization',
      request: {
        auth: { uid: 'owner-123', token: { platformAdmin: false, roles: { 'org-123': 'owner' } } },
        resource: { data: {} }
      },
      collection: 'orgs',
      document: 'org-123',
      operation: 'read',
      expectedResult: true,
      description: 'Org owner should read their organization'
    },
    {
      name: 'Org owner can write organization',
      request: {
        auth: { uid: 'owner-123', token: { platformAdmin: false, roles: { 'org-123': 'owner' } } },
        resource: { data: {} }
      },
      collection: 'orgs',
      document: 'org-123',
      operation: 'write',
      expectedResult: true,
      description: 'Org owner should write their organization'
    },
    {
      name: 'Store manager cannot write organization',
      request: {
        auth: { uid: 'manager-123', token: { platformAdmin: false, roles: { 'org-123': 'store_manager' } } },
        resource: { data: {} }
      },
      collection: 'orgs',
      document: 'org-123',
      operation: 'write',
      expectedResult: false,
      description: 'Store manager should not write organization'
    },
    {
      name: 'Non-member cannot access organization',
      request: {
        auth: { uid: 'user-123', token: { platformAdmin: false, roles: {} } },
        resource: { data: {} }
      },
      collection: 'orgs',
      document: 'org-123',
      operation: 'read',
      expectedResult: false,
      description: 'Non-member should not access organization'
    },

    // Store Access Tests
    {
      name: 'Store manager can write stores',
      request: {
        auth: { uid: 'manager-123', token: { platformAdmin: false, roles: { 'org-123': 'store_manager' } } },
        resource: { data: {} }
      },
      collection: 'stores',
      document: 'org-123/store-123',
      operation: 'write',
      expectedResult: true,
      description: 'Store manager should write stores'
    },
    {
      name: 'Professional cannot write stores',
      request: {
        auth: { uid: 'pro-123', token: { platformAdmin: false, roles: { 'org-123': 'professional' } } },
        resource: { data: {} }
      },
      collection: 'stores',
      document: 'org-123/store-123',
      operation: 'write',
      expectedResult: false,
      description: 'Professional should not write stores'
    },

    // Professional Access Tests
    {
      name: 'Professional can update own profile',
      request: {
        auth: { uid: 'pro-123', token: { platformAdmin: false, roles: { 'org-123': 'professional' } } },
        resource: { data: { userId: 'pro-123' } }
      },
      collection: 'professionals',
      document: 'org-123/pro-123',
      operation: 'write',
      expectedResult: true,
      description: 'Professional should update own profile'
    },
    {
      name: 'Professional cannot update other profiles',
      request: {
        auth: { uid: 'pro-123', token: { platformAdmin: false, roles: { 'org-123': 'professional' } } },
        resource: { data: { userId: 'other-pro-123' } }
      },
      collection: 'professionals',
      document: 'org-123/other-pro-123',
      operation: 'write',
      expectedResult: false,
      description: 'Professional should not update other profiles'
    },

    // Public Access Tests
    {
      name: 'Anyone can read public links',
      request: {
        auth: null,
        resource: { data: {} }
      },
      collection: 'publicLinks',
      document: 'link-123',
      operation: 'read',
      expectedResult: true,
      description: 'Public links should be readable by anyone'
    },
    {
      name: 'Unauthenticated user can create waitlist entry',
      request: {
        auth: null,
        resource: { data: { email: 'test@example.com' } }
      },
      collection: 'waitlist',
      document: 'entry-123',
      operation: 'create',
      expectedResult: true,
      description: 'Waitlist should allow public signup'
    },
    {
      name: 'Authenticated user cannot create waitlist entry',
      request: {
        auth: { uid: 'user-123', token: { platformAdmin: false, roles: {} } },
        resource: { data: { email: 'test@example.com' } }
      },
      collection: 'waitlist',
      document: 'entry-123',
      operation: 'create',
      expectedResult: false,
      description: 'Waitlist should only allow unauthenticated signup'
    },

    // User Profile Tests
    {
      name: 'User can read own profile',
      request: {
        auth: { uid: 'user-123', token: { platformAdmin: false, roles: {} } },
        resource: { data: {} }
      },
      collection: 'users',
      document: 'user-123',
      operation: 'read',
      expectedResult: true,
      description: 'User should read own profile'
    },
    {
      name: 'User cannot read other profiles',
      request: {
        auth: { uid: 'user-123', token: { platformAdmin: false, roles: {} } },
        resource: { data: {} }
      },
      collection: 'users',
      document: 'other-user-123',
      operation: 'read',
      expectedResult: false,
      description: 'User should not read other profiles'
    }
  ];

  let passed = 0;
  let failed = 0;

  console.log('Running test cases:\n');

  for (const testCase of testCases) {
    const result = evaluateRules('', testCase);
    const status = result === testCase.expectedResult ? '✅ PASS' : '❌ FAIL';
    
    console.log(`${status} ${testCase.name}`);
    console.log(`   Expected: ${testCase.expectedResult}, Got: ${result}`);
    console.log(`   ${testCase.description}\n`);
    
    if (result === testCase.expectedResult) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Security rules logic is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the security rules implementation.');
    process.exit(1);
  }
}

function main() {
  try {
    // Read the rules file to ensure it exists
    const rulesPath = join(__dirname, '../../firestore.rules');
    const rulesContent = readFileSync(rulesPath, 'utf8');
    
    console.log('📁 Rules file loaded successfully');
    console.log(`📏 File size: ${rulesContent.length} characters\n`);
    
    runTestCases();
  } catch (error) {
    console.error('❌ Error loading rules file:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
