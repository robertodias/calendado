/**
 * Demo page to showcase MVP public pages
 * Provides links to test the new booking flow
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Calendar, Users, Store } from 'lucide-react';

const Demo: React.FC = () => {
  const demoSites = [
    {
      name: 'Glow Beauty Studio',
      description: 'Premium beauty services with multiple locations',
      brandSlug: 'glow',
      stores: [
        { slug: 'porto-alegre', name: 'Porto Alegre' },
        { slug: 'centro', name: 'Centro' },
        { slug: 'zona-sul', name: 'Zona Sul' },
      ],
      professionals: [
        { slug: 'maria-silva', name: 'Maria Silva' },
        { slug: 'joao-pereira', name: 'João Pereira' },
        { slug: 'ana-lima', name: 'Ana Lima' },
      ],
    },
    {
      name: 'Chic Hair Salon',
      description: 'Modern hair styling and coloring',
      brandSlug: 'chic',
      stores: [],
      professionals: [],
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Calendado MVP Demo
          </h1>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Experience the new booking flow with our MVP public pages. Test the
            complete user journey from brand discovery to booking confirmation.
          </p>
        </div>

        {/* Demo Sites */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
          {demoSites.map(site => (
            <Card
              key={site.brandSlug}
              className='hover:shadow-lg transition-shadow'
            >
              <CardContent className='p-8'>
                <div className='flex items-start space-x-4 mb-6'>
                  <div className='w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center'>
                    <Store className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {site.name}
                    </h3>
                    <p className='text-gray-600'>{site.description}</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  {/* Brand Page Link */}
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Brand Page
                    </h4>
                    <Link to={`/mvp/${site.brandSlug}`}>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <Store className='w-4 h-4 mr-2' />
                        View {site.name}
                        <ArrowRight className='w-4 h-4 ml-auto' />
                      </Button>
                    </Link>
                  </div>

                  {/* Store Pages */}
                  {site.stores.length > 0 && (
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Store Locations
                      </h4>
                      <div className='space-y-2'>
                        {site.stores.map(store => (
                          <Link
                            key={store.slug}
                            to={`/mvp/${site.brandSlug}/${store.slug}`}
                          >
                            <Button
                              variant='ghost'
                              className='w-full justify-start text-left'
                            >
                              <Calendar className='w-4 h-4 mr-2' />
                              {store.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Pages */}
                  {site.professionals.length > 0 && (
                    <div>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        Direct Professional Links
                      </h4>
                      <div className='space-y-2'>
                        {site.professionals.slice(0, 2).map(pro => (
                          <Link key={pro.slug} to={`/mvp/u/${pro.slug}`}>
                            <Button
                              variant='ghost'
                              className='w-full justify-start text-left'
                            >
                              <Users className='w-4 h-4 mr-2' />
                              {pro.name}
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <Card className='mb-12'>
          <CardContent className='p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              MVP Features
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Store className='w-6 h-6 text-blue-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Brand Pages
                </h3>
                <p className='text-sm text-gray-600'>
                  Showcase brand identity with custom colors, featured services,
                  and store locations.
                </p>
              </div>
              <div className='text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Calendar className='w-6 h-6 text-green-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Store Pages
                </h3>
                <p className='text-sm text-gray-600'>
                  Browse professionals and services with search and filtering
                  capabilities.
                </p>
              </div>
              <div className='text-center'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Users className='w-6 h-6 text-purple-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Professional Pages
                </h3>
                <p className='text-sm text-gray-600'>
                  Book appointments with service selection and calendar
                  integration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card>
          <CardContent className='p-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>
              Testing Instructions
            </h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-primary-600 text-sm font-medium'>
                    1
                  </span>
                </div>
                <div>
                  <h3 className='font-medium text-gray-900'>Brand Discovery</h3>
                  <p className='text-gray-600'>
                    Click on any brand to see the brand page with featured
                    services and store locations.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-primary-600 text-sm font-medium'>
                    2
                  </span>
                </div>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Store Exploration
                  </h3>
                  <p className='text-gray-600'>
                    Visit store pages to see professionals and services with
                    search and filter functionality.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-primary-600 text-sm font-medium'>
                    3
                  </span>
                </div>
                <div>
                  <h3 className='font-medium text-gray-900'>Booking Flow</h3>
                  <p className='text-gray-600'>
                    Select a professional to access the booking interface with
                    service selection and calendar.
                  </p>
                </div>
              </div>
              <div className='flex items-start space-x-3'>
                <div className='w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <span className='text-primary-600 text-sm font-medium'>
                    4
                  </span>
                </div>
                <div>
                  <h3 className='font-medium text-gray-900'>URL Parameters</h3>
                  <p className='text-gray-600'>
                    Test preselection by adding{' '}
                    <code className='bg-gray-100 px-1 rounded'>
                      ?service=haircut&date=2024-01-15
                    </code>{' '}
                    to professional URLs.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Demo;
