/**
 * Brand header component
 * Displays brand logo, name, and applies brand colors
 */

import React from 'react';
import { useTheme } from '../../lib/theme';
import type { Brand } from '../../types/booking';

interface BrandHeaderProps {
  brand: Brand;
  className?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ brand, className = '' }) => {
  const { primaryColor, secondaryColor } = useTheme(brand);

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Brand Logo */}
      {brand.logoUrl && (
        <div className="flex-shrink-0">
          <img
            src={brand.logoUrl}
            alt={`${brand.name} logo`}
            className="w-12 h-12 rounded-lg object-cover"
          />
        </div>
      )}

      {/* Brand Info */}
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-900 truncate">{brand.name}</h1>
        {brand.tagline && (
          <p className="text-sm text-gray-600 mt-1">{brand.tagline}</p>
        )}
      </div>

      {/* Brand Colors Preview */}
      {brand.colors && (
        <div className="flex space-x-2">
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: primaryColor }}
            title="Primary color"
          />
          <div
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: secondaryColor }}
            title="Secondary color"
          />
        </div>
      )}
    </div>
  );
};
