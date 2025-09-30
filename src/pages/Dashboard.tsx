/**
 * User Dashboard
 * Main dashboard for logged-in users to manage their professional profile and schedule
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Calendar,
  Clock,
  Users,
  Link,
  Settings,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import DashboardRouteGuard from '../components/DashboardRouteGuard';

interface ProfessionalProfile {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  bio: string;
  specialties: string[];
  services: string[];
  availability: Record<
    string,
    { start: string; end: string; available: boolean }
  >;
  slug: string;
}

interface Booking {
  id: string;
  customerName: string;
  customerEmail: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const DashboardContent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'schedule' | 'profile' | 'links'>(
    'schedule'
  );
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading user's professional profile
    setTimeout(() => {
      setProfile({
        id: 'prof-1',
        firstName: user?.displayName?.split(' ')[0] || 'John',
        lastName: user?.displayName?.split(' ')[1] || 'Doe',
        title: 'Hair Stylist',
        bio: 'Professional hair stylist with 5+ years of experience',
        specialties: ['Hair Cutting', 'Hair Coloring', 'Hair Styling'],
        services: ['Haircut', 'Hair Color', 'Blowout', 'Updo'],
        availability: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '10:00', end: '16:00', available: true },
          sunday: { start: '10:00', end: '14:00', available: false },
        },
        slug: 'john-doe-hair',
      });

      // Mock bookings
      setBookings([
        {
          id: 'booking-1',
          customerName: 'Sarah Johnson',
          customerEmail: 'sarah@example.com',
          service: 'Haircut',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed',
        },
        {
          id: 'booking-2',
          customerName: 'Mike Wilson',
          customerEmail: 'mike@example.com',
          service: 'Hair Color',
          date: '2024-01-16',
          time: '14:00',
          status: 'pending',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, [user]);

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast({
      title: 'Link copied to clipboard!',
      description: 'The booking link has been copied to your clipboard.',
    });
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const generateBookingLink = () => {
    if (!profile) return '';
    return `${window.location.origin}/u/${profile.slug}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Welcome back, {profile?.firstName}!
              </h1>
              <p className='text-gray-600'>Manage your schedule and bookings</p>
            </div>
            <div className='flex items-center space-x-4'>
              <Button variant='outline' size='sm'>
                <Settings className='w-4 h-4 mr-2' />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Navigation Tabs */}
        <div className='border-b border-gray-200 mb-8'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'schedule', name: 'Schedule', icon: Calendar },
              { id: 'profile', name: 'Profile', icon: Users },
              { id: 'links', name: 'Booking Links', icon: Link },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className='w-4 h-4 mr-2' />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              {/* Upcoming Bookings */}
              <div className='lg:col-span-2'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Calendar className='w-5 h-5 mr-2' />
                      Upcoming Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {bookings.length === 0 ? (
                        <p className='text-gray-500 text-center py-8'>
                          No upcoming bookings
                        </p>
                      ) : (
                        bookings.map(booking => (
                          <div
                            key={booking.id}
                            className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                          >
                            <div className='flex-1'>
                              <div className='flex items-center space-x-3'>
                                <div>
                                  <h3 className='font-medium text-gray-900'>
                                    {booking.customerName}
                                  </h3>
                                  <p className='text-sm text-gray-600'>
                                    {booking.service}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    booking.status === 'confirmed'
                                      ? 'bg-green-100 text-green-800'
                                      : booking.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {booking.status}
                                </span>
                              </div>
                              <div className='mt-2 flex items-center text-sm text-gray-500'>
                                <Clock className='w-4 h-4 mr-1' />
                                {formatDate(booking.date)} at{' '}
                                {formatTime(booking.time)}
                              </div>
                            </div>
                            <div className='flex space-x-2'>
                              <Button variant='outline' size='sm'>
                                View
                              </Button>
                              <Button variant='outline' size='sm'>
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle>This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Total Bookings</span>
                        <span className='font-semibold'>{bookings.length}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Confirmed</span>
                        <span className='font-semibold text-green-600'>
                          {
                            bookings.filter(b => b.status === 'confirmed')
                              .length
                          }
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Pending</span>
                        <span className='font-semibold text-yellow-600'>
                          {bookings.filter(b => b.status === 'pending').length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      {profile &&
                        Object.entries(profile.availability).map(
                          ([day, schedule]) => (
                            <div
                              key={day}
                              className='flex justify-between items-center'
                            >
                              <span className='capitalize text-sm'>{day}</span>
                              <span
                                className={`text-sm ${schedule.available ? 'text-green-600' : 'text-red-600'}`}
                              >
                                {schedule.available
                                  ? `${schedule.start} - ${schedule.end}`
                                  : 'Unavailable'}
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className='max-w-2xl'>
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      First Name
                    </label>
                    <Input value={profile.firstName} readOnly />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Last Name
                    </label>
                    <Input value={profile.lastName} readOnly />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Title
                  </label>
                  <Input value={profile.title} readOnly />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Bio
                  </label>
                  <textarea
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
                    rows={3}
                    value={profile.bio}
                    readOnly
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Specialties
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {profile.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800'
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Services
                  </label>
                  <div className='flex flex-wrap gap-2'>
                    {profile.services.map((service, index) => (
                      <span
                        key={index}
                        className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='pt-4'>
                  <Button className='w-full'>Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className='max-w-2xl'>
            <Card>
              <CardHeader>
                <CardTitle>Booking Links</CardTitle>
                <p className='text-sm text-gray-600'>
                  Share these links with your clients to allow them to book
                  appointments
                </p>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Your Booking Link
                  </label>
                  <div className='flex space-x-2'>
                    <Input
                      value={generateBookingLink()}
                      readOnly
                      className='flex-1'
                    />
                    <Button
                      variant='outline'
                      onClick={() => handleCopyLink(generateBookingLink())}
                      className='flex items-center'
                    >
                      {copiedLink === generateBookingLink() ? (
                        <Check className='w-4 h-4' />
                      ) : (
                        <Copy className='w-4 h-4' />
                      )}
                    </Button>
                  </div>
                  <p className='text-xs text-gray-500 mt-1'>
                    This link allows anyone to view your profile and book
                    appointments
                  </p>
                </div>

                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <h3 className='font-medium text-blue-900 mb-2'>
                    How to use your booking link:
                  </h3>
                  <ol className='text-sm text-blue-800 space-y-1 list-decimal list-inside'>
                    <li>Copy the link above</li>
                    <li>
                      Share it with your clients via email, text, or social
                      media
                    </li>
                    <li>
                      Clients can click the link to view your services and book
                      appointments
                    </li>
                    <li>You'll receive notifications for new bookings</li>
                  </ol>
                </div>

                <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                  <h3 className='font-medium text-green-900 mb-2'>
                    Test your booking flow:
                  </h3>
                  <p className='text-sm text-green-800 mb-3'>
                    Click the button below to test how your booking page looks
                    to clients:
                  </p>
                  <Button
                    variant='outline'
                    onClick={() => window.open(generateBookingLink(), '_blank')}
                    className='w-full'
                  >
                    Preview Booking Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <DashboardRouteGuard>
      <DashboardContent />
    </DashboardRouteGuard>
  );
};

export default Dashboard;
