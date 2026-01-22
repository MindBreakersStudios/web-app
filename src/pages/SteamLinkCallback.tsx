import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, Link as LinkIcon } from 'lucide-react';
import { steamAPI } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useTranslation } from '../hooks/useTranslation';

export const SteamLinkCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useTranslation();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState(t('callbacks.steamLink.processing'));
  const [steamInfo, setSteamInfo] = useState<{
    steam_id: string;
    profile_name?: string;
    avatar_url?: string;
    profile_url?: string;
  } | null>(null);

  useEffect(() => {
    const processSteamLinking = async () => {
      if (!user) {
        setStatus('error');
        setMessage('You must be logged in to link your Steam account');
        return;
      }

      try {
        // With the new secure flow, the backend processes everything automatically
        // and redirects here with success/error parameters (no OpenID params)
        setMessage('Verifying Steam account linking...');
        
        // Check URL parameters for success/error status from backend
        const success = searchParams.get('success');
        const callbackError = searchParams.get('error');
        const steamId = searchParams.get('steam_id');
        const message = searchParams.get('message');
        
        console.log('Callback URL parameters:', {
          success,
          callbackError,
          steamId,
          message,
          allParams: Object.fromEntries(searchParams.entries())
        });
        
        if (success === 'true') {
          // Backend successfully linked the account
          setStatus('success');
          setMessage(message ? decodeURIComponent(message) : t('callbacks.steamLink.linkedSuccessfully'));
          
          // Use data from URL parameters if available
          if (steamId) {
            setSteamInfo({
              steam_id: steamId,
              profile_name: 'Steam User', // Will be updated by API call
              avatar_url: undefined,
              profile_url: `https://steamcommunity.com/profiles/${steamId}`
            });
          }
          
          // Also try to get the updated profile info from API
          try {
            const steamStatus = await steamAPI.getLinkingStatus();
            if (steamStatus.is_linked) {
              setSteamInfo({
                steam_id: steamStatus.steam_id,
                profile_name: steamStatus.steam_name,
                avatar_url: steamStatus.avatar_url,
                profile_url: `https://steamcommunity.com/profiles/${steamStatus.steam_id}`
              });
            }
          } catch (infoError) {
            console.warn('Failed to get Steam info after linking:', infoError);
            // Don't fail the whole process if API call fails
          }
          
          // Redirect after showing success
          setTimeout(() => {
            navigate('/profile');
          }, 2000);
        } else if (callbackError) {
          // Backend reported an error
          const errorMessage = decodeURIComponent(callbackError);
          
          // Check if it's an "already linked" error
          if (errorMessage.includes('already linked')) {
            setStatus('success');
            setMessage(t('callbacks.steamLink.alreadyLinked'));
            
            // Extract Steam ID from error message if possible
            const steamIdMatch = errorMessage.match(/(\d{17})/);
            if (steamIdMatch) {
              const extractedSteamId = steamIdMatch[1];
              setSteamInfo({
                steam_id: extractedSteamId,
                profile_name: 'Steam User',
                profile_url: `https://steamcommunity.com/profiles/${extractedSteamId}`
              });
            }
            
            // Redirect to profile after showing message
            setTimeout(() => {
              navigate('/profile');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(t('callbacks.steamLink.linkingFailed').replace('{error}', errorMessage));
          }
        } else {
          // No clear success/error, check linking status
          try {
            const steamStatus = await steamAPI.getLinkingStatus();
            
            if (steamStatus.is_linked) {
              setStatus('success');
              setMessage(t('callbacks.steamLink.linkedSuccessfully'));
              setSteamInfo({
                steam_id: steamStatus.steam_id,
                profile_name: steamStatus.steam_name,
                avatar_url: steamStatus.avatar_url,
                profile_url: `https://steamcommunity.com/profiles/${steamStatus.steam_id}`
              });
              
              setTimeout(() => {
                navigate('/profile');
              }, 2000);
            } else {
              setStatus('error');
              setMessage(t('callbacks.steamLink.notCompleted'));
            }
          } catch (statusError) {
            setStatus('error');
            setMessage(t('callbacks.steamLink.verifyFailed'));
          }
        }
      } catch (error) {
        console.error('Steam linking error:', error);
        setStatus('error');
        setMessage(t('callbacks.steamLink.errorOccurred'));
      }
    };

    processSteamLinking();
  }, [searchParams, navigate, user]);

  const handleRetry = () => {
    navigate('/profile');
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
        return <LinkIcon className="h-12 w-12 text-yellow-400" />;
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
            {status === 'loading' && t('callbacks.steamLink.loading')}
            {status === 'success' && t('callbacks.steamLink.success')}
            {status === 'error' && t('callbacks.steamLink.error')}
          </h1>
          
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {steamInfo && status === 'success' && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-2 text-green-400">{t('callbacks.steamLink.steamAccount')}</h3>
              <div className="space-y-1 text-sm">
                {steamInfo.profile_name && (
                  <div><span className="text-gray-400">{t('callbacks.steamLink.steamName')}</span> {steamInfo.profile_name}</div>
                )}
                <div><span className="text-gray-400">{t('callbacks.steamLink.steamId')}</span> {steamInfo.steam_id}</div>
                {steamInfo.profile_url && (
                  <div>
                    <span className="text-gray-400">{t('callbacks.steamLink.profile')}</span>{' '}
                    <a 
                      href={steamInfo.profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {t('callbacks.steamLink.viewOnSteam')}
                    </a>
                  </div>
                )}
              </div>
              {steamInfo.avatar_url && (
                <img 
                  src={steamInfo.avatar_url} 
                  alt={t('callbacks.steamLink.steamAvatar')} 
                  className="w-16 h-16 rounded-full mt-3"
                />
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-gray-400 text-sm">
              {t('callbacks.steamLink.redirecting')}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.steamLink.backToProfile')}
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {t('callbacks.steamLink.tryAgain')}
              </button>
            </div>
          )}

          {!user && status === 'error' && (
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition mt-3"
            >
              {t('callbacks.steamLink.goToLogin')}
            </button>
          )}
        </div>

        {status === 'loading' && (
          <div className="mt-4 text-gray-500 text-sm">
            {t('callbacks.steamLink.mayTakeSeconds')}
          </div>
        )}
      </div>
    </div>
  );
};
