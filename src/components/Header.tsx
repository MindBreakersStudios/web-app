import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, LogOut, Radio, LayoutDashboard, Settings } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, signOut, loading, isAdmin } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const discordName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username ||
    null;
  const discordAvatar = user?.user_metadata?.avatar_url || null;

  const displayName = playerName || discordName || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player';
  const avatarUrl = playerAvatar || discordAvatar;
  const initials = displayName.slice(0, 2).toUpperCase();

  // Fetch player avatar/name from DB (same pattern as DashboardHeader)
  useEffect(() => {
    if (!user || !supabase) return;
    const fetchPlayerInfo = async () => {
      try {
        const { data: userRow } = await supabase
          .from('users')
          .select('steam_id')
          .eq('id', user.id)
          .single();
        if (userRow?.steam_id) {
          const { data: player } = await supabase
            .from('players')
            .select('in_game_name, avatar_url')
            .eq('steam_id', userRow.steam_id)
            .single();
          if (player?.avatar_url) setPlayerAvatar(player.avatar_url);
          if (player?.in_game_name) setPlayerName(player.in_game_name);
        }
      } catch {
        // silent
      }
    };
    fetchPlayerInfo();
  }, [user]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to handle section navigation
  const handleSectionClick = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`, { replace: false });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/images/logos/Logo-35.png" alt="MindBreakers Logo" className="h-10 md:h-12 object-contain" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            {t('header.home')}
          </Link>
          <div className="relative group">
            <button className="flex items-center text-gray-300 hover:text-white transition">
              {t('header.servers')} <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link
                to="/humanitz"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                {t('header.humanitz')}
              </Link>
              <Link
                to="/scum"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
              >
                {t('header.scum')}
              </Link>
            </div>
          </div>
          <Link
            to="/watchparty"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition group"
          >
            <Radio className="w-4 h-4 text-lime-400" />
            <span>WatchParty</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </Link>
          <button
            onClick={() => handleSectionClick('features')}
            className="text-gray-300 hover:text-white transition"
          >
            {t('header.features')}
          </button>
          <button
            onClick={() => handleSectionClick('about')}
            className="text-gray-300 hover:text-white transition"
          >
            {t('header.about')}
          </button>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <LanguageSwitcher />
          {loading ? (
            <div className="flex items-center space-x-2 bg-gray-800 text-gray-400 px-4 py-2 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
              <span>{t('header.loading')}</span>
            </div>
          ) : user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 hover:bg-gray-800 px-3 py-2 rounded-md transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border border-gray-600">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium">{initials}</span>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-200 group-hover:text-white max-w-[120px] truncate">
                  {displayName}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] rounded-full font-bold leading-none">
                    {t('header.admin')}
                  </span>
                )}
                <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('common.dashboard')}
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('dashboard.navigation.settings')}
                  </Link>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition"
              onClick={() => setIsLoginModalOpen(true)}
            >
              {t('header.login')}
            </button>
          )}
        </div>

        {/* Mobile menu button and language switcher */}
        <div className="md:hidden flex items-center space-x-2">
          <LanguageSwitcher />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-white">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <Link
              to="/"
              className="block py-2 text-blue-400 hover:text-blue-300"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {t('header.home')}
            </Link>
            <Link
              to="/humanitz"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {t('header.humanitzServer')}
            </Link>
            <Link
              to="/scum"
              className="block py-2 text-gray-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {t('header.scumServer')}
            </Link>
            <Link
              to="/watchparty"
              className="flex items-center gap-2 py-2 text-gray-300 hover:text-white"
              onClick={() => {
                setIsMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <Radio className="w-4 h-4 text-lime-400" />
              <span>WatchParty</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleSectionClick('features');
              }}
              className="block py-2 text-gray-300 hover:text-white text-left"
            >
              {t('header.features')}
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleSectionClick('about');
              }}
              className="block py-2 text-gray-300 hover:text-white text-left"
            >
              {t('header.about')}
            </button>

            {loading ? (
              <div className="pt-2 border-t border-gray-700 text-center">
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-blue-400"></div>
                  <span>{t('header.loadingAuth')}</span>
                </div>
              </div>
            ) : user ? (
              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center px-1 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium">{initials}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">{displayName}</div>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-yellow-500 text-black text-[10px] rounded-full font-bold leading-none">
                        {t('header.admin')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('common.dashboard')}
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('dashboard.navigation.settings')}
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-md transition text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.signOut')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition w-full mt-2"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLoginModalOpen(true);
                }}
              >
                {t('header.login')}
              </button>
            )}
          </div>
        </div>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </header>
  );
};
