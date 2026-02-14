import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
  LoaderIcon, LinkIcon, UserIcon, KeyIcon, CreditCardIcon,
  BellIcon, SaveIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { steamAPI } from '../lib/api';
import { useKickAuth } from '../hooks/useKickAuth';
import { useTranslation } from '../hooks/useTranslation';

// ── Brand SVG Icons ──────────────────────────────────────────────────────────

const SteamIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.387 3.387 0 0 1 1.912-.59c.064 0 .128.003.19.008l2.861-4.142V8.91a4.528 4.528 0 0 1 4.524-4.524 4.528 4.528 0 0 1 4.523 4.524 4.528 4.528 0 0 1-4.523 4.524h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396a3.404 3.404 0 0 1-3.362-2.898L.309 14.04C1.709 19.658 6.389 24 11.979 24c6.627 0 12-5.373 12-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61a2.542 2.542 0 0 0 4.659-.899 2.543 2.543 0 0 0-2.539-2.539c-.259 0-.511.04-.75.113l1.523.63a1.868 1.868 0 0 1-1.42 3.305zm8.4-5.812a3.016 3.016 0 0 0 3.012-3.012 3.016 3.016 0 0 0-3.012-3.012 3.016 3.016 0 0 0-3.012 3.012 3.016 3.016 0 0 0 3.012 3.012zm-.001-4.816a1.807 1.807 0 0 1 0 3.612 1.807 1.807 0 0 1 0-3.612z" />
  </svg>
);

const DiscordIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TwitchIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

const KickIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.537 7.859L11.396 12l4.141 4.141L13.396 18.282 7.115 12l6.281-6.282z" />
    <path d="M2 2h20v20H2V2zm2 2v16h16V4H4z" />
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────

interface LinkedAccounts {
  steam_id: string | null;
  discord_id: string | null;
  twitch_id: string | null;
  kick_id: string | null;
  email: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Settings = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const kickAuth = useKickAuth();

  const [activeTab, setActiveTab] = useState('accounts');
  const [dbAccounts, setDbAccounts] = useState<LinkedAccounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Derive linked providers from Supabase Auth identities
  const identities = user?.identities ?? [];

  const getIdentity = (provider: string) =>
    identities.find((i: any) => i.provider === provider);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('steam_id, discord_id, twitch_id, kick_id, email')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setDbAccounts(data);
        }
      } catch {
        // silent
      }
      setLoading(false);
    };

    fetchAccounts();
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ── Connect handlers ────────────────────────────────────────────────────

  const connectSteam = async () => {
    setConnecting('steam');
    try {
      const returnUrl = `${window.location.origin}/auth/steam-link-callback`;
      const data = await steamAPI.initSecureLink(returnUrl);
      if (data?.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      showMessage('error', 'Failed to get Steam auth URL');
    } catch {
      showMessage('error', 'Failed to start Steam linking. Make sure the backend is running.');
    }
    setConnecting(null);
  };

  const connectDiscord = async () => {
    if (!supabase) return;
    setConnecting('discord');
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'discord',
        options: { redirectTo: `${window.location.origin}/dashboard/settings` },
      });
      if (error) {
        showMessage('error', error.message);
        setConnecting(null);
      }
    } catch {
      showMessage('error', 'Failed to connect Discord.');
      setConnecting(null);
    }
  };

  const connectTwitch = async () => {
    if (!supabase) return;
    setConnecting('twitch');
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'twitch',
        options: { redirectTo: `${window.location.origin}/dashboard/settings` },
      });
      if (error) {
        showMessage('error', error.message);
        setConnecting(null);
      }
    } catch {
      showMessage('error', 'Failed to connect Twitch.');
      setConnecting(null);
    }
  };

  const connectKick = async () => {
    setConnecting('kick');
    try {
      await kickAuth.login();
    } catch {
      showMessage('error', 'Failed to connect Kick.');
      setConnecting(null);
    }
  };

  // ── Disconnect handler (placeholder — unlinkIdentity not yet available) ─

  const handleDisconnect = (key: string) => {
    showMessage('error', t('dashboard.settings.disconnectNotSupported').replace('{platform}', key));
  };

  // ── Derive linked status from BOTH auth identities and DB columns ─────

  const discordIdentity = getIdentity('discord');
  const twitchIdentity = getIdentity('twitch');

  const isDiscordLinked = !!discordIdentity || !!dbAccounts?.discord_id;
  const isTwitchLinked = !!twitchIdentity || !!dbAccounts?.twitch_id;
  const isSteamLinked = !!dbAccounts?.steam_id;
  const isKickLinked = !!dbAccounts?.kick_id || kickAuth.isConnected;

  const discordDisplayName =
    discordIdentity?.identity_data?.full_name ||
    discordIdentity?.identity_data?.name ||
    discordIdentity?.identity_data?.preferred_username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    dbAccounts?.discord_id ||
    'Discord User';

  const discordAvatar =
    discordIdentity?.identity_data?.avatar_url ||
    user?.user_metadata?.avatar_url;

  const twitchDisplayName =
    twitchIdentity?.identity_data?.preferred_username ||
    twitchIdentity?.identity_data?.name ||
    dbAccounts?.twitch_id ||
    'Twitch User';

  const twitchAvatar = twitchIdentity?.identity_data?.avatar_url;

  const email = dbAccounts?.email || user?.email || '';

  // ── Platform definitions ────────────────────────────────────────────────

  const platforms = [
    {
      key: 'steam' as const,
      name: 'Steam',
      icon: <SteamIcon />,
      linked: isSteamLinked,
      displayValue: dbAccounts?.steam_id,
      avatar: null as string | null | undefined,
      connect: connectSteam,
      brandColor: 'bg-[#1b2838]',
      borderColor: 'border-[#2a475e]',
    },
    {
      key: 'discord' as const,
      name: 'Discord',
      icon: <DiscordIcon />,
      linked: isDiscordLinked,
      displayValue: discordDisplayName,
      avatar: discordAvatar,
      connect: connectDiscord,
      brandColor: 'bg-[#5865F2]/10',
      borderColor: 'border-[#5865F2]/30',
    },
    {
      key: 'twitch' as const,
      name: 'Twitch',
      icon: <TwitchIcon />,
      linked: isTwitchLinked,
      displayValue: twitchDisplayName,
      avatar: twitchAvatar,
      connect: connectTwitch,
      brandColor: 'bg-[#9146FF]/10',
      borderColor: 'border-[#9146FF]/30',
    },
    {
      key: 'kick' as const,
      name: 'Kick',
      icon: <KickIcon />,
      linked: isKickLinked,
      displayValue: dbAccounts?.kick_id || kickAuth.user?.username || null,
      avatar: null as string | null | undefined,
      connect: connectKick,
      brandColor: 'bg-[#53FC18]/10',
      borderColor: 'border-[#53FC18]/30',
    },
  ];

  // ── Tab definitions ───────────────────────────────────────────────────

  const tabs = [
    { key: 'accounts', label: t('dashboard.settings.linkedAccounts') || 'Linked Accounts', icon: <LinkIcon className="h-4 w-4 inline mr-2" /> },
    { key: 'profile', label: 'Profile', icon: <UserIcon className="h-4 w-4 inline mr-2" /> },
    { key: 'security', label: 'Security', icon: <KeyIcon className="h-4 w-4 inline mr-2" /> },
    { key: 'billing', label: 'Billing', icon: <CreditCardIcon className="h-4 w-4 inline mr-2" /> },
    { key: 'notifications', label: 'Notifications', icon: <BellIcon className="h-4 w-4 inline mr-2" /> },
  ];

  // ── Render tab content ───────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'accounts':
        return renderLinkedAccounts();
      case 'profile':
        return renderProfile();
      case 'security':
        return renderSecurity();
      case 'billing':
        return renderBilling();
      case 'notifications':
        return renderNotifications();
      default:
        return null;
    }
  };

  // ── Linked Accounts Tab (existing real functionality) ──────────────

  const renderLinkedAccounts = () => (
    <div className="space-y-6">
      {/* Email */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-5">
        <div className="flex items-center mb-3">
          <span className="text-blue-400 mr-2">@</span>
          <h3 className="font-semibold">{t('dashboard.settings.emailAddress')}</h3>
        </div>
        <p className="text-sm text-white bg-gray-900 border border-gray-700 rounded-md px-4 py-2.5">
          {email || <span className="text-gray-500 italic">{t('dashboard.settings.noEmail')}</span>}
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.key}
            className={`rounded-lg border p-5 ${
              platform.linked
                ? `${platform.brandColor} ${platform.borderColor}`
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-white mr-2">{platform.icon}</span>
                <span className="font-semibold">{platform.name}</span>
              </div>
              {platform.linked && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  {t('dashboard.settings.connected')}
                </span>
              )}
            </div>

            {platform.linked ? (
              <>
                <div className="flex items-center mb-4">
                  {platform.avatar ? (
                    <img src={platform.avatar} alt="" className="w-8 h-8 rounded-full mr-2" />
                  ) : null}
                  <span className="text-sm text-gray-300 truncate">
                    {platform.displayValue}
                  </span>
                </div>
                <button
                  onClick={() => handleDisconnect(platform.name)}
                  className="w-full text-center text-xs text-gray-400 hover:text-red-400 transition py-1.5 rounded border border-gray-600 hover:border-red-500/40"
                >
                  {t('dashboard.settings.disconnect')}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{t('dashboard.settings.notConnected')}</p>
                <button
                  onClick={platform.connect}
                  disabled={connecting === platform.key}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md text-sm font-medium transition"
                >
                  {connecting === platform.key ? (
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    t('dashboard.settings.connect')
                  )}
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Profile Tab ────────────────────────────────────────────────────────

  const renderProfile = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Profile Information</h3>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Discord Username</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={isDiscordLinked ? String(discordDisplayName) : ''}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Steam ID</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={dbAccounts?.steam_id || ''}
                readOnly
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4">Avatar</h3>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center">
              <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-12 w-12 text-gray-500" />
                )}
              </div>
              <div className="ml-6">
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Upload New Avatar
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, GIF or PNG. Max size 2MB.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Security Tab ───────────────────────────────────────────────────────

  const renderSecurity = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <KeyIcon className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Security Settings</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Password management, two-factor authentication, and other security features are coming soon.
      </p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800">
        Coming Soon
      </span>
    </div>
  );

  // ── Billing Tab ────────────────────────────────────────────────────────

  const renderBilling = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <CreditCardIcon className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Billing & Subscriptions</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Payment methods, subscription plans, and billing history will be available here once we launch our premium features.
      </p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800">
        Coming Soon
      </span>
    </div>
  );

  // ── Notifications Tab ──────────────────────────────────────────────────

  const renderNotifications = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <BellIcon className="h-12 w-12 text-gray-600 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Notifications</h3>
      <p className="text-sm text-gray-500 text-center max-w-md">
        Email and in-app notification preferences will be available here soon.
      </p>
      <span className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-400 border border-yellow-800">
        Coming Soon
      </span>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────────────────

  return (
    <DashboardLayout currentPage="settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{t('dashboard.settings.title') || 'Account Settings'}</h2>
          <p className="text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Status message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              message.type === 'success'
                ? 'bg-green-900/30 border border-green-700 text-green-300'
                : 'bg-red-900/30 border border-red-700 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-700 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`
                px-3 sm:px-5 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
                }
              `}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">{t('dashboard.settings.loading')}</span>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
    </DashboardLayout>
  );
};
