import React, { useEffect, useState } from 'react';
import {
  UsersIcon,
  MapIcon,
  ServerIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  LoaderIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { ServerStats, subscribeToServerStats, getServerStats } from '../../lib/api';

interface ServerStatsCardProps {
  serverId: string;
}

export const ServerStatsCard: React.FC<ServerStatsCardProps> = ({ serverId }) => {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serverId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    // Initial fetch
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getServerStats(serverId);
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load server stats');
          setLoading(false);
        }
      }
    };

    fetchStats();

    // Subscribe to real-time updates
    const subscription = subscribeToServerStats(serverId, (newStats) => {
      if (mounted) {
        setStats(newStats);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [serverId]);

  // Format timestamp to relative time
  const formatLastUpdated = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Loading server stats...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center text-red-400">
          <AlertCircleIcon className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center py-8 text-gray-400">
          <AlertCircleIcon className="h-5 w-5 mr-2" />
          <span>No server stats available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50 flex items-center justify-between">
        <div className="flex items-center">
          <ServerIcon className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="font-bold text-white">Live Server Status</h3>
        </div>
        <div className="flex items-center gap-2">
          {stats.rcon_available ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-1.5 animate-pulse" />
              RCON Online
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/50">
              <AlertCircleIcon className="h-3 w-3 mr-1" />
              RCON Offline
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Server Name */}
          {stats.server_name && (
            <StatItem
              icon={<ServerIcon className="h-4 w-4 text-blue-400" />}
              label="Server Name"
              value={stats.server_name}
            />
          )}

          {/* Players */}
          <StatItem
            icon={<UsersIcon className="h-4 w-4 text-green-400" />}
            label="Players"
            value={`${stats.current_players} / ${stats.max_players}`}
            highlight={stats.current_players > 0}
          />

          {/* Map */}
          {stats.map_name && (
            <StatItem
              icon={<MapIcon className="h-4 w-4 text-purple-400" />}
              label="Map"
              value={stats.map_name}
            />
          )}

          {/* Game Mode */}
          {stats.game_mode && (
            <StatItem
              icon={<ServerIcon className="h-4 w-4 text-orange-400" />}
              label="Game Mode"
              value={stats.game_mode}
            />
          )}

          {/* Version */}
          {stats.version && (
            <StatItem
              icon={<CheckCircleIcon className="h-4 w-4 text-cyan-400" />}
              label="Version"
              value={stats.version}
            />
          )}

          {/* Last Updated */}
          <StatItem
            icon={<ClockIcon className="h-4 w-4 text-gray-400" />}
            label="Last Updated"
            value={formatLastUpdated(stats.last_updated)}
          />
        </div>

        {/* Game-specific data */}
        {stats.game_data && Object.keys(stats.game_data).length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Game Details</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(stats.game_data).map(([key, value]) => (
                <div key={key} className="bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-white font-medium">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player List */}
        {stats.player_list && stats.player_list.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" />
              Online Players ({stats.player_list.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {stats.player_list.map((player: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2 border border-gray-700/50"
                >
                  <span className="text-sm text-white">{player.name || 'Unknown'}</span>
                  {player.playtime && (
                    <span className="text-xs text-gray-500 font-mono">
                      {player.playtime}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {!stats.rcon_available && stats.last_rcon_error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="flex items-start">
              <AlertCircleIcon className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-400 mb-1">RCON Error</p>
                <p className="text-xs text-gray-400">{stats.last_rcon_error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sync Interval Info */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <RefreshCwIcon className="h-3 w-3 mr-1" />
            Auto-refreshes every {Math.floor(stats.sync_interval_seconds / 60)} minutes
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper component for individual stat items
const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}> = ({ icon, label, value, highlight }) => (
  <div className="bg-gray-900/50 rounded-lg px-3 py-2.5 border border-gray-700/50">
    <div className="flex items-center mb-1">
      {icon}
      <span className="text-xs text-gray-500 ml-2 uppercase tracking-wider">{label}</span>
    </div>
    <p className={`text-sm font-medium ${highlight ? 'text-green-400' : 'text-white'}`}>
      {value}
    </p>
  </div>
);
