import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase || !supabase.auth) {
          setStatus('error');
          setMessage('Supabase is not configured. Please configure your environment variables.');
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Authentication failed: ' + error.message);
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage('No authentication session found');
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-12 w-12 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
            {status === 'loading' && 'Processing Authentication'}
            {status === 'success' && 'Authentication Successful!'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="text-gray-400 text-sm">
              Redirecting to dashboard...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Return to Home
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="mt-4 text-gray-500 text-sm">
            This may take a few seconds...
          </div>
        )}
      </div>
    </div>
  );
};
