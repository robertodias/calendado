/**
 * Brand page component
 * Displays brand information and available stores
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Calendar,
  ArrowRight,
  // ExternalLink,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import { resolvePublicContext } from '../../lib/publicResolver';
import { storeUrl, proUrl } from '../../lib/buildPublicUrl';
import { PublicNotFound, PublicDisabled, PublicError } from '../../components/public/Errors';
import { MismatchBanner } from '../../components/public/Banner';
import type { ResolvedContext } from '../../lib/publicTypes';

// ============================================================================
// BRAND PAGE COMPONENT
// ============================================================================

const BrandPage: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const navigate = useNavigate();
  
  const [context, setContext] = useState<ResolvedContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMismatchBanner, setShowMismatchBanner] = useState(false);

  useEffect(() => {
    if (!brandSlug) {
      setError('Brand slug is required');
      setLoading(false);
      return;
    }

    loadBrandContext();
  }, [brandSlug]);

  const loadBrandContext = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await resolvePublicContext({ brand: brandSlug });
      
      if (!result.success) {
        if (result.error === 'disabled') {
          setError('disabled');
        } else if (result.error === 'not_found') {
          setError('not_found');
        } else {
          setError('error');
        }
        return;
      }

      if (result.context) {
        setContext(result.context);
        
        // Show mismatch banner if there's a corrected context
        if (result.context.isMismatch && result.context.correctedContext) {
          setShowMismatchBanner(true);
        }
      }
    } catch (err) {
      console.error('Error loading brand context:', err);
      setError('error');
    } finally {
      setLoading(false);
    }
  };

  const handleMismatchBannerDismiss = () => {
    setShowMismatchBanner(false);
  };

  const handleMismatchBannerAction = () => {
    if (context?.correctedContext) {
      // Navigate to corrected context
      const corrected = context.correctedContext;
      if (corrected.type === 'store') {
        navigate(storeUrl(corrected.parent?.brand?.slug || '', corrected.entity.slug));
      } else if (corrected.type === 'professional') {
        navigate(proUrl(
          corrected.parent?.brand?.slug || '',
          corrected.parent?.store?.slug || '',
          corrected.entity.slug
        ));
      }
    }
    setShowMismatchBanner(false);
  };

  const handleStoreClick = (storeSlug: string) => {
    navigate(storeUrl(brandSlug!, storeSlug));
  };

  const handleProClick = (storeSlug: string, proSlug: string) => {
    navigate(proUrl(brandSlug!, storeSlug, proSlug));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading brand information...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'not_found') {
    return <PublicNotFound path={`/${brandSlug}`} />;
  }
  
  if (error === 'disabled') {
    return <PublicDisabled entityName={brandSlug} entityType="brand" />;
  }
  
  if (error === 'error') {
    return <PublicError onRetry={loadBrandContext} />;
  }

  if (!context) {
    return <PublicNotFound path={`/${brandSlug}`} />;
  }

  const { display } = context;

  return (
    <>
      {/* Mismatch Banner */}
      <MismatchBanner
        isVisible={showMismatchBanner}
        onDismiss={handleMismatchBannerDismiss}
        onCorrect={handleMismatchBannerAction}
        originalStore="Previous Location"
        correctStore="Correct Location"
        professionalName="Professional"
      />

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              {/* Brand Logo */}
              {display.logo && (
                <div className="flex-shrink-0">
                  <img
                    src={display.logo}
                    alt={`${display.name} logo`}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Brand Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-neutral-900">
                  {display.name}
                </h1>
                {display.description && (
                  <p className="mt-2 text-lg text-neutral-600">
                    {display.description}
                  </p>
                )}
                
                {/* Brand Badge */}
                <div className="mt-3">
                  <Badge variant="primary" className="text-sm">
                    Brand
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Stores</p>
                  <p className="text-2xl font-bold text-neutral-900">3</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Rating</p>
                  <p className="text-2xl font-bold text-neutral-900">4.8</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Established</p>
                  <p className="text-2xl font-bold text-neutral-900">2020</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Stores Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Our Stores</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock Store 1 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStoreClick('porto-alegre')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Porto Alegre</h3>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Rua da Independência, 123</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Mon-Fri: 9:00-18:00</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(51) 99999-9999</span>
                  </div>
                </div>
              </Card>

              {/* Mock Store 2 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStoreClick('centro')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Centro</h3>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Av. Borges de Medeiros, 456</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Mon-Fri: 8:00-19:00</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(51) 88888-8888</span>
                  </div>
                </div>
              </Card>

              {/* Mock Store 3 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStoreClick('zona-sul')}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Zona Sul</h3>
                  <ArrowRight className="h-5 w-5 text-neutral-400" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-neutral-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>Rua do Comércio, 789</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Mon-Sat: 9:00-17:00</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-neutral-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>(51) 77777-7777</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Featured Professionals */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Featured Professionals</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Mock Professional 1 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProClick('porto-alegre', 'maria-silva')}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">MS</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900">Maria Silva</h3>
                    <p className="text-sm text-neutral-600">Hair Stylist</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>4.9 (127 reviews)</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Card>

              {/* Mock Professional 2 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProClick('centro', 'joao-pereira')}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">JP</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900">João Pereira</h3>
                    <p className="text-sm text-neutral-600">Barber</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>4.8 (89 reviews)</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Card>

              {/* Mock Professional 3 */}
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleProClick('zona-sul', 'ana-lima')}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">AL</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-neutral-900">Ana Lima</h3>
                    <p className="text-sm text-neutral-600">Makeup Artist</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-neutral-600">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>4.9 (156 reviews)</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-neutral-600">
                  <Phone className="h-5 w-5 mr-3" />
                  <span>(51) 99999-9999</span>
                </div>
                
                <div className="flex items-center text-neutral-600">
                  <Mail className="h-5 w-5 mr-3" />
                  <span>contato@glow.com.br</span>
                </div>
                
                <div className="flex items-center text-neutral-600">
                  <Globe className="h-5 w-5 mr-3" />
                  <span>www.glow.com.br</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-neutral-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>Porto Alegre, RS - Brazil</span>
                </div>
                
                <div className="flex items-center text-neutral-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>Mon-Fri: 9:00-18:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BrandPage;
