import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import { createServerCommand, getServerStats, getCommandHistory } from '../../lib/api/server-commands';
import type { ServerCommand, ServerStats } from '../../lib/api/server-commands';
import {
  LoaderIcon, UsersIcon, ShieldCheckIcon, SearchIcon, TrashIcon,
  ChevronRightIcon, ChevronLeftIcon, XIcon, CheckCircleIcon,
  AlertTriangleIcon, MonitorIcon, ShieldIcon, UserIcon,
  RefreshCwIcon, MegaphoneIcon, LogOutIcon, BanIcon, PowerIcon,
  DownloadIcon, SaveIcon, LinkIcon,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface UserRow {
  id: string;
  email: string | null;
  steam_id: string | null;
  discord_id: string | null;
  kick_id: string | null;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
}

interface WhitelistEntry {
  user_id: string;
  steam_id: string;
  username: string;
  email: string;
  is_active: boolean;
  expires_at: string | null;
  reason: string | null;
  added_at: string;
  added_by_username: string | null;
}

type Tab = 'whitelist' | 'users' | 'actions' | 'moderation';

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl animate-in slide-in-from-right ${
      type === 'success'
        ? 'bg-gray-800 border-green-500/50'
        : 'bg-gray-800 border-red-500/50'
    }`}>
      <div className={`p-1.5 rounded-lg ${type === 'success' ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
        {type === 'success'
          ? <CheckCircleIcon className="w-4 h-4 text-green-400" />
          : <AlertTriangleIcon className="w-4 h-4 text-red-400" />
        }
      </div>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-300">
        <XIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, children, footer, onClose }: {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-[480px] max-w-[90vw] shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 p-1"><XIcon className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export const AdminPage = () => {
  const { isAdmin, user } = useAuth();
  const t = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>('whitelist');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => setToast({ message, type }), []);

  // ── Shared data ───────────────────────────────────────────────────────────

  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [whitelistEntries, setWhitelistEntries] = useState<WhitelistEntry[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [whitelistLoading, setWhitelistLoading] = useState(true);

  // ── Whitelist tab state ───────────────────────────────────────────────────

  const [leftSelected, setLeftSelected] = useState<Set<string>>(new Set());
  const [rightSelected, setRightSelected] = useState<Set<string>>(new Set());
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [transferring, setTransferring] = useState(false);

  // ── Users tab state ───────────────────────────────────────────────────────

  const [userSearch, setUserSearch] = useState('');

  // ── Server Actions tab state ──────────────────────────────────────────────

  const [serverId, setServerId] = useState<string | null>(null);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [commandHistory, setCommandHistory] = useState<ServerCommand[]>([]);
  const [actionModal, setActionModal] = useState<string | null>(null);
  const [modalInputs, setModalInputs] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState(false);

  // Guard: non-admins get redirected
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  // ── Data Fetching ─────────────────────────────────────────────────────────

  const fetchUsers = async () => {
    if (!supabase) return;
    setUsersLoading(true);
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, steam_id, discord_id, kick_id, display_name, is_admin, created_at');
      if (data) setAllUsers(data as UserRow[]);
    } catch { /* silent */ }
    setUsersLoading(false);
  };

  const fetchWhitelist = async () => {
    if (!supabase) return;
    setWhitelistLoading(true);
    try {
      const { data } = await supabase.rpc('get_game_whitelist', { p_game_slug: 'humanitz' });
      if (data) setWhitelistEntries(data as WhitelistEntry[]);
    } catch { /* silent */ }
    setWhitelistLoading(false);
  };

  const fetchServer = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('servers')
        .select('id, name, slug, game_slug, rcon_enabled')
        .eq('rcon_enabled', true)
        .limit(1)
        .single();
      if (data) {
        setServerId(data.id);
        const stats = await getServerStats(data.id);
        setServerStats(stats);
        const commands = await getCommandHistory({ serverId: data.id, limit: 20 });
        setCommandHistory(commands);
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
    fetchServer();
  }, []);

  // ── Whitelist derived data ────────────────────────────────────────────────

  const whitelistedUserIds = useMemo(
    () => new Set(whitelistEntries.map((e) => e.user_id)),
    [whitelistEntries]
  );

  const nonWhitelistedUsers = useMemo(() => {
    const q = leftSearch.toLowerCase();
    return allUsers
      .filter((u) => !whitelistedUserIds.has(u.id))
      .filter((u) =>
        !q ||
        u.display_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.steam_id?.toLowerCase().includes(q)
      );
  }, [allUsers, whitelistedUserIds, leftSearch]);

  const filteredWhitelist = useMemo(() => {
    const q = rightSearch.toLowerCase();
    return whitelistEntries.filter((e) =>
      !q ||
      e.username?.toLowerCase().includes(q) ||
      e.steam_id?.toLowerCase().includes(q)
    );
  }, [whitelistEntries, rightSearch]);

  // ── Users tab derived ─────────────────────────────────────────────────────

  const filteredAllUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) =>
      u.display_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.steam_id?.toLowerCase().includes(q) ||
      u.discord_id?.toLowerCase().includes(q)
    );
  }, [allUsers, userSearch]);

  // ── Whitelist transfer actions ────────────────────────────────────────────

  const transferToWhitelist = async () => {
    if (!supabase || leftSelected.size === 0) return;
    setTransferring(true);
    for (const userId of leftSelected) {
      await supabase.rpc('add_to_whitelist', { p_user_id: userId, p_game_slug: 'humanitz' });
    }
    const count = leftSelected.size;
    setLeftSelected(new Set());
    await Promise.all([fetchUsers(), fetchWhitelist()]);
    setTransferring(false);
    showToast(`${count} player${count > 1 ? 's' : ''} added to whitelist`);
  };

  const transferFromWhitelist = async () => {
    if (!supabase || rightSelected.size === 0) return;
    setTransferring(true);
    for (const userId of rightSelected) {
      await supabase.rpc('remove_from_whitelist', { p_user_id: userId, p_game_slug: 'humanitz' });
    }
    const count = rightSelected.size;
    setRightSelected(new Set());
    await Promise.all([fetchUsers(), fetchWhitelist()]);
    setTransferring(false);
    showToast(`${count} player${count > 1 ? 's' : ''} removed from whitelist`);
  };

  // ── Server Action Execution ───────────────────────────────────────────────

  const executeAction = async (commandType: string, rconCommand: string, description: string, params?: Record<string, any>) => {
    if (!serverId) return;
    setActionLoading(true);
    try {
      await createServerCommand({
        serverId,
        commandType: commandType as any,
        rconCommand,
        description,
        params,
      });
      showToast(`${description} — command queued`);
      const commands = await getCommandHistory({ serverId, limit: 20 });
      setCommandHistory(commands);
    } catch (err: any) {
      showToast(err.message || 'Failed to execute command', 'error');
    }
    setActionLoading(false);
    setActionModal(null);
    setModalInputs({});
  };

  // ── Stats helpers ─────────────────────────────────────────────────────────

  const totalUsers = allUsers.length;
  const whitelistedCount = whitelistEntries.length;
  const steamLinked = allUsers.filter((u) => u.steam_id).length;
  const discordLinked = allUsers.filter((u) => u.discord_id).length;
  const kickLinked = allUsers.filter((u) => u.kick_id).length;

  // ── Toggle helpers ────────────────────────────────────────────────────────

  const toggleLeft = (id: string) => setLeftSelected((prev) => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleRight = (id: string) => setRightSelected((prev) => {
    const s = new Set(prev);
    s.has(id) ? s.delete(id) : s.add(id);
    return s;
  });

  const toggleAllLeft = () => {
    if (leftSelected.size === nonWhitelistedUsers.length) setLeftSelected(new Set());
    else setLeftSelected(new Set(nonWhitelistedUsers.map((u) => u.id)));
  };

  const toggleAllRight = () => {
    if (rightSelected.size === filteredWhitelist.length) setRightSelected(new Set());
    else setRightSelected(new Set(filteredWhitelist.map((e) => e.user_id)));
  };

  // ── Tab definitions ───────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'whitelist', label: t('dashboard.admin.whitelistTab'), icon: <ShieldCheckIcon className="w-4 h-4" />, count: whitelistedCount },
    { key: 'users', label: t('dashboard.admin.usersTab'), icon: <UsersIcon className="w-4 h-4" />, count: totalUsers },
    { key: 'actions', label: t('dashboard.admin.serverActionsTab'), icon: <MonitorIcon className="w-4 h-4" /> },
    { key: 'moderation', label: t('dashboard.admin.moderationTab'), icon: <ShieldIcon className="w-4 h-4" /> },
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <DashboardLayout currentPage="admin">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
          </div>
          {t('dashboard.admin.pageTitle')}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{t('dashboard.admin.pageSubtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-gray-800 rounded-lg p-1 w-fit mb-6 border border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-500/50' : 'bg-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════ WHITELIST TAB ════════════ */}
      {activeTab === 'whitelist' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<UsersIcon className="w-5 h-5" />} label={t('dashboard.admin.totalUsers')} value={totalUsers} color="blue" />
            <StatCard icon={<ShieldCheckIcon className="w-5 h-5" />} label={t('dashboard.admin.whitelistedLabel')} value={whitelistedCount} color="green" />
            <StatCard icon={<LinkIcon className="w-5 h-5" />} label={t('dashboard.admin.steamLinked')} value={steamLinked} color="purple" />
            <StatCard icon={<UserIcon className="w-5 h-5" />} label={t('dashboard.admin.notWhitelistedCount')} value={totalUsers - whitelistedCount} color="yellow" />
          </div>

          {/* Two-column transfer */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_56px_1fr] gap-0 mb-6">
            {/* LEFT: Non-whitelisted users */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl flex flex-col min-h-[480px] max-h-[68vh]">
              <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-sm">{t('dashboard.admin.allRegistered')}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-900 px-2.5 py-1 rounded-full border border-gray-700">
                  {nonWhitelistedUsers.length} {t('dashboard.admin.notWhitelistedBadge').toLowerCase()}
                </span>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    placeholder={t('dashboard.admin.searchPlaceholder')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Select bar */}
              <div className="px-5 py-2 bg-gray-700/30 border-b border-gray-700 flex items-center gap-3 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={nonWhitelistedUsers.length > 0 && leftSelected.size === nonWhitelistedUsers.length}
                  onChange={toggleAllLeft}
                  className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span>{t('dashboard.admin.selectAll')}</span>
                {leftSelected.size > 0 && (
                  <span className="text-blue-400 font-medium">{leftSelected.size} {t('dashboard.admin.selected')}</span>
                )}
              </div>

              {/* User list */}
              <div className="flex-1 overflow-y-auto p-2">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                ) : nonWhitelistedUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <UsersIcon className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{t('dashboard.admin.noUsers')}</p>
                  </div>
                ) : (
                  nonWhitelistedUsers.map((u) => (
                    <UserRow
                      key={u.id}
                      name={u.display_name || u.email?.split('@')[0] || '—'}
                      meta={u.steam_id || u.email || ''}
                      selected={leftSelected.has(u.id)}
                      onClick={() => toggleLeft(u.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Transfer buttons */}
            <div className="flex lg:flex-col items-center justify-center gap-3 py-4 lg:py-0">
              <button
                onClick={transferToWhitelist}
                disabled={leftSelected.size === 0 || transferring}
                title={t('dashboard.admin.addToWhitelist')}
                className="w-10 h-10 rounded-full border-2 border-gray-700 bg-gray-800 flex items-center justify-center text-gray-400 hover:border-green-500 hover:text-green-400 hover:bg-green-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                {t('dashboard.admin.move')}
              </span>
              <button
                onClick={transferFromWhitelist}
                disabled={rightSelected.size === 0 || transferring}
                title={t('dashboard.admin.removeFromWhitelist')}
                className="w-10 h-10 rounded-full border-2 border-gray-700 bg-gray-800 flex items-center justify-center text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            </div>

            {/* RIGHT: Whitelisted players */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl flex flex-col min-h-[480px] max-h-[68vh]">
              <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,.5)]" />
                  <span className="font-bold text-sm">{t('dashboard.admin.whitelistedPlayers')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-red-700/30 bg-red-900/20 text-red-400">HumanitZ</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-900 px-2.5 py-1 rounded-full border border-gray-700">
                  {whitelistEntries.length} {t('dashboard.admin.players')}
                </span>
              </div>

              {/* Search */}
              <div className="px-4 py-3 border-b border-gray-700">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={rightSearch}
                    onChange={(e) => setRightSearch(e.target.value)}
                    placeholder={t('dashboard.admin.searchWhitelisted')}
                    className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Select bar */}
              <div className="px-5 py-2 bg-gray-700/30 border-b border-gray-700 flex items-center gap-3 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={filteredWhitelist.length > 0 && rightSelected.size === filteredWhitelist.length}
                  onChange={toggleAllRight}
                  className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span>{t('dashboard.admin.selectAll')}</span>
                {rightSelected.size > 0 && (
                  <span className="text-blue-400 font-medium">{rightSelected.size} {t('dashboard.admin.selected')}</span>
                )}
              </div>

              {/* User list */}
              <div className="flex-1 overflow-y-auto p-2">
                {whitelistLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                ) : filteredWhitelist.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <ShieldCheckIcon className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">{t('dashboard.admin.noWhitelisted')}</p>
                  </div>
                ) : (
                  filteredWhitelist.map((e) => (
                    <UserRow
                      key={e.user_id}
                      name={e.username || '—'}
                      meta={e.steam_id || ''}
                      selected={rightSelected.has(e.user_id)}
                      onClick={() => toggleRight(e.user_id)}
                      badge={e.is_active ? undefined : 'inactive'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════ USERS TAB ════════════ */}
      {activeTab === 'users' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<UsersIcon className="w-5 h-5" />} label={t('dashboard.admin.totalUsers')} value={totalUsers} color="blue" />
            <StatCard icon={<LinkIcon className="w-5 h-5" />} label={t('dashboard.admin.steamLinked')} value={steamLinked} color="purple" />
            <StatCard icon={<UserIcon className="w-5 h-5" />} label={t('dashboard.admin.discordLinked')} value={discordLinked} color="indigo" />
            <StatCard icon={<UserIcon className="w-5 h-5" />} label={t('dashboard.admin.kickLinked')} value={kickLinked} color="green" />
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-bold">{t('dashboard.admin.allUsers')}</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-3 border-b border-gray-700 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={t('dashboard.admin.searchUsersPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Table */}
            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderIcon className="w-5 h-5 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">{t('dashboard.admin.loadingUsers')}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3">{t('dashboard.admin.user')}</th>
                      <th className="px-4 py-3">{t('dashboard.admin.steamId')}</th>
                      <th className="px-4 py-3">Discord</th>
                      <th className="px-4 py-3">{t('dashboard.admin.joined')}</th>
                      <th className="px-4 py-3">{t('dashboard.admin.whitelistTab')}</th>
                      <th className="px-4 py-3">{t('dashboard.admin.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredAllUsers.map((u) => {
                      const wl = whitelistedUserIds.has(u.id);
                      const initials = (u.display_name || u.email || 'U').slice(0, 2).toUpperCase();
                      return (
                        <tr key={u.id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium">{u.display_name || '—'}</p>
                                <p className="text-xs text-gray-500">{u.email || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.steam_id || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{u.discord_id ? 'Linked' : '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {wl ? (
                              <span className="text-green-400 font-semibold text-xs">Yes</span>
                            ) : (
                              <span className="text-gray-500 text-xs">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {u.is_admin ? (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 font-medium">Admin</span>
                            ) : (
                              <span className="text-green-400 text-xs font-medium">Active</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredAllUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                          {t('dashboard.admin.noUsers')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════ SERVER ACTIONS TAB ════════════ */}
      {activeTab === 'actions' && (
        <>
          {/* Server status bar */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl px-5 py-3.5 flex items-center gap-4 mb-6 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('dashboard.admin.server')}:</span>
            <button className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors border-blue-700/50 bg-blue-900/20 text-blue-400`}>
              HumanitZ
            </button>
            <div className="flex-1" />
            {serverStats ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${serverStats.rcon_available ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,.5)]' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${serverStats.rcon_available ? 'text-green-400' : 'text-red-400'}`}>
                    {serverStats.rcon_available ? t('dashboard.admin.serverOnline') : t('dashboard.admin.serverOffline')}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-mono">
                  {serverStats.current_players}/{serverStats.max_players} {t('dashboard.admin.players')}
                </span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">{t('dashboard.admin.loadingServer')}</span>
            )}
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <ActionCard
              icon={<RefreshCwIcon className="w-5 h-5" />}
              title={t('dashboard.admin.restartServer')}
              description={t('dashboard.admin.restartDesc')}
              severity="critical"
              buttonLabel={t('dashboard.admin.restartNow')}
              onClick={() => setActionModal('restart')}
            />
            <ActionCard
              icon={<MegaphoneIcon className="w-5 h-5" />}
              title={t('dashboard.admin.broadcastMessage')}
              description={t('dashboard.admin.broadcastDesc')}
              severity="info"
              buttonLabel={t('dashboard.admin.sendBroadcast')}
              onClick={() => setActionModal('broadcast')}
            />
            <ActionCard
              icon={<LogOutIcon className="w-5 h-5" />}
              title={t('dashboard.admin.kickPlayer')}
              description={t('dashboard.admin.kickDesc')}
              severity="warning"
              buttonLabel={t('dashboard.admin.kickPlayerBtn')}
              onClick={() => setActionModal('kick')}
            />
            <ActionCard
              icon={<BanIcon className="w-5 h-5" />}
              title={t('dashboard.admin.banPlayer')}
              description={t('dashboard.admin.banDesc')}
              severity="critical"
              buttonLabel={t('dashboard.admin.banPlayerBtn')}
              onClick={() => setActionModal('ban')}
            />
            <ActionCard
              icon={<PowerIcon className="w-5 h-5" />}
              title={t('dashboard.admin.shutdownServer')}
              description={t('dashboard.admin.shutdownDesc')}
              severity="critical"
              buttonLabel={t('dashboard.admin.shutdownBtn')}
              onClick={() => setActionModal('shutdown')}
            />
            <ActionCard
              icon={<SaveIcon className="w-5 h-5" />}
              title={t('dashboard.admin.forceSave')}
              description={t('dashboard.admin.forceSaveDesc')}
              severity="info"
              buttonLabel={t('dashboard.admin.saveWorld')}
              onClick={() => executeAction('custom', 'save', 'Force save world')}
            />
            <ActionCard
              icon={<RefreshCwIcon className="w-5 h-5" />}
              title={t('dashboard.admin.syncWhitelist')}
              description={t('dashboard.admin.syncWhitelistDesc')}
              severity="safe"
              buttonLabel={t('dashboard.admin.syncNow')}
              onClick={() => executeAction('custom', 'whitelist_sync', 'Sync whitelist file')}
            />
            <ActionCard
              icon={<DownloadIcon className="w-5 h-5" />}
              title={t('dashboard.admin.updateGameFiles')}
              description={t('dashboard.admin.updateGameFilesDesc')}
              severity="safe"
              buttonLabel={t('dashboard.admin.runUpdate')}
              onClick={() => setActionModal('update')}
            />
          </div>

          {/* Action log */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="font-bold text-sm">{t('dashboard.admin.actionLog')}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 max-h-[200px] overflow-y-auto font-mono text-xs space-y-1">
                {commandHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">{t('dashboard.admin.noActions')}</p>
                ) : (
                  commandHistory.map((cmd) => (
                    <div key={cmd.id} className="flex gap-3 py-0.5">
                      <span className="text-gray-500 flex-shrink-0">{new Date(cmd.created_at).toLocaleTimeString()}</span>
                      <span className={
                        cmd.status === 'completed' ? 'text-green-400' :
                        cmd.status === 'failed' ? 'text-red-400' :
                        cmd.status === 'processing' ? 'text-yellow-400' :
                        'text-gray-400'
                      }>
                        [{cmd.status.toUpperCase()}] {cmd.description || cmd.rcon_command}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════ MODERATION TAB ════════════ */}
      {activeTab === 'moderation' && (
        <ModerationTab t={t} showToast={showToast} />
      )}

      {/* ════════════ MODALS ════════════ */}
      {actionModal === 'restart' && (
        <Modal title={t('dashboard.admin.restartServer')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('restart', 'restart', 'Restart server (10 min)', { reason: modalInputs.reason })} disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.restartNow')}
            </button>
          </>}
        >
          <p className="text-red-400 font-medium text-sm mb-4">{t('dashboard.admin.restartWarning')}</p>
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.restartReason')}</label>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" placeholder={t('dashboard.admin.restartReasonPlaceholder')} value={modalInputs.reason || ''} onChange={(e) => setModalInputs({ ...modalInputs, reason: e.target.value })} />
        </Modal>
      )}

      {actionModal === 'broadcast' && (
        <Modal title={t('dashboard.admin.broadcastMessage')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('announce', `announce ${modalInputs.message || ''}`, 'Broadcast message', { message: modalInputs.message })} disabled={!modalInputs.message || actionLoading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.sendBroadcast')}
            </button>
          </>}
        >
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.message')}</label>
          <textarea className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 min-h-[80px]" placeholder={t('dashboard.admin.broadcastPlaceholder')} value={modalInputs.message || ''} onChange={(e) => setModalInputs({ ...modalInputs, message: e.target.value })} />
        </Modal>
      )}

      {actionModal === 'kick' && (
        <Modal title={t('dashboard.admin.kickPlayer')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('kick_player', `kick ${modalInputs.player} ${modalInputs.reason || ''}`, `Kick player: ${modalInputs.player}`, { player: modalInputs.player, reason: modalInputs.reason })} disabled={!modalInputs.player || actionLoading}
              className="px-4 py-2 text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.kickPlayerBtn')}
            </button>
          </>}
        >
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.playerNameOrId')}</label>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 mb-4" placeholder={t('dashboard.admin.searchPlayerPlaceholder')} value={modalInputs.player || ''} onChange={(e) => setModalInputs({ ...modalInputs, player: e.target.value })} />
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.reason')}</label>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" placeholder={t('dashboard.admin.reasonPlaceholder')} value={modalInputs.reason || ''} onChange={(e) => setModalInputs({ ...modalInputs, reason: e.target.value })} />
        </Modal>
      )}

      {actionModal === 'ban' && (
        <Modal title={t('dashboard.admin.banPlayer')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('ban_player', `ban ${modalInputs.player}`, `Ban player: ${modalInputs.player}`, { player: modalInputs.player, reason: modalInputs.reason, duration: modalInputs.duration || 'permanent' })} disabled={!modalInputs.player || actionLoading}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.confirmBan')}
            </button>
          </>}
        >
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.playerNameOrId')}</label>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 mb-4" placeholder={t('dashboard.admin.searchPlayerPlaceholder')} value={modalInputs.player || ''} onChange={(e) => setModalInputs({ ...modalInputs, player: e.target.value })} />
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.reason')}</label>
          <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 mb-4" value={modalInputs.reason || ''} onChange={(e) => setModalInputs({ ...modalInputs, reason: e.target.value })}>
            <option value="">Select reason...</option>
            <option value="Cheating / Hacking">Cheating / Hacking</option>
            <option value="Harassment / Toxic behavior">Harassment / Toxic behavior</option>
            <option value="Griefing">Griefing</option>
            <option value="Stream sniping">Stream sniping</option>
            <option value="Exploiting bugs">Exploiting bugs</option>
          </select>
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.duration')}</label>
          <select className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" value={modalInputs.duration || '7 days'} onChange={(e) => setModalInputs({ ...modalInputs, duration: e.target.value })}>
            <option value="24 hours">24 hours</option>
            <option value="3 days">3 days</option>
            <option value="7 days">7 days</option>
            <option value="14 days">14 days</option>
            <option value="30 days">30 days</option>
            <option value="permanent">Permanent</option>
          </select>
        </Modal>
      )}

      {actionModal === 'shutdown' && (
        <Modal title={t('dashboard.admin.shutdownServer')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('shutdown', 'shutdown', 'Shutdown server')} disabled={modalInputs.confirm !== 'SHUTDOWN' || actionLoading}
              className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.shutdownBtn')}
            </button>
          </>}
        >
          <div className="border border-red-700/30 rounded-lg p-4 mb-4">
            <p className="text-red-400 font-bold text-sm mb-2">{t('dashboard.admin.shutdownWarningTitle')}</p>
            <p className="text-gray-400 text-sm">{t('dashboard.admin.shutdownWarningDesc')}</p>
          </div>
          <label className="block text-xs font-medium text-gray-400 mb-2">{t('dashboard.admin.typeShutdown')}</label>
          <input className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500" placeholder="SHUTDOWN" value={modalInputs.confirm || ''} onChange={(e) => setModalInputs({ ...modalInputs, confirm: e.target.value })} />
        </Modal>
      )}

      {actionModal === 'update' && (
        <Modal title={t('dashboard.admin.updateGameFiles')} onClose={() => { setActionModal(null); setModalInputs({}); }}
          footer={<>
            <button onClick={() => { setActionModal(null); setModalInputs({}); }} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">{t('dashboard.admin.cancel')}</button>
            <button onClick={() => executeAction('custom', 'steamcmd_update', 'Update game files via SteamCMD')} disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors">
              {t('dashboard.admin.runUpdate')}
            </button>
          </>}
        >
          <p className="text-gray-400 text-sm mb-4">{t('dashboard.admin.updateWarning')}</p>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 font-mono text-xs text-gray-400">
            steamcmd +login anonymous +app_update 2728330 validate +quit
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </DashboardLayout>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-700/30' },
    green: { bg: 'bg-green-900/20', text: 'text-green-400', border: 'border-green-700/30' },
    yellow: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-700/30' },
    purple: { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-700/30' },
    indigo: { bg: 'bg-indigo-900/20', text: 'text-indigo-400', border: 'border-indigo-700/30' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-4 flex items-center gap-3.5`}>
      <div className={`p-2.5 rounded-lg ${c.bg} ${c.text}`}>{icon}</div>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wide font-medium">{label}</p>
        <p className={`text-xl font-bold ${c.text}`}>{value}</p>
      </div>
    </div>
  );
}

function UserRow({ name, meta, selected, onClick, badge }: {
  name: string; meta: string; selected: boolean; onClick: () => void; badge?: string;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all border ${
        selected
          ? 'bg-blue-900/20 border-blue-700/30'
          : 'border-transparent hover:bg-gray-700/20'
      }`}
    >
      <input
        type="checkbox"
        checked={selected}
        readOnly
        className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
      />
      <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-[11px] text-gray-500 font-mono truncate">{meta}</p>
      </div>
      {badge === 'inactive' && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 font-bold uppercase">Inactive</span>
      )}
    </div>
  );
}

function ActionCard({ icon, title, description, severity, buttonLabel, onClick }: {
  icon: React.ReactNode; title: string; description: string;
  severity: 'critical' | 'warning' | 'info' | 'safe';
  buttonLabel: string; onClick: () => void;
}) {
  const styles = {
    critical: { border: 'border-t-red-500', iconBg: 'bg-red-900/20 text-red-400', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { border: 'border-t-yellow-500', iconBg: 'bg-yellow-900/20 text-yellow-400', btn: 'bg-yellow-600 hover:bg-yellow-700' },
    info: { border: 'border-t-blue-500', iconBg: 'bg-blue-900/20 text-blue-400', btn: 'bg-blue-600 hover:bg-blue-700' },
    safe: { border: 'border-t-green-500', iconBg: 'bg-green-900/20 text-green-400', btn: 'bg-green-600 hover:bg-green-700' },
  };
  const s = styles[severity];
  return (
    <div className={`bg-gray-800 border border-gray-700 ${s.border} border-t-2 rounded-xl p-5 flex flex-col hover:border-gray-600 transition-colors`}>
      <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center mb-3`}>{icon}</div>
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-4 flex-1">{description}</p>
      <button onClick={onClick} className={`px-3 py-1.5 text-xs font-medium ${s.btn} text-white rounded-lg transition-colors w-fit`}>
        {buttonLabel}
      </button>
    </div>
  );
}

// ── Moderation Tab (stub with placeholder content) ──────────────────────────

function ModerationTab({ t, showToast }: { t: (key: string) => string; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<AlertTriangleIcon className="w-5 h-5" />} label={t('dashboard.admin.activeWarnings')} value={0} color="yellow" />
        <StatCard icon={<BanIcon className="w-5 h-5" />} label={t('dashboard.admin.activeBans')} value={0} color="blue" />
        <StatCard icon={<ShieldIcon className="w-5 h-5" />} label={t('dashboard.admin.openReports')} value={0} color="purple" />
        <StatCard icon={<MonitorIcon className="w-5 h-5" />} label={t('dashboard.admin.totalActions30d')} value={0} color="green" />
      </div>

      {/* Bans table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold text-sm">{t('dashboard.admin.activeBansTitle')}</span>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          <BanIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('dashboard.admin.noBans')}</p>
        </div>
      </div>

      {/* Warnings table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="font-bold text-sm">{t('dashboard.admin.recentWarnings')}</span>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          <AlertTriangleIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('dashboard.admin.noWarnings')}</p>
        </div>
      </div>

      {/* Reports */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-sm">{t('dashboard.admin.reportsQueue')}</span>
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          <ShieldIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{t('dashboard.admin.noReports')}</p>
        </div>
      </div>
    </>
  );
}
