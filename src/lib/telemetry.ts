/**
 * Telemetry system for tracking user interactions
 * Emits events for analytics and monitoring
 */

export interface TelemetryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
}

export interface PageViewEvent {
  type: 'brand' | 'store' | 'professional';
  id: string;
  slug: string;
  brandId?: string;
  storeId?: string;
  professionalId?: string;
}

export interface BookingStartEvent {
  serviceId: string;
  serviceSlug: string;
  professionalId?: string;
  professionalSlug?: string;
  selectedDate?: string;
  selectedTime?: string;
}

class TelemetryService {
  private events: TelemetryEvent[] = [];

  emit(event: string, properties: Record<string, any> = {}) {
    const telemetryEvent: TelemetryEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(telemetryEvent);

    // In development, log to console
    if (import.meta.env.DEV) {
      console.log('📊 Telemetry Event:', telemetryEvent);
    }

    // In production, you would send to your analytics service
    // Example: analytics.track(event, properties);
  }

  // Page view tracking
  pageView(data: PageViewEvent) {
    this.emit('page_view', {
      type: data.type,
      id: data.id,
      slug: data.slug,
      brandId: data.brandId,
      storeId: data.storeId,
      professionalId: data.professionalId,
    });
  }

  // Booking flow tracking
  bookingStart(data: BookingStartEvent) {
    this.emit('booking_start', {
      serviceId: data.serviceId,
      serviceSlug: data.serviceSlug,
      professionalId: data.professionalId,
      professionalSlug: data.professionalSlug,
      selectedDate: data.selectedDate,
      selectedTime: data.selectedTime,
    });
  }

  // Service selection tracking
  serviceSelected(serviceId: string, serviceSlug: string) {
    this.emit('service_selected', {
      serviceId,
      serviceSlug,
    });
  }

  // Date/time selection tracking
  dateTimeSelected(date: string, time: string) {
    this.emit('datetime_selected', {
      date,
      time,
    });
  }

  // Professional view tracking
  professionalViewed(professionalId: string, professionalSlug: string) {
    this.emit('professional_viewed', {
      professionalId,
      professionalSlug,
    });
  }

  // Store view tracking
  storeViewed(storeId: string, storeSlug: string) {
    this.emit('store_viewed', {
      storeId,
      storeSlug,
    });
  }

  // Get all events (for debugging)
  getEvents(): TelemetryEvent[] {
    return [...this.events];
  }

  // Clear events (for testing)
  clearEvents() {
    this.events = [];
  }
}

// Export singleton instance
export const telemetry = new TelemetryService();
