import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { steamAPI } from '../lib/api';
import { useAuth } from '../lib/auth';

export const SteamCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Steam authentication...');
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const processSteamCallback = async () => {
      try {
        // Check for direct success parameters (simplified callback)
        const userId = searchParams.get('user_id');
        const steamId = searchParams.get('steam_id');
        const isNewUser = searchParams.get('new_user') === 'true';
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Steam authentication failed: ${error}`);
          return;
        }

        if (userId && steamId) {
          // Direct success callback
          setStatus('success');
          setUserInfo({
            user_id: userId,
            steam_id: steamId,
            is_new_user: isNewUser
          });
          setMessage(isNewUser ? 'Welcome to MindBreakers!' : 'Welcome back!');
          
          // Redirect after showing success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          return;
        }

        // Handle OpenID response
        const openidParams: any = {};
        for (const [key, value] of searchParams.entries()) {
          if (key.startsWith('openid.')) {
            openidParams[key] = value;
          }
        }

        if (openidParams['openid.mode'] === 'id_res') {
          // Validate with backend
          const returnUrl = `${window.location.origin}/auth/steam-callback`;
          const result = await steamAPI.validateOpenID(openidParams, returnUrl);
          
          if (result.success) {
            setStatus('success');
            setUserInfo(result);
            setMessage(result.is_new_user ? 'Welcome to MindBreakers!' : 'Welcome back!');
            
            // Redirect after showing success
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('error');
            setMessage('Steam authentication validation failed');
          }
        } else if (openidParams['openid.mode'] === 'cancel') {
          setStatus('error');
          setMessage('Steam authentication was cancelled');
        } else {
          setStatus('error');
          setMessage('Invalid Steam authentication response');
        }
      } catch (error) {
        console.error('Steam callback error:', error);
        setStatus('error');
        setMessage('An error occurred during Steam authentication');
      }
    };

    processSteamCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-12 w-12 animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400" />;
      case 'error':
        return <XCircle className="h-12 w-12 text-red-400" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-yellow-400" />;
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
      default:
        return 'text-yellow-400';
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

          {userInfo && status === 'success' && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2 text-green-400">Account Information</h3>
              <div className="space-y-1 text-sm">
                {userInfo.steam_name && (
                  <div><span className="text-gray-400">Steam Name:</span> {userInfo.steam_name}</div>
                )}
                <div><span className="text-gray-400">Steam ID:</span> {userInfo.steam_id}</div>
                {userInfo.is_new_user && (
                  <div className="text-blue-400 font-medium">New account created!</div>
                )}
              </div>
              {userInfo.avatar_url && (
                <img 
                  src={userInfo.avatar_url} 
                  alt="Steam Avatar" 
                  className="w-16 h-16 rounded-full mt-3"
                />
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-gray-400 text-sm">
              Redirecting to dashboard in a moment...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
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
