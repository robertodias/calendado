import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<Dashboard />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
