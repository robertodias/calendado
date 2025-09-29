/**
 * Professional card component
 * Displays professional information in a card layout
 */

import React from 'react';
import { User, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import type { Professional } from '../../types/booking';

interface ProfessionalCardProps {
  professional: Professional;
  onViewProfessional: (professional: Professional) => void;
  className?: string;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ 
  professional, 
  onViewProfessional, 
  className = '' 
}) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardContent className="p-6">
        {/* Professional Avatar */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            {professional.avatarUrl ? (
              <img
                src={professional.avatarUrl}
                alt={`${professional.displayName} avatar`}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Professional Name */}
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {professional.displayName}
            </h3>

            {/* Professional Role */}
            {professional.role && (
              <Badge variant="secondary" className="mt-1">
                {professional.role}
              </Badge>
            )}
          </div>
        </div>

        {/* Professional Bio */}
        {professional.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {professional.bio}
          </p>
        )}

        {/* Services Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {professional.services.length} service{professional.services.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>

        {/* View Professional Button */}
        <Button
          onClick={() => onViewProfessional(professional)}
          className="w-full"
          variant="outline"
        >
          View Profile
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};
