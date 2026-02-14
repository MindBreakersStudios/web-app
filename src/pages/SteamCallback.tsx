import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { steamAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';

export const SteamCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useTranslation();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('callbacks.steam.processing'));
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const processSteamCallback = async () => {
      try {
        // Check for error first
        const error = searchParams.get('error') || searchParams.get('steam_error');

        if (error) {
          setStatus('error');
          setMessage(t('callbacks.steam.failed').replace('{error}', error));
          return;
        }

        // Check for success from edge function
        const steamSuccess = searchParams.get('steam_success') === 'true';
        const steamId = searchParams.get('steam_id');
        const steamName = searchParams.get('steam_name');
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const email = searchParams.get('email');
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (steamSuccess && steamId) {
          // Edge function validated Steam successfully
          console.log('[SteamCallback] Steam validation successful:', {
            steamId,
            steamName,
            hasTokens: !!accessToken,
            hasOTP: !!tokenHash
          });

          // Try to establish session with different methods
          if (accessToken && refreshToken) {
            // Method 1: Direct session tokens
            console.log('[SteamCallback] Setting session with tokens...');

            try {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (error) {
                console.error('[SteamCallback] Error setting session:', error);
                setStatus('error');
                setMessage('Failed to establish session. Please try again.');
                return;
              }

              console.log('[SteamCallback] Session established:', data.session?.user?.id);
            } catch (sessionError) {
              console.error('[SteamCallback] Session error:', sessionError);
              setStatus('error');
              setMessage('Failed to establish session. Please try again.');
              return;
            }
          } else if (email && tokenHash && type) {
            // Method 2: Verify OTP token
            console.log('[SteamCallback] Verifying OTP token...');

            try {
              const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: tokenHash,
                type: type as any
              });

              if (error) {
                console.error('[SteamCallback] Error verifying OTP:', error);
                setStatus('error');
                setMessage('Failed to verify login token. Please try again.');
                return;
              }

              console.log('[SteamCallback] OTP verified, session established:', data.session?.user?.id);
            } catch (otpError) {
              console.error('[SteamCallback] OTP error:', otpError);
              setStatus('error');
              setMessage('Failed to verify login token. Please try again.');
              return;
            }
          } else {
            console.warn('[SteamCallback] No authentication method available, proceeding without session');
          }

          // Show success
          setStatus('success');
          setUserInfo({
            steam_id: steamId,
            steam_name: steamName || `Steam User ${steamId.slice(-4)}`,
            is_new_user: true // For now, assume new user
          });

          const welcomeMessage = steamName
            ? `Welcome, ${steamName}! Your Steam account has been verified.`
            : 'Steam authentication successful!';

          setMessage(welcomeMessage);

          // Redirect after showing success
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
          return;
        }

        // Legacy: Check for direct success parameters (old callback format)
        const userId = searchParams.get('user_id');

        if (userId && steamId) {
          // Direct success callback (legacy)
          const isNewUser = searchParams.get('new_user') === 'true';
          setStatus('success');
          setUserInfo({
            user_id: userId,
            steam_id: steamId,
            is_new_user: isNewUser
          });
          setMessage(isNewUser ? t('callbacks.steam.welcomeNew') : t('callbacks.steam.welcomeBack'));

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
            setMessage(result.is_new_user ? t('callbacks.steam.welcomeNew') : t('callbacks.steam.welcomeBack'));
            
            // Redirect after showing success
            setTimeout(() => {
              navigate('/dashboard');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(t('callbacks.steam.validationFailed'));
          }
        } else if (openidParams['openid.mode'] === 'cancel') {
          setStatus('error');
          setMessage(t('callbacks.steam.cancelled'));
        } else {
          setStatus('error');
          setMessage(t('callbacks.steam.invalidResponse'));
        }
      } catch (error) {
        console.error('Steam callback error:', error);
        setStatus('error');
        setMessage(t('callbacks.steam.errorOccurred'));
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
            {status === 'loading' && t('callbacks.steam.loading')}
            {status === 'success' && t('callbacks.steam.success')}
            {status === 'error' && t('callbacks.steam.error')}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {userInfo && status === 'success' && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2 text-green-400">{t('callbacks.steam.accountInfo')}</h3>
              <div className="space-y-1 text-sm">
                {userInfo.steam_name && (
                  <div><span className="text-gray-400">{t('callbacks.steam.steamName')}</span> {userInfo.steam_name}</div>
                )}
                <div><span className="text-gray-400">{t('callbacks.steam.steamId')}</span> {userInfo.steam_id}</div>
                {userInfo.is_new_user && (
                  <div className="text-blue-400 font-medium">{t('callbacks.steam.newAccountCreated')}</div>
                )}
              </div>
              {userInfo.avatar_url && (
                <img 
                  src={userInfo.avatar_url} 
                  alt={t('callbacks.steam.steamAvatar')} 
                  className="w-16 h-16 rounded-full mt-3"
                />
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-gray-400 text-sm">
              {t('callbacks.steam.redirecting')}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.steam.returnHome')}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.steam.tryAgain')}
              </button>
            </div>
          )}
        </div>

        {status === 'loading' && (
          <div className="mt-4 text-gray-500 text-sm">
            {t('callbacks.steam.mayTakeSeconds')}
          </div>
        )}
      </div>
    </div>
  );
};
