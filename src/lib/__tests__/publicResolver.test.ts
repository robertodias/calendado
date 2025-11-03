/**
 * Unit tests for public resolver
 * Tests precedence, mismatch correction, solo path, disabled/404, and redirects
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolvePublicContext } from '../publicResolver';
import { mockData } from '../mockData';
import type { ResolverSlugs } from '../publicTypes';
import * as firestore from 'firebase/firestore';
import * as redirects from '../redirects';
import type {
  QueryDocumentSnapshot,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';

// Mock Firebase
vi.mock('../../firebase', () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
}));

// Mock telemetry
vi.mock('../telemetry', () => ({
  trackResolverHit: vi.fn(),
  trackMismatchCorrected: vi.fn(),
  trackNotFound: vi.fn(),
  trackError: vi.fn(),
}));

// Mock redirects
vi.mock('../redirects', () => ({
  findRedirectRule: vi.fn(),
}));

// Helper function to create a mock QueryDocumentSnapshot
function createMockQueryDocumentSnapshot<T = DocumentData>(
  id: string,
  data: T
): QueryDocumentSnapshot<T> {
  return {
    id,
    data: () => data,
    exists: () => true,
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
      isEqual: vi.fn(),
    },
    get: vi.fn(),
    toJSON: vi.fn(),
    ref: {} as unknown,
  } as unknown as QueryDocumentSnapshot<T>;
}

// Helper function to create a mock QuerySnapshot
function createMockQuerySnapshot<T = DocumentData>(
  docs: QueryDocumentSnapshot<T>[]
): QuerySnapshot<T> {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs,
    forEach: vi.fn(callback => {
      docs.forEach(callback);
    }),
    docChanges: vi.fn(),
    isEqual: vi.fn(),
    query: {} as unknown,
    toJSON: vi.fn(),
    metadata: {
      fromCache: false,
      hasPendingWrites: false,
      isEqual: vi.fn(),
    },
  } as unknown as QuerySnapshot<T>;
}

describe('Public Resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Brand Resolution', () => {
    it('should resolve brand successfully', async () => {
      const slugs: ResolverSlugs = { brand: 'glow' };

      // Mock Firestore response
      const mockBrand = mockData.brands[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockBrand.id, mockBrand);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('brand');
      expect(result.context?.entity.slug).toBe('glow');
    });

    it('should return 404 for non-existent brand', async () => {
      const slugs: ResolverSlugs = { brand: 'non-existent' };

      const mockSnapshot = createMockQuerySnapshot([]);
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });

    it('should return disabled for disabled brand', async () => {
      const slugs: ResolverSlugs = { brand: 'disabled-brand' };

      const disabledBrand = { ...mockData.brands[0], status: 'disabled' };
      const mockDoc = createMockQueryDocumentSnapshot(
        disabledBrand.id,
        disabledBrand
      );
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('disabled');
    });
  });

  describe('Store Resolution', () => {
    it('should resolve store successfully', async () => {
      const slugs: ResolverSlugs = { brand: 'glow', store: 'porto-alegre' };

      const mockStore = mockData.stores[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockStore.id, mockStore);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('store');
      expect(result.context?.entity.slug).toBe('porto-alegre');
    });

    it('should return 404 for non-existent store', async () => {
      const slugs: ResolverSlugs = { brand: 'glow', store: 'non-existent' };

      const mockSnapshot = createMockQuerySnapshot([]);
      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });
  });

  describe('Professional Resolution', () => {
    it('should resolve professional successfully', async () => {
      const slugs: ResolverSlugs = {
        brand: 'glow',
        store: 'porto-alegre',
        pro: 'maria-silva',
      };

      const mockPro = mockData.professionals[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockPro.id, mockPro);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('professional');
      expect(result.context?.entity.slug).toBe('maria-silva');
    });

    it('should handle mismatch and show correction', async () => {
      const slugs: ResolverSlugs = {
        brand: 'glow',
        store: 'centro',
        pro: 'maria-silva',
      };

      // Maria belongs to porto-alegre, not centro
      const mockPro = { ...mockData.professionals[0] };
      const mockDoc = createMockQueryDocumentSnapshot(mockPro.id, mockPro);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.isMismatch).toBe(true);
    });
  });

  describe('Solo Professional Resolution', () => {
    it('should resolve solo professional successfully', async () => {
      const slugs: ResolverSlugs = { soloPro: 'maria-silva' };

      const mockPro = mockData.professionals[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockPro.id, mockPro);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('professional');
      expect(result.context?.entity.slug).toBe('maria-silva');
    });

    it('should not redirect solo professional to brand route', async () => {
      const slugs: ResolverSlugs = { soloPro: 'maria-silva' };

      const mockPro = mockData.professionals[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockPro.id, mockPro);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('professional');
      // Should not have parent context for solo professional
      expect(result.context?.parent).toBeUndefined();
    });
  });

  describe('Redirect Handling', () => {
    it('should handle redirects before resolution', async () => {
      const slugs: ResolverSlugs = { brand: 'old-glow-brand' };

      vi.mocked(redirects.findRedirectRule).mockReturnValue({
        from: '/old-glow-brand',
        to: '/glow',
        type: '301',
        reason: 'Brand renamed',
      });

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('redirect');
      expect(result.redirect?.to).toBe('/glow');
      expect(result.redirect?.type).toBe('301');
    });
  });

  describe('Error Handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const slugs: ResolverSlugs = { brand: 'glow' };

      vi.mocked(firestore.getDocs).mockRejectedValue(
        new Error('Firestore error')
      );

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('not_found');
    });

    it('should handle invalid slugs', async () => {
      const slugs: ResolverSlugs = {};

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(false);
      expect(result.error).toBe('invalid_slug');
    });
  });

  describe('Precedence', () => {
    it('should prioritize professional over store over brand', async () => {
      const slugs: ResolverSlugs = {
        brand: 'glow',
        store: 'porto-alegre',
        pro: 'maria-silva',
      };

      const mockPro = mockData.professionals[0];
      const mockDoc = createMockQueryDocumentSnapshot(mockPro.id, mockPro);
      const mockSnapshot = createMockQuerySnapshot([mockDoc]);

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot);

      const result = await resolvePublicContext(slugs);

      expect(result.success).toBe(true);
      expect(result.context?.type).toBe('professional');
    });
  });
});
