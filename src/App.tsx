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
const Demo = lazy(() => import('./pages/Demo'));

// Lazy load public pages
const BrandPage = lazy(() => import('./pages/public/BrandPage'));
const StorePage = lazy(() => import('./pages/public/StorePage'));
const ProPage = lazy(() => import('./pages/public/ProPage'));

// Lazy load new MVP pages
const NewBrandPage = lazy(() => import('./pages/brand/BrandPage'));
const NewStorePage = lazy(() => import('./pages/store/StorePage'));
const NewProPage = lazy(() => import('./pages/pro/ProPage'));

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
                  <Route path='/demo' element={<Demo />} />

                  {/* MVP Public Routes */}
                  <Route path='/mvp/:brandSlug' element={<NewBrandPage />} />
                  <Route
                    path='/mvp/:brandSlug/:storeSlug'
                    element={<NewStorePage />}
                  />
                  <Route
                    path='/mvp/:brandSlug/:storeSlug/:proSlug'
                    element={<NewProPage />}
                  />
                  <Route path='/mvp/u/:proSlug' element={<NewProPage />} />

                  {/* Legacy Public Routes */}
                  <Route path='/:brandSlug' element={<BrandPage />} />
                  <Route
                    path='/:brandSlug/:storeSlug'
                    element={<StorePage />}
                  />
                  <Route
                    path='/:brandSlug/:storeSlug/:proSlug'
                    element={<ProPage />}
                  />
                  <Route path='/u/:proSlug' element={<ProPage />} />
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
