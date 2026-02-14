import React, { useEffect, useState } from 'react';
import {
  ClockIcon,
  UserIcon,
  TerminalIcon,
  LoaderIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  BanIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FilterIcon,
} from 'lucide-react';
import {
  ServerCommand,
  CommandStatus,
  getCommandHistory,
  subscribeToServerCommands,
  formatCommandStatus,
  getStatusColor,
  getCommandDuration,
} from '../../lib/api';

interface CommandHistoryProps {
  serverId?: string;
  refreshTrigger?: number;
}

export const CommandHistory: React.FC<CommandHistoryProps> = ({
  serverId,
  refreshTrigger,
}) => {
  const [commands, setCommands] = useState<ServerCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCommand, setExpandedCommand] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CommandStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchCommands = async () => {
      try {
        setLoading(true);
        setError(null);
        const filters = serverId ? { serverId, limit: 50 } : { limit: 50 };
        const data = await getCommandHistory(filters);
        if (mounted) {
          setCommands(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to load command history');
          setLoading(false);
        }
      }
    };

    fetchCommands();

    // Subscribe to real-time updates if serverId is provided
    let subscription: any;
    if (serverId) {
      subscription = subscribeToServerCommands(serverId, (updatedCommand) => {
        if (mounted) {
          setCommands((prev) => {
            const index = prev.findIndex((cmd) => cmd.id === updatedCommand.id);
            if (index !== -1) {
              // Update existing command
              const newCommands = [...prev];
              newCommands[index] = updatedCommand;
              return newCommands;
            } else {
              // Add new command to the beginning
              return [updatedCommand, ...prev];
            }
          });
        }
      });
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [serverId, refreshTrigger]);

  // Format timestamp to relative time
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  // Get status badge
  const getStatusBadge = (status: CommandStatus) => {
    const color = getStatusColor(status);
    const colorMap = {
      success: 'bg-green-900/30 text-green-400 border-green-700/50',
      error: 'bg-red-900/30 text-red-400 border-red-700/50',
      warning: 'bg-yellow-900/30 text-yellow-400 border-yellow-700/50',
      info: 'bg-blue-900/30 text-blue-400 border-blue-700/50',
      default: 'bg-gray-900/30 text-gray-400 border-gray-700/50',
    };

    const iconMap: Record<CommandStatus, React.ReactNode> = {
      pending: <ClockIcon className="h-3 w-3" />,
      processing: <LoaderIcon className="h-3 w-3 animate-spin" />,
      completed: <CheckCircleIcon className="h-3 w-3" />,
      failed: <XCircleIcon className="h-3 w-3" />,
      cancelled: <BanIcon className="h-3 w-3" />,
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorMap[color]}`}>
        {iconMap[status]}
        <span className="ml-1.5">{formatCommandStatus(status)}</span>
      </span>
    );
  };

  // Filter commands
  const filteredCommands = statusFilter === 'all'
    ? commands
    : commands.filter((cmd) => cmd.status === statusFilter);

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">Loading command history...</span>
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

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TerminalIcon className="h-5 w-5 text-blue-400 mr-2" />
            <h3 className="font-bold text-white">Command History</h3>
            <span className="ml-2 text-xs text-gray-500">
              ({filteredCommands.length} {statusFilter !== 'all' ? formatCommandStatus(statusFilter as CommandStatus).toLowerCase() : 'total'})
            </span>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-gray-400 hover:text-white transition"
          >
            <FilterIcon className="h-4 w-4 mr-1" />
            Filter
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {['all', 'pending', 'processing', 'completed', 'failed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as CommandStatus | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {status === 'all' ? 'All' : formatCommandStatus(status as CommandStatus)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Command List */}
      {filteredCommands.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <TerminalIcon className="h-12 w-12 mx-auto mb-3 text-gray-600" />
          <p>No commands found</p>
          {statusFilter !== 'all' && (
            <p className="text-sm text-gray-500 mt-1">
              Try changing the filter or executing a command
            </p>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {filteredCommands.map((command) => (
            <CommandRow
              key={command.id}
              command={command}
              isExpanded={expandedCommand === command.id}
              onToggleExpand={() =>
                setExpandedCommand(expandedCommand === command.id ? null : command.id)
              }
              formatTimestamp={formatTimestamp}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Command Row Component
const CommandRow: React.FC<{
  command: ServerCommand;
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatTimestamp: (timestamp: string) => string;
  getStatusBadge: (status: CommandStatus) => React.ReactNode;
}> = ({ command, isExpanded, onToggleExpand, formatTimestamp, getStatusBadge }) => {
  const duration = getCommandDuration(command);

  return (
    <div className="hover:bg-gray-700/30 transition">
      {/* Main Row */}
      <div
        className="px-6 py-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge(command.status)}
              <span className="text-xs font-mono text-gray-500">
                {command.command_type}
              </span>
            </div>
            <p className="text-sm text-white font-medium truncate">
              {command.description || command.rcon_command}
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {formatTimestamp(command.created_at)}
              </span>
              {duration !== null && (
                <span className="flex items-center">
                  <LoaderIcon className="h-3 w-3 mr-1" />
                  {Math.round(duration / 1000)}s
                </span>
              )}
            </div>
          </div>
          <button className="ml-4 text-gray-400 hover:text-white transition">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-4 space-y-3">
          {/* Command Details */}
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">RCON Command:</span>
                <p className="text-white font-mono mt-1 bg-gray-900 px-2 py-1 rounded">
                  {command.rcon_command}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Command Type:</span>
                <p className="text-white mt-1">{command.command_type}</p>
              </div>
              {command.params && Object.keys(command.params).length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Parameters:</span>
                  <pre className="text-white font-mono text-xs mt-1 bg-gray-900 px-2 py-1 rounded overflow-x-auto">
                    {JSON.stringify(command.params, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Execution Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Created:</span>
              <p className="text-white mt-1">{new Date(command.created_at).toLocaleString()}</p>
            </div>
            {command.started_at && (
              <div>
                <span className="text-gray-500">Started:</span>
                <p className="text-white mt-1">{new Date(command.started_at).toLocaleString()}</p>
              </div>
            )}
            {command.completed_at && (
              <div>
                <span className="text-gray-500">Completed:</span>
                <p className="text-white mt-1">{new Date(command.completed_at).toLocaleString()}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">Attempts:</span>
              <p className="text-white mt-1">
                {command.attempt_count} / {command.max_attempts}
              </p>
            </div>
          </div>

          {/* Result or Error */}
          {command.result && (
            <div>
              <span className="text-xs text-gray-500">Result:</span>
              <pre className="text-white font-mono text-xs mt-1 bg-gray-900 px-3 py-2 rounded overflow-x-auto border border-gray-700">
                {command.result}
              </pre>
            </div>
          )}

          {command.error_message && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
              <div className="flex items-start">
                <XCircleIcon className="h-4 w-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">Error</p>
                  <p className="text-xs text-gray-300">{command.error_message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Executor Info */}
          {(command.executor_hostname || command.executor_pid) && (
            <div className="text-xs text-gray-500">
              Executed by: {command.executor_hostname || 'unknown'}
              {command.executor_pid && ` (PID: ${command.executor_pid})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
