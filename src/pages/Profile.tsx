import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { User, Mail, Calendar, Shield, Link as LinkIcon, Unlink, ExternalLink, Edit2, Save, X, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { steamAPI, profileAPI } from '../lib/api';

interface LinkedAccount {
  type: 'discord' | 'steam';
  id: string;
  name: string;
  avatar?: string;
  profileUrl?: string;
  linkedAt: string;
  cached?: boolean;
}

interface EnhancedProfile {
  user_id: string;
  discord?: {
    id: string;
    username: string;
    global_name?: string;
    avatar_url?: string;
    cached: boolean;
  } | null;
  steam?: {
    id: string;
    username: string;
    avatar_url?: string;
    profile_url?: string;
    cached: boolean;
  } | null;
}

export const Profile = () => {
  const { user, apiUserData, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [enhancedProfile, setEnhancedProfile] = useState<EnhancedProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const loadEnhancedProfile = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      // Get enhanced profile data
      const profileData = await profileAPI.getProfile(forceRefresh);
      setEnhancedProfile(profileData);
      
      // Convert to linked accounts format for UI compatibility
      const accounts: LinkedAccount[] = [];
      
      if (profileData.discord) {
        accounts.push({
          type: 'discord',
          id: profileData.discord.id,
          name: profileData.discord.global_name || profileData.discord.username,
          avatar: profileData.discord.avatar_url,
          linkedAt: user.created_at,
          cached: profileData.discord.cached
        });
      }
      
      if (profileData.steam) {
        accounts.push({
          type: 'steam',
          id: profileData.steam.id,
          name: profileData.steam.username,
          avatar: profileData.steam.avatar_url,
          profileUrl: profileData.steam.profile_url,
          linkedAt: '2024-01-15', // This could come from API later
          cached: profileData.steam.cached
        });
      }
      
      setLinkedAccounts(accounts);
    } catch (error) {
      console.error('Failed to load enhanced profile:', error);
      
      // Fallback to old logic
      const accounts: LinkedAccount[] = [];
      
      // Fallback to checking user data from auth context
      if (apiUserData?.steam_id) {
        accounts.push({
          type: 'steam',
          id: apiUserData.steam_id,
          name: apiUserData.steam_name || 'Steam User',
          avatar: apiUserData.steam_avatar,
          profileUrl: `https://steamcommunity.com/profiles/${apiUserData.steam_id}`,
          linkedAt: '2024-01-15'
        });
      }

      // Check if Discord is linked
      if (user?.app_metadata?.provider === 'discord') {
        accounts.push({
          type: 'discord',
          id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'Discord User',
          avatar: user.user_metadata?.avatar_url,
          linkedAt: user.created_at
        });
      }

      setLinkedAccounts(accounts);
    }
  }, [user, apiUserData]);

  // Wrapper for backward compatibility
  const loadLinkedAccounts = useCallback(() => {
    return loadEnhancedProfile(false);
  }, [loadEnhancedProfile]);

  useEffect(() => {
    // Load linked accounts (this would come from your API)
    loadLinkedAccounts();
    
    // Set initial display name
    if (user?.user_metadata?.display_name) {
      setDisplayName(user.user_metadata.display_name);
    } else if (user?.email) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user, loadLinkedAccounts]);

  const handleLinkSteam = async () => {
    // Check if user is logged in first
    if (!user) {
      setError('You must be logged in to link your Steam account');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const returnUrl = `${window.location.origin}/auth/steam-link-callback`;
      console.log('Initiating Steam linking with return URL:', returnUrl);
      
      const result = await steamAPI.initSecureLink(returnUrl);
      console.log('Steam linking result:', result);
      
      if (!result || !result.auth_url) {
        throw new Error('Invalid response from Steam linking API - missing auth_url');
      }
      
      // The backend now handles the verification token automatically
      // Steam will redirect to backend, which will then redirect to our frontend callback
      console.log('Redirecting to Steam auth URL:', result.auth_url);
      
      // Redirect to Steam for linking
      window.location.href = result.auth_url;
    } catch (err: unknown) {
      console.error('Steam linking error:', err);
      
      // Check if it's an authentication error or already linked
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('authentication session') || errorMessage.includes('getSession timeout')) {
        setError('Please log in to link your Steam account');
      } else if (errorMessage.includes('already linked')) {
        setSuccess('Steam account is already linked to your account!');
        // Refresh profile data to show the linked account
        await loadEnhancedProfile(true);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to initiate Steam linking');
      }
      setLoading(false);
    }
  };

  const handleRefreshPlatform = async (platform: 'steam' | 'discord') => {
    if (!user) {
      setError('You must be logged in to refresh platform data');
      return;
    }

    setRefreshing(platform);
    setError('');
    
    try {
      await profileAPI.refreshPlatform(platform);
      // Reload the profile data after refresh
      await loadEnhancedProfile(true);
      setSuccess(`${platform} data refreshed successfully`);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      console.error(`${platform} refresh error:`, err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to refresh ${platform} data: ${errorMessage}`);
    } finally {
      setRefreshing(null);
    }
  };

  const handleForceRefresh = async () => {
    if (!user) {
      setError('You must be logged in to refresh profile data');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await loadEnhancedProfile(true);
      setSuccess('Profile data refreshed successfully');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      console.error('Force refresh error:', err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to refresh profile data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async (accountType: string) => {
    if (!confirm(`Are you sure you want to unlink your ${accountType} account?`)) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (accountType === 'steam') {
        // Use new secure unlink endpoint
        const result = await steamAPI.unlinkSteam();
        
        if (result.success) {
          setSuccess('Steam account unlinked successfully');
          // Reload enhanced profile to refresh UI
          await loadEnhancedProfile(true);
        } else {
          throw new Error(result.message || 'Failed to unlink Steam account');
        }
      } else {
        // Handle other account types (Discord, etc.)
        console.log(`Unlinking ${accountType} account...`);
        
        // Remove from local state for now
        setLinkedAccounts(prev => prev.filter(acc => acc.type !== accountType));
        setSuccess(`${accountType} account unlinked successfully`);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`Failed to unlink ${accountType} account: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDisplayName = async () => {
    setLoading(true);
    setError('');
    
    try {
      // This would call your API to update display name
      console.log('Updating display name to:', displayName);
      setSuccess('Display name updated successfully');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update display name');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'discord':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        );
      case 'steam':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.5 20.535 6.344 24 11.979 24c6.624 0 11.999-5.375 11.999-12S18.603.001 11.979.001zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.405 1.472 1.009 2.428-.397.955-1.461 1.403-2.417 1.003-.957-.4-1.406-1.472-1.009-2.428.4-.957 1.471-1.406 2.428-1.009z"/>
          </svg>
        );
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getProviderColor = (type: string) => {
    switch (type) {
      case 'discord':
        return 'text-indigo-400';
      case 'steam':
        return 'text-gray-400';
      default:
        return 'text-blue-400';
    }
  };

  const isAccountLinked = (type: string) => {
    return linkedAccounts.some(acc => acc.type === type);
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <DashboardLayout currentPage="profile">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <DashboardLayout currentPage="profile">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <LogIn className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-4">Login Required</h1>
              <p className="text-gray-400 mb-6">
                You need to be logged in to view and manage your profile.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="profile">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {displayName || user?.email || 'User Profile'}
              </h1>
              <p className="text-blue-100">
                {user?.email}
              </p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold mt-2">
                  <Shield className="w-3 h-3 mr-1" />
                  ADMIN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 text-green-400">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Display Name
                </label>
                {isEditing ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter display name"
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-md py-2 px-3">
                    <span className="text-white">{displayName || 'Not set'}</span>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Member Since
                </label>
                <div className="bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-gray-400">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Accounts */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center">
                <LinkIcon className="w-5 h-5 mr-2" />
                Linked Accounts
              </h2>
              <button
                onClick={handleForceRefresh}
                disabled={loading}
                className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded-md transition"
                title="Force refresh all platform data"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh All
              </button>
            </div>

            <div className="space-y-4">
              {/* Discord */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${getProviderColor('discord')}`}>
                      {getProviderIcon('discord')}
                    </div>
                    <div>
                      <h3 className="font-medium">Discord</h3>
                      {isAccountLinked('discord') ? (
                        <div>
                          <p className="text-sm text-gray-400">
                            Connected as {linkedAccounts.find(acc => acc.type === 'discord')?.name}
                          </p>
                          {linkedAccounts.find(acc => acc.type === 'discord')?.cached && (
                            <p className="text-xs text-yellow-400 mt-1">
                              📄 Using cached data
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Connect your Discord account</p>
                      )}
                    </div>
                  </div>
                  
                  {isAccountLinked('discord') ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRefreshPlatform('discord')}
                        disabled={refreshing === 'discord' || loading}
                        className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded-md transition"
                        title="Refresh Discord data"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${refreshing === 'discord' ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleUnlinkAccount('discord')}
                        disabled={loading || refreshing === 'discord'}
                        className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-md transition"
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={loading}
                      className="flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition opacity-50 cursor-not-allowed"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Link
                    </button>
                  )}
                </div>
              </div>

              {/* Steam */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${getProviderColor('steam')}`}>
                      {getProviderIcon('steam')}
                    </div>
                    <div>
                      <h3 className="font-medium">Steam</h3>
                      {isAccountLinked('steam') ? (
                        <div>
                          <p className="text-sm text-gray-400">
                            Connected as {linkedAccounts.find(acc => acc.type === 'steam')?.name}
                          </p>
                          {linkedAccounts.find(acc => acc.type === 'steam')?.cached && (
                            <p className="text-xs text-yellow-400 mt-1">
                              📄 Using cached data
                            </p>
                          )}
                          {linkedAccounts.find(acc => acc.type === 'steam')?.profileUrl && (
                            <a
                              href={linkedAccounts.find(acc => acc.type === 'steam')?.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center mt-1"
                            >
                              View Profile <ExternalLink className="w-3 h-3 ml-1" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Connect your Steam account</p>
                      )}
                    </div>
                  </div>
                  
                  {isAccountLinked('steam') ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRefreshPlatform('steam')}
                        disabled={refreshing === 'steam' || loading}
                        className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded-md transition"
                        title="Refresh Steam data"
                      >
                        <RefreshCw className={`w-3 h-3 mr-1 ${refreshing === 'steam' ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleUnlinkAccount('steam')}
                        disabled={loading || refreshing === 'steam'}
                        className="flex items-center px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-md transition"
                      >
                        <Unlink className="w-3 h-3 mr-1" />
                        Unlink
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleLinkSteam}
                      disabled={loading || !user}
                      className={`flex items-center px-3 py-1 text-white text-sm rounded-md transition ${
                        loading || !user 
                          ? 'bg-gray-700 cursor-not-allowed opacity-50' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      {!user ? 'Login Required' : 'Link'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
              <h4 className="font-medium text-blue-400 mb-2">Why link accounts?</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Single sign-on across all our services</li>
                <li>• Access to platform-specific features</li>
                <li>• Unified gaming profile and statistics</li>
                <li>• Enhanced security and account recovery</li>
              </ul>
              
              {enhancedProfile && (
                <div className="mt-4 pt-4 border-t border-blue-700/50">
                  <p className="text-xs text-blue-300">
                    Profile ID: {enhancedProfile.user_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
