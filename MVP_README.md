# Calendado MVP Public Pages

This document describes the MVP implementation of Calendado's public booking pages, designed to provide a clean, theme-aware, and composable UI for the booking flow.

## 🎯 Overview

The MVP includes three main page types that form the complete booking journey:

1. **Brand Page** (`/mvp/:brandSlug`) - Brand discovery and store selection
2. **Store Page** (`/mvp/:brandSlug/:storeSlug`) - Professional and service browsing
3. **Professional Page** (`/mvp/:brandSlug/:storeSlug/:proSlug` or `/mvp/u/:proSlug`) - Booking interface

## 🏗️ Architecture

### Data Contracts

All data types are defined in `src/types/booking.ts`:

```typescript
interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  colors?: { primary: string; secondary: string };
  tagline?: string;
  featuredServices?: Service[];
}

interface Store {
  id: string;
  slug: string;
  brandId: string;
  name: string;
  address?: string;
  phone?: string;
  professionals: Professional[];
  services?: Service[];
}

interface Professional {
  id: string;
  slug: string;
  brandId?: string;
  storeId?: string;
  displayName: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  services: Service[];
}

interface Service {
  id: string;
  slug: string;
  name: string;
  durationMin: number;
  price: number;
  description?: string;
}
```

### Theme System

The `useTheme` hook applies brand colors via CSS variables:

```typescript
const { primaryColor, secondaryColor } = useTheme(brand);
```

This automatically sets `--brand-primary` and `--brand-secondary` CSS variables that can be used throughout the application.

### Telemetry

All user interactions are tracked via the telemetry service:

```typescript
// Page views
telemetry.pageView({ type: 'brand', id, slug, brandId });

// Booking flow
telemetry.bookingStart({ serviceId, professionalId, selectedDate, selectedTime });

// Service selection
telemetry.serviceSelected(serviceId, serviceSlug);
```

## 📱 Pages

### Brand Page (`/mvp/:brandSlug`)

**Features:**
- Brand header with logo, name, and tagline
- Featured services grid
- Store locations grid
- Brand color theming
- Call-to-action for store selection

**Components:**
- `BrandHeader` - Brand identity display
- `StoreCard` - Store information cards
- `ServiceCard` - Featured service cards

### Store Page (`/mvp/:brandSlug/:storeSlug`)

**Features:**
- Store information header
- Professional search and filtering
- Services panel
- Professional grid with avatars and roles
- Breadcrumb navigation

**Components:**
- `ProfessionalCard` - Professional information cards
- `ServiceCard` - Service selection cards
- Search and filter controls

### Professional Page (`/mvp/:brandSlug/:storeSlug/:proSlug`)

**Features:**
- Professional profile header
- Service selection with pricing
- Calendar placeholder for availability
- Booking confirmation modal
- URL parameter preselection (`?service=slug&date=YYYY-MM-DD`)

**Components:**
- `ServiceCard` - Service selection
- `CalendarPlaceholder` - Mock availability calendar
- `BookingSummaryModal` - Booking confirmation

## 🧩 Shared Components

### BrandHeader
Displays brand logo, name, tagline, and color preview.

### StoreCard
Shows store information including address, phone, and professional count.

### ProfessionalCard
Displays professional avatar, name, role, bio, and service count.

### ServiceCard
Shows service details with duration, price, and selection state.

### CalendarPlaceholder
Mock calendar interface with available time slots.

### BookingSummaryModal
Confirmation modal with booking details and pricing.

## 🎨 Theming

Each brand can define custom colors that are applied throughout the booking flow:

```typescript
const brand: Brand = {
  colors: {
    primary: '#8B5CF6',  // Purple
    secondary: '#EC4899' // Pink
  }
};
```

The theme hook automatically applies these colors via CSS variables, ensuring consistent branding across all pages.

## 🔍 Search & Filtering

The store page includes:
- **Text search** - Search professionals by name or role
- **Service filter** - Filter by available services
- **Real-time filtering** - Results update as you type

## 📊 Telemetry Events

All user interactions are tracked for analytics:

- `page_view` - Page navigation
- `service_selected` - Service selection
- `datetime_selected` - Date/time selection
- `booking_start` - Booking initiation
- `professional_viewed` - Professional profile views
- `store_viewed` - Store page views

## 🧪 Testing

Unit tests are provided in `src/lib/__tests__/pages.test.tsx` covering:

- Component rendering
- Search and filtering functionality
- URL parameter preselection
- Error states and loading states

Run tests with:
```bash
npm test
```

## 🚀 Demo

Visit `/demo` to see a showcase of all MVP pages with sample data.

## 📁 File Structure

```
src/
├── pages/
│   ├── brand/
│   │   └── BrandPage.tsx
│   ├── store/
│   │   └── StorePage.tsx
│   ├── pro/
│   │   └── ProPage.tsx
│   └── Demo.tsx
├── components/
│   └── public/
│       ├── BrandHeader.tsx
│       ├── StoreCard.tsx
│       ├── ProfessionalCard.tsx
│       ├── ServiceCard.tsx
│       ├── CalendarPlaceholder.tsx
│       └── BookingSummaryModal.tsx
├── types/
│   └── booking.ts
├── lib/
│   ├── theme.ts
│   ├── telemetry.ts
│   ├── bookingMockData.ts
│   └── __tests__/
│       └── pages.test.tsx
```

## 🔧 Development

### Adding New Brands

1. Add brand data to `bookingMockData.ts`
2. Add stores and professionals
3. Test with `/mvp/your-brand-slug`

### Customizing Components

All components are designed to be composable and theme-aware. They automatically adapt to brand colors and can be easily customized.

### Extending Functionality

The architecture is designed to be extensible:

- Add new service types
- Implement real calendar integration
- Add payment processing
- Integrate with booking APIs

## 🎯 Future Enhancements

- **Real Calendar Integration** - Replace placeholder with actual availability
- **Payment Processing** - Add payment flow to booking modal
- **Analytics Dashboard** - Real-time booking analytics
- **SEO Optimization** - Meta tags and structured data
- **Mobile App** - React Native implementation
- **Multi-language Support** - Internationalization
- **Advanced Filtering** - Price range, availability, ratings

## 📝 Notes

- All components are fully accessible with proper ARIA labels
- Responsive design works on all screen sizes
- Mock data is provided for development and testing
- Production integration points are clearly marked
- Error handling is comprehensive with user-friendly messages
