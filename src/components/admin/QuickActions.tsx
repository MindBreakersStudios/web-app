import React, { useState } from 'react';
import {
  PowerIcon,
  MegaphoneIcon,
  UserXIcon,
  TerminalIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
} from 'lucide-react';
import { createServerCommand, CommandType } from '../../lib/api';
import { Button } from '../ui/Button';

interface QuickActionsProps {
  serverId: string;
  onCommandCreated?: () => void;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ serverId, onCommandCreated }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showAnnounceModal, setShowAnnounceModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Execute a command
  const executeCommand = async (
    commandType: CommandType,
    rconCommand: string,
    description: string,
    params?: Record<string, any>
  ) => {
    try {
      setLoading(commandType);
      await createServerCommand({
        serverId,
        commandType,
        rconCommand,
        description,
        params,
      });
      showToast('success', `Command "${description}" queued successfully`);
      onCommandCreated?.();
    } catch (error: any) {
      showToast('error', error.message || 'Failed to queue command');
    } finally {
      setLoading(null);
    }
  };

  // Quick action: Restart Server
  const handleRestart = () => {
    if (confirm('Are you sure you want to restart the server? All players will be disconnected.')) {
      executeCommand('restart', 'restart', 'Restart server');
    }
  };

  // Quick action: Announce Message
  const handleAnnounce = (message: string) => {
    if (!message.trim()) {
      showToast('error', 'Announcement message cannot be empty');
      return;
    }
    executeCommand(
      'announce',
      `announce ${message}`,
      'Send announcement',
      { message }
    );
    setShowAnnounceModal(false);
  };

  // Quick action: Kick Player
  const handleKick = (playerName: string, reason?: string) => {
    if (!playerName.trim()) {
      showToast('error', 'Player name cannot be empty');
      return;
    }
    const command = reason
      ? `kick ${playerName} ${reason}`
      : `kick ${playerName}`;
    executeCommand(
      'kick_player',
      command,
      `Kick player: ${playerName}`,
      { player: playerName, reason }
    );
    setShowKickModal(false);
  };

  // Custom command
  const handleCustomCommand = (command: string, description?: string) => {
    if (!command.trim()) {
      showToast('error', 'Command cannot be empty');
      return;
    }
    executeCommand(
      'custom',
      command,
      description || `Custom command: ${command.substring(0, 50)}...`
    );
    setShowCustomModal(false);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
        <h3 className="font-bold text-white flex items-center">
          <TerminalIcon className="h-5 w-5 text-blue-400 mr-2" />
          Quick Actions
        </h3>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`mx-6 mt-4 p-3 rounded-md text-sm flex items-center ${
            toast.type === 'success'
              ? 'bg-green-900/30 border border-green-700 text-green-300'
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <XCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Restart Server */}
        <Button
          variant="danger"
          onClick={handleRestart}
          disabled={loading === 'restart'}
          className="flex items-center justify-center"
        >
          {loading === 'restart' ? (
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <PowerIcon className="h-4 w-4 mr-2" />
          )}
          Restart Server
        </Button>

        {/* Announce Message */}
        <Button
          variant="primary"
          onClick={() => setShowAnnounceModal(true)}
          disabled={loading === 'announce'}
          className="flex items-center justify-center"
        >
          {loading === 'announce' ? (
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <MegaphoneIcon className="h-4 w-4 mr-2" />
          )}
          Announce
        </Button>

        {/* Kick Player */}
        <Button
          variant="secondary"
          onClick={() => setShowKickModal(true)}
          disabled={loading === 'kick_player'}
          className="flex items-center justify-center"
        >
          {loading === 'kick_player' ? (
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <UserXIcon className="h-4 w-4 mr-2" />
          )}
          Kick Player
        </Button>

        {/* Custom Command */}
        <Button
          variant="secondary"
          onClick={() => setShowCustomModal(true)}
          disabled={loading === 'custom'}
          className="flex items-center justify-center"
        >
          {loading === 'custom' ? (
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <TerminalIcon className="h-4 w-4 mr-2" />
          )}
          Custom Command
        </Button>
      </div>

      {/* Warning Note */}
      <div className="px-6 pb-6">
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 flex items-start">
          <AlertTriangleIcon className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-400">
            Commands are queued and executed by the server service. Check the command history below for execution status.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showAnnounceModal && (
        <AnnounceModal
          onClose={() => setShowAnnounceModal(false)}
          onSubmit={handleAnnounce}
        />
      )}

      {showKickModal && (
        <KickPlayerModal
          onClose={() => setShowKickModal(false)}
          onSubmit={handleKick}
        />
      )}

      {showCustomModal && (
        <CustomCommandModal
          onClose={() => setShowCustomModal(false)}
          onSubmit={handleCustomCommand}
        />
      )}
    </div>
  );
};

// Announce Modal Component
const AnnounceModal: React.FC<{
  onClose: () => void;
  onSubmit: (message: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [message, setMessage] = useState('');

  return (
    <Modal title="Send Announcement" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Announcement Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your announcement message..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(message)}
            disabled={!message.trim()}
          >
            Send Announcement
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Kick Player Modal Component
const KickPlayerModal: React.FC<{
  onClose: () => void;
  onSubmit: (playerName: string, reason?: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [playerName, setPlayerName] = useState('');
  const [reason, setReason] = useState('');

  return (
    <Modal title="Kick Player" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Player Name
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Reason (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter kick reason..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onSubmit(playerName, reason)}
            disabled={!playerName.trim()}
          >
            Kick Player
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Custom Command Modal Component
const CustomCommandModal: React.FC<{
  onClose: () => void;
  onSubmit: (command: string, description?: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [command, setCommand] = useState('');
  const [description, setDescription] = useState('');

  return (
    <Modal title="Custom RCON Command" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            RCON Command
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., info, status, shutdown..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this command does..."
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 flex items-start">
          <AlertTriangleIcon className="h-4 w-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-400">
            Be careful with custom commands. Incorrect commands may cause server issues.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onSubmit(command, description)}
            disabled={!command.trim()}
          >
            Execute Command
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Generic Modal Component
const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full">
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);
