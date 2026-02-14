import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { useTranslation } from '../../hooks/useTranslation';

interface DashboardHeaderProps {
  currentPage: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentPage }) => {
  const { user, signOut, isAdmin } = useAuth();
  const t = useTranslation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { key: 'dashboard', path: '/dashboard', label: t('dashboard.navigation.dashboard') },
    { key: 'servers', path: '/dashboard/servers', label: t('dashboard.navigation.servers') },
    { key: 'leaderboards', path: '/dashboard/leaderboards', label: t('dashboard.navigation.leaderboards') },
    ...(isAdmin ? [{ key: 'admin', path: '/dashboard/admin', label: t('dashboard.navigation.admin') }] : []),
  ];

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img
                className="h-8 w-auto"
                src="/images/logos/Logo-35.png"
                alt="MindBreakers"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => {
                const isActive = currentPage === link.key;
                return (
                  <Link
                    key={link.key}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Side: Language + Avatar Dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />

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
                <ChevronDown className={`h-4 w-4 text-gray-400 group-hover:text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
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
                    {t('dashboard.sidebar.signOut')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Language + Hamburger */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              const isActive = currentPage === link.key;
              return (
                <Link
                  key={link.key}
                  to={link.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-gray-900 text-blue-400'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-700">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium">{initials}</span>
                  )}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-white">
                  {displayName}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
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
                {t('dashboard.sidebar.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
