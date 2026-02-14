import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
  SkullIcon, ShieldCheckIcon, ShieldXIcon, LoaderIcon,
  ClockIcon, TrophyIcon, CalendarIcon, UserIcon, GamepadIcon,
  CheckCircleIcon, CircleIcon, AlertTriangleIcon, LinkIcon, SwordsIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

// ── Game filter (same pattern as WatchParty) ─────────────────────────────────

interface GameFilter {
  slug: string;
  label: string;
  icon: string;
  enabled: boolean;
}

const GAME_FILTERS: GameFilter[] = [
  { slug: 'humanitz', label: 'HumanitZ', icon: '/images/humanitz/Humanitz-icon.webp', enabled: true },
  { slug: 'scum', label: 'SCUM', icon: '/images/scum/scum-icon.webp', enabled: false },
  { slug: 'dayz', label: 'DayZ', icon: '/images/dayz/dayz-icon.webp', enabled: false },
  { slug: 'vrising', label: 'V Rising', icon: '/images/vrising/vrising-icon.png', enabled: false },
  { slug: 'hytale', label: 'Hytale', icon: '/images/hytale/hytale-icon.jpg', enabled: false },
];

// ── Hardcoded fallback for HumanitZ achievements ────────────────────────────
// Used when the DB achievements table is empty or the query fails

const HUMANITZ_ACHIEVEMENTS_FALLBACK = [
  { slug: 'home-sweet-home', name: 'Home Sweet Home', description: 'Place your first Spawn Point', points: 50 },
  { slug: 'let-there-be-light', name: 'Let There Be Light', description: 'Build your first Campfire', points: 10 },
  { slug: 'getting-crafty', name: 'Getting Crafty', description: 'Build your first Workbench', points: 15 },
  { slug: 'pack-rat', name: 'Pack Rat', description: 'Build your first Storage Container', points: 10 },
  { slug: 'mad-scientist', name: 'Mad Scientist', description: 'Build your first Chemistry Station', points: 25 },
  { slug: 'locked-and-loaded', name: 'Locked and Loaded', description: 'Build your first Guns & Ammo Bench', points: 30 },
  { slug: 'green-thumb', name: 'Green Thumb', description: 'Build your first Farm Plot', points: 20 },
  { slug: 'power-up', name: 'Power Up', description: 'Build your first Generator', points: 35 },
  { slug: 'grease-monkey', name: 'Grease Monkey', description: 'Build your first Vehicle Bench', points: 25 },
  { slug: 'fire-and-steel', name: 'Fire and Steel', description: 'Build your first Furnace', points: 20 },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface PlayerData {
  id: string;
  in_game_name: string | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  death_count: number;
  total_playtime_minutes: number;
  avatar_url: string | null;
}

interface GameAchievement {
  slug: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPlaytime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
  const { user } = useAuth();
  const t = useTranslation();
  const [selectedGame, setSelectedGame] = useState('humanitz');

  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [dbAccounts, setDbAccounts] = useState<any>(null);
  const [gameAchievements, setGameAchievements] = useState<GameAchievement[]>([]);
  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Derive display info from auth
  const discordName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username ||
    null;
  const discordAvatar = user?.user_metadata?.avatar_url;
  const memberSince = user?.created_at;

  // ── MindBreaker achievements (computed client-side) ────────────────────

  const authProviders = user?.app_metadata?.providers as string[] | undefined;
  const identities = user?.identities ?? [];
  const hasDiscord =
    !!identities.find((i: any) => i.provider === 'discord') ||
    authProviders?.includes('discord') ||
    !!dbAccounts?.discord_id;
  const hasSteam = !!steamId;
  const hasKick = !!dbAccounts?.kick_id;

  const mindBreakerAchievements = [
    {
      label: t('dashboard.achievements.firstLogin'),
      description: t('dashboard.achievements.firstLoginDesc'),
      done: true,
    },
    {
      label: t('dashboard.achievements.linkDiscord'),
      description: t('dashboard.achievements.linkDiscordDesc'),
      done: hasDiscord,
    },
    {
      label: t('dashboard.achievements.linkSteam'),
      description: t('dashboard.achievements.linkSteamDesc'),
      done: hasSteam,
    },
    {
      label: t('dashboard.achievements.linkKick'),
      description: t('dashboard.achievements.linkKickDesc'),
      done: hasKick,
    },
    {
      label: t('dashboard.achievements.getWhitelisted'),
      description: t('dashboard.achievements.getWhitelistedDesc'),
      done: isWhitelisted === true,
    },
  ];

  const mbCompleted = mindBreakerAchievements.filter((a) => a.done).length;
  const gameCompleted = gameAchievements.filter((a) => a.unlocked).length;

  // ── Fetch player data ───────────────────────────────────────────────────

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchAll = async () => {
      setLoading(true);

      // 1. Get user row (steam_id, kick_id, discord_id)
      let userSteamId: string | null = null;
      try {
        const { data } = await supabase
          .from('users')
          .select('steam_id, discord_id, kick_id')
          .eq('id', user.id)
          .single();
        userSteamId = data?.steam_id ?? null;
        setSteamId(userSteamId);
        setDbAccounts(data);
      } catch {
        // no user row
      }

      // 2. Get player row if steam is linked
      let playerId: string | null = null;
      if (userSteamId) {
        try {
          const { data } = await supabase
            .from('players')
            .select('id, in_game_name, first_seen_at, last_seen_at, death_count, total_playtime_minutes, avatar_url')
            .eq('steam_id', userSteamId)
            .single();
          if (data) {
            setPlayerData(data);
            playerId = data.id;
          }
        } catch {
          // no player row
        }
      }

      // 3. Fetch HumanitZ achievements
      let fetchedFromDb = false;
      try {
        const { data: gameRow } = await supabase
          .from('games')
          .select('id')
          .eq('slug', 'humanitz')
          .single();

        if (gameRow?.id) {
          const { data: allAchievements } = await supabase
            .from('achievements')
            .select('id, slug, name, description, points')
            .eq('game_id', gameRow.id)
            .order('sort_order', { ascending: true });

          if (allAchievements && allAchievements.length > 0) {
            fetchedFromDb = true;

            // Get player unlock status
            let unlockedMap: Record<string, string> = {};
            if (playerId) {
              const { data: unlocked } = await supabase
                .from('player_achievements')
                .select('achievement_id, unlocked_at')
                .eq('player_id', playerId);
              if (unlocked) {
                unlockedMap = Object.fromEntries(
                  unlocked.map((u: any) => [u.achievement_id, u.unlocked_at])
                );
              }
            }

            setGameAchievements(allAchievements.map((a: any) => ({
              slug: a.slug,
              name: a.name,
              description: a.description ?? '',
              points: a.points,
              unlocked: !!unlockedMap[a.id],
              unlocked_at: unlockedMap[a.id] ?? null,
            })));
          }
        }
      } catch {
        // query failed
      }

      // Fallback: use hardcoded list if DB returned nothing
      if (!fetchedFromDb) {
        setGameAchievements(HUMANITZ_ACHIEVEMENTS_FALLBACK.map((a) => ({
          ...a,
          unlocked: false,
          unlocked_at: null,
        })));
      }

      // 4. Whitelist status
      try {
        const { data } = await supabase.rpc('is_user_whitelisted', {
          p_user_id: user.id,
          p_game_slug: 'humanitz',
        });
        setIsWhitelisted(data === true);
      } catch {
        setIsWhitelisted(null);
      }

      setLoading(false);
    };

    fetchAll();
  }, [user]);

  // ── Derive display name ───────────────────────────────────────────────

  const displayName =
    playerData?.in_game_name ||
    discordName ||
    user?.email?.split('@')[0] ||
    'Player';

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <DashboardLayout currentPage="dashboard">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">{t('dashboard.loading')}</span>
        </div>
      ) : (
        <>
          {/* ═══════ Player Profile Card (generic — always visible) ═══════ */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gray-700 p-1 border-2 border-gray-600">
                {discordAvatar || playerData?.avatar_url ? (
                  <img
                    src={discordAvatar || playerData?.avatar_url || ''}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full rounded-full bg-gray-700 flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-gray-500" />
                  </div>
                )}
              </div>
              {isWhitelisted === false && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 sm:hidden">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-500 border border-yellow-700/50 whitespace-nowrap">
                    {t('dashboard.profile.notWhitelisted')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-2 sm:ml-6 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{displayName}</h2>
                  {discordName && playerData?.in_game_name && (
                    <p className="text-sm text-indigo-400">{discordName}</p>
                  )}
                  {steamId && (
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{steamId}</p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start mt-1.5 gap-3 flex-wrap">
                    {memberSince && (
                      <span className="flex items-center text-sm text-gray-400">
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        {t('dashboard.profile.joined')} {new Date(memberSince).toLocaleDateString()}
                      </span>
                    )}
                    {playerData?.first_seen_at && (
                      <span className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        <GamepadIcon className="h-3 w-3 mr-1" />
                        {t('dashboard.profile.firstSeen')} {new Date(playerData.first_seen_at).toLocaleDateString()}
                      </span>
                    )}
                    {playerData?.last_seen_at && (
                      <span className="flex items-center text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
                        {t('dashboard.profile.lastActive')} {timeAgo(playerData.last_seen_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden sm:block mt-2 sm:mt-0">
                  {isWhitelisted === true ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                      <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                      {t('dashboard.profile.whitelisted')}
                    </span>
                  ) : isWhitelisted === false ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900/30 text-yellow-500 border border-yellow-700/50">
                      <AlertTriangleIcon className="w-4 h-4 mr-1.5" />
                      {t('dashboard.profile.notWhitelisted')}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* ── MindBreakers Achievements (generic — always visible) ── */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center">
                <img src="/images/logos/Face-18.png" alt="MB" className="w-5 h-5 mr-2 opacity-80" />
                {t('dashboard.achievements.mindbreakers')}
              </h3>
              <span className="text-xs font-mono bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">
                {mbCompleted}/{mindBreakerAchievements.length}
              </span>
            </div>

            <div className="px-5 pt-4 pb-2">
              <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${(mbCompleted / mindBreakerAchievements.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                {mindBreakerAchievements.map((a) => (
                  <AchievementRow
                    key={a.label}
                    label={a.label}
                    description={a.description}
                    done={a.done}
                    accentColor="blue"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ═══════ Game-Specific Section ═══════ */}
          <div className="border border-gray-700 rounded-xl overflow-hidden">
            {/* Game Tabs — attached to the game section */}
            <div className="bg-gray-800/50 border-b border-gray-700 px-4 pt-4 pb-0">
              <div className="flex space-x-2 flex-wrap">
                {GAME_FILTERS.map((game) => {
                  const isActive = selectedGame === game.slug;
                  const isDisabled = !game.enabled;
                  return (
                    <button
                      key={game.slug}
                      onClick={() => game.enabled && setSelectedGame(game.slug)}
                      disabled={isDisabled}
                      className={`
                        relative flex items-center px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all duration-200 border border-b-0
                        ${isActive
                          ? 'bg-gray-900 border-gray-700 text-blue-400 -mb-px z-10'
                          : isDisabled
                            ? 'bg-gray-800 border-transparent text-gray-500 cursor-default'
                            : 'bg-gray-800 border-transparent text-gray-400 hover:text-gray-300'
                        }
                      `}
                    >
                      <img src={game.icon} alt="" className="w-5 h-5 rounded mr-2" />
                      {game.label}
                      {isDisabled && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-gray-700 text-gray-500 rounded">
                          {t('dashboard.gameFilters.soon')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Game-filtered content */}
            <div className="bg-gray-900 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* ── Left: Stats + Admin (8/12) ── */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      icon={<SkullIcon className="w-5 h-5 text-red-500" />}
                      label={t('dashboard.stats.deaths')}
                      value={playerData ? String(playerData.death_count) : null}
                      noDataMsg={t('dashboard.stats.linkSteam')}
                      noDataType="link"
                    />
                    <StatCard
                      icon={<ClockIcon className="w-5 h-5 text-blue-500" />}
                      label={t('dashboard.stats.playtime')}
                      value={playerData ? formatPlaytime(playerData.total_playtime_minutes) : null}
                      noDataMsg={t('dashboard.stats.linkSteam')}
                      noDataType="link"
                    />
                    <StatCard
                      icon={<TrophyIcon className="w-5 h-5 text-yellow-500" />}
                      label={t('dashboard.stats.achievements')}
                      value={`${gameCompleted} / ${gameAchievements.length}`}
                    />
                    <StatCard
                      icon={<ShieldCheckIcon className="w-5 h-5 text-green-500" />}
                      label={t('dashboard.stats.survivalDays')}
                      value={null}
                      noDataMsg={t('dashboard.stats.comingSoon')}
                      noDataType="soon"
                    />
                    <StatCard
                      icon={<SwordsIcon className="w-5 h-5 text-orange-500" />}
                      label={t('dashboard.stats.zombieKills')}
                      value={null}
                      noDataMsg={t('dashboard.stats.comingSoon')}
                      noDataType="soon"
                    />
                    <StatCard
                      icon={
                        isWhitelisted
                          ? <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                          : <ShieldXIcon className="w-5 h-5 text-yellow-500" />
                      }
                      label={t('dashboard.stats.whitelist')}
                      value={
                        isWhitelisted === true
                          ? t('dashboard.stats.active')
                          : isWhitelisted === false
                            ? t('dashboard.stats.notWhitelisted')
                            : null
                      }
                      valueColor={isWhitelisted ? 'text-green-400' : 'text-yellow-500'}
                      noDataMsg={t('dashboard.stats.unknown')}
                      noDataType="warning"
                    />
                  </div>

                </div>

                {/* ── Right: Game Achievements (4/12) ── */}
                <div className="lg:col-span-4">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center">
                        <img src="/images/humanitz/Humanitz-icon.webp" alt="" className="w-5 h-5 mr-2 rounded" />
                        HumanitZ
                      </h3>
                      <span className="text-xs font-mono bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-700">
                        {gameCompleted}/{gameAchievements.length}
                      </span>
                    </div>

                    <div className="px-5 pt-4 pb-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mb-6">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${gameAchievements.length > 0 ? (gameCompleted / gameAchievements.length) * 100 : 0}%` }}
                        />
                      </div>

                      <div className="space-y-5 mb-4 max-h-[500px] overflow-y-auto pr-2">
                        {gameAchievements.map((a) => (
                          <AchievementRow
                            key={a.slug}
                            label={a.name}
                            description={a.description}
                            done={a.unlocked}
                            unlockedAt={a.unlocked_at}
                            points={a.points}
                            accentColor="blue"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

// ── Achievement row (checklist item) ─────────────────────────────────────────

function AchievementRow({
  label,
  description,
  done,
  unlockedAt,
  points,
  accentColor,
}: {
  label: string;
  description: string;
  done: boolean;
  unlockedAt?: string | null;
  points?: number;
  accentColor: 'blue' | 'green';
}) {
  const checkColor = accentColor === 'blue' ? 'text-blue-500' : 'text-green-500';
  return (
    <div className="flex items-start group">
      <div className="flex-shrink-0 mt-0.5">
        {done ? (
          <CheckCircleIcon className={`w-5 h-5 ${checkColor}`} />
        ) : (
          <CircleIcon className="w-5 h-5 text-gray-600" />
        )}
      </div>
      <div className="ml-3 w-full">
        <div className="flex justify-between items-start">
          <p className={`text-sm font-medium ${done ? 'text-white' : 'text-gray-400'}`}>
            {label}
          </p>
          {points != null && (
            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-300 border border-gray-600">
              {points}pt
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        {done && unlockedAt && (
          <p className={`text-[9px] mt-0.5 ${accentColor === 'blue' ? 'text-blue-500/50' : 'text-green-500/50'}`}>
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Stat card sub-component ──────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  valueColor,
  noDataMsg,
  noDataType,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  valueColor?: string;
  noDataMsg?: string;
  noDataType?: 'link' | 'soon' | 'warning';
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex flex-col justify-between h-32 relative overflow-hidden group">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-gray-900/50 rounded-lg border border-gray-700/50">
          {icon}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{label}</h3>

        {value != null ? (
          <div className={`text-2xl font-bold ${valueColor || 'text-white'}`}>
            {value}
          </div>
        ) : noDataType === 'link' ? (
          <div className="flex items-center text-sm text-blue-400 font-medium cursor-pointer hover:text-blue-300 transition-colors">
            <LinkIcon className="w-3 h-3 mr-1.5" />
            {noDataMsg}
          </div>
        ) : noDataType === 'soon' ? (
          <div className="text-sm text-gray-500 font-medium italic">
            {noDataMsg}
          </div>
        ) : noDataType === 'warning' ? (
          <div className="text-lg font-bold text-yellow-500">
            {noDataMsg}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{noDataMsg || '—'}</p>
        )}
      </div>
    </div>
  );
}
