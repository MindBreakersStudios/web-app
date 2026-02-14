import React, { useEffect, useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';
import {
  LoaderIcon, UsersIcon, ShieldCheckIcon, SearchIcon, TrashIcon,
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

type Tab = 'users' | 'whitelist';

// ── Component ────────────────────────────────────────────────────────────────

export const AdminPage = () => {
  const { isAdmin } = useAuth();
  const t = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>('users');

  // Users tab state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [whitelistedUserIds, setWhitelistedUserIds] = useState<Set<string>>(new Set());
  const [usersLoading, setUsersLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Whitelist tab state
  const [whitelistEntries, setWhitelistEntries] = useState<WhitelistEntry[]>([]);
  const [whitelistLoading, setWhitelistLoading] = useState(true);

  // Guard: non-admins get redirected
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  // ── Fetch users + their whitelist status ──────────────────────────────────

  const fetchUsers = async () => {
    if (!supabase) return;
    setUsersLoading(true);
    try {
      const { data: userRows } = await supabase
        .from('users')
        .select('id, email, steam_id, discord_id, kick_id, display_name, is_admin, created_at');

      if (userRows) setUsers(userRows as UserRow[]);

      // cross-reference whitelist
      const { data: wl } = await supabase.rpc('get_game_whitelist', {
        p_game_slug: 'humanitz',
      });
      if (wl) {
        const ids = new Set<string>((wl as WhitelistEntry[]).map((e) => e.user_id));
        setWhitelistedUserIds(ids);
      }
    } catch {
      // silent
    }
    setUsersLoading(false);
  };

  // ── Fetch whitelist entries ───────────────────────────────────────────────

  const fetchWhitelist = async () => {
    if (!supabase) return;
    setWhitelistLoading(true);
    try {
      const { data } = await supabase.rpc('get_game_whitelist', {
        p_game_slug: 'humanitz',
      });
      if (data) setWhitelistEntries(data as WhitelistEntry[]);
    } catch {
      // silent
    }
    setWhitelistLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, []);

  // ── Filtered users ────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        (u.display_name?.toLowerCase().includes(q)) ||
        (u.email?.toLowerCase().includes(q)) ||
        (u.steam_id?.toLowerCase().includes(q))
    );
  }, [users, search]);

  // ── Select helpers ────────────────────────────────────────────────────────

  const allSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selected.has(u.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Whitelist / Unwhitelist actions ────────────────────────────────────────

  const whitelistSelected = async () => {
    if (!supabase || selected.size === 0) return;
    setActionLoading(true);
    for (const userId of selected) {
      await supabase.rpc('add_to_whitelist', {
        p_user_id: userId,
        p_game_slug: 'humanitz',
      });
    }
    setSelected(new Set());
    await Promise.all([fetchUsers(), fetchWhitelist()]);
    setActionLoading(false);
  };

  const removeWhitelistSelected = async () => {
    if (!supabase || selected.size === 0) return;
    setActionLoading(true);
    for (const userId of selected) {
      await supabase.rpc('remove_from_whitelist', {
        p_user_id: userId,
        p_game_slug: 'humanitz',
      });
    }
    setSelected(new Set());
    await Promise.all([fetchUsers(), fetchWhitelist()]);
    setActionLoading(false);
  };

  const removeFromWhitelist = async (userId: string) => {
    if (!supabase) return;
    if (!window.confirm(t('dashboard.admin.confirmRemove'))) return;
    await supabase.rpc('remove_from_whitelist', {
      p_user_id: userId,
      p_game_slug: 'humanitz',
    });
    await Promise.all([fetchUsers(), fetchWhitelist()]);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <DashboardLayout currentPage="admin">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.admin.pageTitle')}</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'users'
              ? 'bg-gray-800 text-blue-400 border border-b-0 border-gray-700 -mb-px'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <UsersIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          {t('dashboard.admin.usersTab')}
        </button>
        <button
          onClick={() => setActiveTab('whitelist')}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'whitelist'
              ? 'bg-gray-800 text-blue-400 border border-b-0 border-gray-700 -mb-px'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <ShieldCheckIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
          {t('dashboard.admin.whitelistTab')}
        </button>
      </div>

      {/* ═══════ Users Tab ═══════ */}
      {activeTab === 'users' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('dashboard.admin.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-xs text-gray-400">
                  {selected.size} {t('dashboard.admin.selected')}
                </span>
              )}
              <button
                onClick={whitelistSelected}
                disabled={selected.size === 0 || actionLoading}
                className="px-3 py-1.5 text-xs font-medium bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {t('dashboard.admin.whitelistSelected')}
              </button>
              <button
                onClick={removeWhitelistSelected}
                disabled={selected.size === 0 || actionLoading}
                className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {t('dashboard.admin.removeWhitelist')}
              </button>
            </div>
          </div>

          {/* Table */}
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderIcon className="h-5 w-5 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">{t('dashboard.admin.loadingUsers')}</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('dashboard.admin.noUsers')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                        title={t('dashboard.admin.selectAll')}
                      />
                    </th>
                    <th className="px-4 py-3">{t('dashboard.admin.displayName')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.email')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.steamId')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.status')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.joined')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map((user) => {
                    const wl = whitelistedUserIds.has(user.id);
                    return (
                      <tr key={user.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(user.id)}
                            onChange={() => toggleSelect(user.id)}
                            className="rounded border-gray-600 bg-gray-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{user.display_name || '—'}</td>
                        <td className="px-4 py-3 text-gray-400">{user.email || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{user.steam_id || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            wl
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-gray-700 text-gray-400'
                          }`}>
                            {wl ? t('dashboard.admin.whitelistedBadge') : t('dashboard.admin.notWhitelistedBadge')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════ Whitelist Tab ═══════ */}
      {activeTab === 'whitelist' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-blue-400 mr-2" />
            <h2 className="font-bold">{t('dashboard.admin.whitelistTitle')}</h2>
            <span className="ml-2 text-xs text-gray-500">{whitelistEntries.length} {t('dashboard.admin.total')}</span>
          </div>

          {whitelistLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoaderIcon className="h-5 w-5 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400">{t('dashboard.admin.loadingWhitelist')}</span>
            </div>
          ) : whitelistEntries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t('dashboard.admin.noWhitelisted')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3">{t('dashboard.admin.username')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.steamId')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.status')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.reason')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.added')}</th>
                    <th className="px-4 py-3">{t('dashboard.admin.addedBy')}</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {whitelistEntries.map((entry) => (
                    <tr key={entry.steam_id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium">{entry.username || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{entry.steam_id}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.is_active
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {entry.is_active ? t('dashboard.admin.activeStatus') : t('dashboard.admin.inactiveStatus')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{entry.reason || '—'}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {new Date(entry.added_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{entry.added_by_username || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeFromWhitelist(entry.user_id)}
                          className="text-red-400 hover:text-red-300 transition-colors text-xs font-medium flex items-center gap-1"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                          {t('dashboard.admin.remove')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
