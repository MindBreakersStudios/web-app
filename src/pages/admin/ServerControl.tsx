import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ServerStatsCard } from '../../components/admin/ServerStatsCard';
import { QuickActions } from '../../components/admin/QuickActions';
import { CommandHistory } from '../../components/admin/CommandHistory';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import {
  ServerIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  LoaderIcon,
} from 'lucide-react';

interface Server {
  id: string;
  name: string;
  slug: string;
  game_slug: string;
  rcon_enabled: boolean;
}

export const ServerControl = () => {
  const { user, isAdmin } = useAuth();
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandRefreshTrigger, setCommandRefreshTrigger] = useState(0);

  // Check if user has admin access
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;

    const fetchUserRole = async () => {
      try {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserRole(data.role);
        }
      } catch (err) {
        console.error('Failed to fetch user role:', err);
      }
    };

    fetchUserRole();
  }, [user]);

  // Fetch available servers
  useEffect(() => {
    if (!supabase) return;

    const fetchServers = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch servers with RCON enabled
        const { data, error: fetchError } = await supabase
          .from('servers')
          .select('id, name, slug, game_slug, rcon_enabled')
          .eq('rcon_enabled', true)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setServers(data as Server[]);
          // Auto-select first server
          setSelectedServerId(data[0].id);
        } else {
          setServers([]);
          setError('No RCON-enabled servers found. Please configure RCON in the database.');
        }
      } catch (err: any) {
        console.error('Failed to fetch servers:', err);
        setError(err.message || 'Failed to load servers');
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  // Redirect if not admin
  if (!isAdmin && userRole !== 'admin' && userRole !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const selectedServer = servers.find((s) => s.id === selectedServerId);

  // Handle command created - refresh command history
  const handleCommandCreated = () => {
    setCommandRefreshTrigger((prev) => prev + 1);
  };

  return (
    <DashboardLayout currentPage="servers">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-400 mr-3" />
              Admin Server Control
            </h1>
            <p className="text-gray-400 mt-1">
              Manage game servers via RCON commands
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700/50">
            <ShieldCheckIcon className="h-3 w-3 mr-1.5" />
            Admin Access
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Loading servers...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6">
          <div className="flex items-start">
            <AlertTriangleIcon className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-semibold mb-1">Error Loading Servers</h3>
              <p className="text-gray-300 text-sm">{error}</p>
              <p className="text-gray-400 text-xs mt-2">
                Make sure at least one server has RCON enabled in the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Server Selector */}
      {!loading && servers.length > 0 && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Server
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => setSelectedServerId(server.id)}
                  className={`
                    flex items-center p-4 rounded-xl border transition
                    ${
                      selectedServerId === server.id
                        ? 'bg-blue-900/30 border-blue-700 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <ServerIcon className={`h-5 w-5 mr-3 ${
                    selectedServerId === server.id ? 'text-blue-400' : 'text-gray-500'
                  }`} />
                  <div className="text-left flex-1">
                    <p className="font-medium">{server.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{server.game_slug}</p>
                  </div>
                  {selectedServerId === server.id && (
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          {selectedServerId && (
            <div className="space-y-6">
              {/* Server Stats and Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ServerStatsCard serverId={selectedServerId} />
                <QuickActions
                  serverId={selectedServerId}
                  onCommandCreated={handleCommandCreated}
                />
              </div>

              {/* Command History */}
              <CommandHistory
                serverId={selectedServerId}
                refreshTrigger={commandRefreshTrigger}
              />
            </div>
          )}
        </>
      )}

      {/* No Servers State */}
      {!loading && servers.length === 0 && !error && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
          <ServerIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No RCON Servers Configured</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            No servers with RCON enabled were found. Please configure RCON settings in the database
            for at least one server to use this feature.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};
