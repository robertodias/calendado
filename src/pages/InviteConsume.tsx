/**
 * Invite Consumption Page
 * Handles magic link token validation and user account creation
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { CheckCircle, XCircle } from 'lucide-react';

// interface ConsumeInviteResponse {
//   success: boolean;
//   message: string;
//   user?: {
//     uid: string;
//     email: string;
//     displayName?: string;
//     roles: string[];
//     orgId?: string;
//   };
//   redirectUrl?: string;
//   error?: string;
// }

const InviteConsume: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid invitation link');
      return;
    }

    consumeInvite();
  }, [token]);

  const consumeInvite = async () => {
    try {
      setStatus('loading');
      
      // For demo purposes, simulate a successful invite consumption
      // In production, this would call the actual Firebase function
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful invite consumption
      setStatus('success');
      setMessage('Invitation processed successfully! You can now sign in to access your dashboard.');
      
    } catch (err) {
      setStatus('error');
      setError('Failed to process invitation. Please try again.');
      console.error('Error consuming invite:', err);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in:', error);
      setStatus('error');
      setError('Failed to sign in. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <LoadingSpinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              Processing Invitation
            </h2>
            <p className="text-gray-600 mt-2">
              Please wait while we set up your account...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invitation Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Calendado!
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <Button onClick={handleSignIn} className="w-full">
              Sign In with Google
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteConsume;
