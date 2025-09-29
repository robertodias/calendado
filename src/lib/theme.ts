/**
 * Theme management hook
 * Applies brand colors via CSS variables
 */

import { useEffect } from 'react';
import type { Brand } from '../types/booking';

export function useTheme(brand?: Brand) {
  useEffect(() => {
    if (!brand?.colors) {
      // Reset to default colors
      document.documentElement.style.setProperty('--brand-primary', '');
      document.documentElement.style.setProperty('--brand-secondary', '');
      return;
    }

    // Apply brand colors
    if (brand.colors.primary) {
      document.documentElement.style.setProperty('--brand-primary', brand.colors.primary);
    }
    if (brand.colors.secondary) {
      document.documentElement.style.setProperty('--brand-secondary', brand.colors.secondary);
    }
  }, [brand?.colors]);

  return {
    primaryColor: brand?.colors?.primary || 'var(--primary-600)',
    secondaryColor: brand?.colors?.secondary || 'var(--secondary-600)',
  };
}
