import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
