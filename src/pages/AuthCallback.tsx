import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const t = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('callbacks.auth.processing'));

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!supabase || !supabase.auth) {
          setStatus('error');
          setMessage(t('callbacks.auth.notConfigured'));
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage(t('callbacks.auth.failed').replace('{error}', error.message));
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage(t('callbacks.auth.successful'));
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(t('callbacks.auth.noSession'));
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        setStatus('error');
        setMessage(t('callbacks.auth.errorOccurred'));
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
            {status === 'loading' && t('callbacks.auth.loading')}
            {status === 'success' && t('callbacks.auth.success')}
            {status === 'error' && t('callbacks.auth.error')}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <div className="text-gray-400 text-sm">
              {t('callbacks.auth.redirecting')}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.auth.returnHome')}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.auth.tryAgain')}
              </button>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="mt-4 text-gray-500 text-sm">
            {t('callbacks.auth.mayTakeSeconds')}
          </div>
        )}
      </div>
    </div>
  );
};
