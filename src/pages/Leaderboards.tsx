import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { SkullIcon, LoaderIcon, TrophyIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useTranslation } from '../hooks/useTranslation';

interface LeaderboardEntry {
  steam_id: string;
  in_game_name: string | null;
  death_count: number;
  avatar_url: string | null;
  total_playtime_minutes: number;
}

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const Leaderboards = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSteamId, setUserSteamId] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchData = async () => {
      setLoading(true);

      // Get current user's steam_id for highlighting
      try {
        const { data } = await supabase
          .from('users')
          .select('steam_id')
          .eq('id', user.id)
          .single();
        setUserSteamId(data?.steam_id ?? null);
      } catch {
        // no steam linked
      }

      // Fetch top 50 players by death count
      try {
        const { data, error } = await supabase
          .from('players')
          .select('steam_id, in_game_name, death_count, avatar_url, total_playtime_minutes')
          .gt('death_count', 0)
          .order('death_count', { ascending: false })
          .limit(50);

        if (!error && data) {
          setEntries(data as LeaderboardEntry[]);
        }
      } catch {
        // silent
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  return (
    <DashboardLayout currentPage="leaderboards">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-500/20 p-2.5 rounded-lg">
            <SkullIcon className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t('dashboard.leaderboard.title')}</h2>
            <p className="text-sm text-gray-400">{t('dashboard.leaderboard.subtitle')}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">{t('dashboard.leaderboard.loading')}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <SkullIcon className="h-10 w-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{t('dashboard.leaderboard.noDeaths')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.leaderboard.beFirst')}</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">{t('dashboard.leaderboard.rank')}</th>
                  <th className="px-4 py-3">{t('dashboard.leaderboard.player')}</th>
                  <th className="px-4 py-3 text-right">{t('dashboard.leaderboard.deaths')}</th>
                  <th className="px-4 py-3 text-right hidden sm:table-cell">{t('dashboard.leaderboard.playtime')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isMe = userSteamId && entry.steam_id === userSteamId;
                  return (
                    <tr
                      key={entry.steam_id}
                      className={`
                        transition-colors
                        ${isMe ? 'bg-blue-500/10 border-l-2 border-l-blue-400' : 'hover:bg-gray-700/30'}
                      `}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 text-center">
                        {rank <= 3 ? (
                          <span className={`
                            inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                            ${rank === 1 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                            ${rank === 2 ? 'bg-gray-400/20 text-gray-300' : ''}
                            ${rank === 3 ? 'bg-orange-500/20 text-orange-400' : ''}
                          `}>
                            {rank === 1 && <TrophyIcon className="h-4 w-4" />}
                            {rank === 2 && '2'}
                            {rank === 3 && '3'}
                          </span>
                        ) : (
                          <span className="text-gray-500">{rank}</span>
                        )}
                      </td>

                      {/* Player */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {entry.avatar_url ? (
                            <img src={entry.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-xs text-gray-400">
                                {(entry.in_game_name || '?')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className={`font-medium ${isMe ? 'text-blue-400' : 'text-white'}`}>
                              {entry.in_game_name || t('dashboard.leaderboard.unknown')}
                              {isMe && <span className="text-xs text-blue-400/60 ml-1.5">{t('dashboard.leaderboard.you')}</span>}
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono">{entry.steam_id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Deaths */}
                      <td className="px-4 py-3 text-right">
                        <span className="text-red-400 font-bold text-base">{entry.death_count}</span>
                      </td>

                      {/* Playtime */}
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-gray-400">
                          {formatPlaytime(entry.total_playtime_minutes)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
