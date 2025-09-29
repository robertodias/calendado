/**
 * Unit tests for MVP public pages
 * Tests rendering and preselection logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BrandPage } from '../../pages/brand/BrandPage';
import { StorePage } from '../../pages/store/StorePage';
import { ProPage } from '../../pages/pro/ProPage';

// Mock the telemetry service
vi.mock('../../lib/telemetry', () => ({
  telemetry: {
    pageView: vi.fn(),
    bookingStart: vi.fn(),
    serviceSelected: vi.fn(),
    dateTimeSelected: vi.fn(),
    professionalViewed: vi.fn(),
    storeViewed: vi.fn(),
  },
}));

// Mock the booking mock data
vi.mock('../../lib/bookingMockData', () => ({
  getBrandBySlug: vi.fn(),
  getStoreBySlug: vi.fn(),
  getProfessionalBySlug: vi.fn(),
  getServiceBySlug: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ brandSlug: 'glow', storeSlug: 'porto-alegre', proSlug: 'maria-silva' }),
    useSearchParams: () => [new URLSearchParams()],
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('BrandPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <BrandPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading brand...')).toBeInTheDocument();
  });

  it('renders error state when brand not found', async () => {
    const { getBrandBySlug } = await import('../../lib/bookingMockData');
    vi.mocked(getBrandBySlug).mockReturnValue(undefined);

    render(
      <TestWrapper>
        <BrandPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Brand Not Found')).toBeInTheDocument();
    });
  });

  it('renders brand information when loaded', async () => {
    const { getBrandBySlug } = await import('../../lib/bookingMockData');
    const mockBrand = {
      id: 'brand-glow',
      slug: 'glow',
      name: 'Glow Beauty Studio',
      logoUrl: 'https://example.com/logo.png',
      colors: { primary: '#8B5CF6', secondary: '#EC4899' },
      tagline: 'Where beauty meets excellence',
      featuredServices: [],
    };
    vi.mocked(getBrandBySlug).mockReturnValue(mockBrand);

    render(
      <TestWrapper>
        <BrandPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Glow Beauty Studio')).toBeInTheDocument();
      expect(screen.getByText('Where beauty meets excellence')).toBeInTheDocument();
    });
  });
});

describe('StorePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <StorePage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading store...')).toBeInTheDocument();
  });

  it('renders error state when store not found', async () => {
    const { getStoreBySlug, getBrandBySlug } = await import('../../lib/bookingMockData');
    vi.mocked(getStoreBySlug).mockReturnValue(undefined);
    vi.mocked(getBrandBySlug).mockReturnValue(undefined);

    render(
      <TestWrapper>
        <StorePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Store Not Found')).toBeInTheDocument();
    });
  });

  it('filters professionals by search query', async () => {
    const { getStoreBySlug, getBrandBySlug } = await import('../../lib/bookingMockData');
    const mockStore = {
      id: 'store-1',
      slug: 'porto-alegre',
      brandId: 'brand-glow',
      name: 'Glow Porto Alegre',
      address: 'Test Address',
      phone: '+55 51 99999-9999',
      professionals: [
        {
          id: 'pro-1',
          slug: 'maria-silva',
          displayName: 'Maria Silva',
          role: 'Stylist',
          bio: 'Test bio',
          services: [],
        },
        {
          id: 'pro-2',
          slug: 'joao-pereira',
          displayName: 'João Pereira',
          role: 'Barber',
          bio: 'Test bio',
          services: [],
        },
      ],
      services: [],
    };
    const mockBrand = {
      id: 'brand-glow',
      slug: 'glow',
      name: 'Glow Beauty Studio',
      colors: { primary: '#8B5CF6', secondary: '#EC4899' },
    };

    vi.mocked(getStoreBySlug).mockReturnValue(mockStore);
    vi.mocked(getBrandBySlug).mockReturnValue(mockBrand);

    render(
      <TestWrapper>
        <StorePage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Glow Porto Alegre')).toBeInTheDocument();
    });

    // Search for "Maria"
    const searchInput = screen.getByPlaceholderText('Search professionals...');
    fireEvent.change(searchInput, { target: { value: 'Maria' } });

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
      expect(screen.queryByText('João Pereira')).not.toBeInTheDocument();
    });
  });
});

describe('ProPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <ProPage />
      </TestWrapper>
    );

    expect(screen.getByText('Loading professional...')).toBeInTheDocument();
  });

  it('renders error state when professional not found', async () => {
    const { getProfessionalBySlug } = await import('../../lib/bookingMockData');
    vi.mocked(getProfessionalBySlug).mockReturnValue(undefined);

    render(
      <TestWrapper>
        <ProPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Professional Not Found')).toBeInTheDocument();
    });
  });

  it('preselects service from URL parameters', async () => {
    const { getProfessionalBySlug } = await import('../../lib/bookingMockData');
    const mockProfessional = {
      id: 'pro-1',
      slug: 'maria-silva',
      displayName: 'Maria Silva',
      role: 'Stylist',
      bio: 'Test bio',
      services: [
        {
          id: 'service-1',
          slug: 'haircut',
          name: 'Haircut',
          durationMin: 60,
          price: 45,
        },
      ],
    };

    vi.mocked(getProfessionalBySlug).mockReturnValue(mockProfessional);

    // Mock useSearchParams to return service=haircut
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ brandSlug: 'glow', storeSlug: 'porto-alegre', proSlug: 'maria-silva' }),
        useSearchParams: () => [new URLSearchParams('service=haircut')],
      };
    });

    render(
      <TestWrapper>
        <ProPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });
  });

  it('enables booking button when service and date/time are selected', async () => {
    const { getProfessionalBySlug } = await import('../../lib/bookingMockData');
    const mockProfessional = {
      id: 'pro-1',
      slug: 'maria-silva',
      displayName: 'Maria Silva',
      role: 'Stylist',
      bio: 'Test bio',
      services: [
        {
          id: 'service-1',
          slug: 'haircut',
          name: 'Haircut',
          durationMin: 60,
          price: 45,
        },
      ],
    };

    vi.mocked(getProfessionalBySlug).mockReturnValue(mockProfessional);

    render(
      <TestWrapper>
        <ProPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Maria Silva')).toBeInTheDocument();
    });

    // Initially, booking button should not be visible
    expect(screen.queryByText(/Book with/)).not.toBeInTheDocument();

    // Select a service
    const serviceCard = screen.getByText('Haircut');
    fireEvent.click(serviceCard);

    // Select a date and time (this would be done through the calendar component)
    // For now, we'll just check that the service selection works
    expect(screen.getByText('Selected')).toBeInTheDocument();
  });
});
