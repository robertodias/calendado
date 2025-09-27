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
