/**
 * Test routes page
 * Quick way to test all the routes and functionality
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ArrowRight, Calendar, Users, Store, BookOpen } from 'lucide-react';

export const TestRoutes: React.FC = () => {
  const testRoutes = [
    {
      name: 'Landing Page',
      path: '/',
      description: 'Main landing page with waitlist',
      icon: <Store className="w-5 h-5" />,
    },
    {
      name: 'Demo Page',
      path: '/demo',
      description: 'MVP demo showcase',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: 'Admin Page',
      path: '/admin',
      description: 'Admin dashboard',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'User Dashboard',
      path: '/dashboard',
      description: 'User dashboard for managing schedule and bookings',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Test Flow',
      path: '/test-flow',
      description: 'Complete test case flow demonstration',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: 'Glow Brand Page',
      path: '/glow',
      description: 'Glow Beauty Studio brand page',
      icon: <Store className="w-5 h-5" />,
    },
    {
      name: 'Glow Store Page',
      path: '/glow/porto-alegre',
      description: 'Glow Porto Alegre store page',
      icon: <Store className="w-5 h-5" />,
    },
    {
      name: 'Maria Silva Profile',
      path: '/glow/porto-alegre/maria-silva',
      description: 'Maria Silva professional page',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'Solo Professional',
      path: '/u/maria-silva',
      description: 'Maria Silva solo professional page',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'Booking Wizard (Brand/Store/Pro)',
      path: '/book/glow/porto-alegre/maria-silva',
      description: 'Full booking flow with context',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Booking Wizard (Solo Pro)',
      path: '/book/u/maria-silva',
      description: 'Solo professional booking flow',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Booking with Preselection',
      path: '/book/glow/porto-alegre/maria-silva?service=haircut&date=2024-01-15&time=10:00',
      description: 'Booking with preselected service, date, and time',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Booking Success',
      path: '/booking/success',
      description: 'Booking confirmation success page',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Route Testing Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Test all routes and functionality in the Calendado application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testRoutes.map((route, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="flex-shrink-0 text-primary-600">
                    {route.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {route.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {route.description}
                    </p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-800 break-all">
                      {route.path}
                    </code>
                  </div>
                </div>

                <Link to={route.path}>
                  <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <span>Test Route</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Testing Instructions
              </h2>
              <div className="text-left max-w-2xl mx-auto space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Test Public Pages</h3>
                    <p className="text-gray-600">
                      Start with the brand page, then navigate to store and professional pages.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Test Booking Flow</h3>
                    <p className="text-gray-600">
                      Select a service and time slot, then click "Book with [Professional]" to start the booking wizard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Test Preselection</h3>
                    <p className="text-gray-600">
                      Use the "Booking with Preselection" route to test URL parameter handling.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary-600 text-sm font-medium">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Complete Booking</h3>
                    <p className="text-gray-600">
                      Fill out the customer form and confirm the booking to see the success page.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestRoutes;
