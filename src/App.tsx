import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ToastProvider';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for code splitting
const Landing = lazy(() => import('./pages/Landing'));
const Admin = lazy(() => import('./pages/Admin'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InviteConsume = lazy(() => import('./pages/InviteConsume'));

// Lazy load public pages
const NewBrandPage = lazy(() => import('./pages/brand/BrandPage'));
const NewStorePage = lazy(() => import('./pages/store/StorePage'));
const NewProPage = lazy(() => import('./pages/pro/ProPage'));

// Lazy load booking pages
const BookingRoute = lazy(
  () => import('./features/booking/components/BookingRoute')
);
const SoloBookingRoute = lazy(
  () => import('./features/booking/components/SoloBookingRoute')
);
const BookingSuccess = lazy(() => import('./pages/booking/BookingSuccess'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <Router>
              <Suspense
                fallback={
                  <LoadingSpinner
                    size='lg'
                    text='Loading...'
                    className='min-h-screen'
                  />
                }
              >
                <Routes>
                  <Route path='/' element={<Landing />} />
                  <Route path='/admin' element={<Admin />} />
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/invite/:token' element={<InviteConsume />} />

                  {/* Booking Routes */}
                  <Route
                    path='/book/:brandSlug/:storeSlug/:proSlug'
                    element={<BookingRoute />}
                  />
                  <Route
                    path='/book/u/:proSlug'
                    element={<SoloBookingRoute />}
                  />
                  <Route path='/booking/success' element={<BookingSuccess />} />

                  {/* Public Routes */}
                  <Route path='/:brandSlug' element={<NewBrandPage />} />
                  <Route
                    path='/:brandSlug/:storeSlug'
                    element={<NewStorePage />}
                  />
                  <Route
                    path='/:brandSlug/:storeSlug/:proSlug'
                    element={<NewProPage />}
                  />
                  <Route path='/u/:proSlug' element={<NewProPage />} />
                </Routes>
              </Suspense>
            </Router>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
