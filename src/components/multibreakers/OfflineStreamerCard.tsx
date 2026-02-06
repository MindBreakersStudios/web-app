import { memo } from 'react';
import { X, ExternalLink } from 'lucide-react';

interface OfflineStreamerCardProps {
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  inGameName?: string | null;
  showCloseButton?: boolean;
  onClose?: () => void;
}

/**
 * OfflineStreamerCard - Card para streamers offline (sin iframe)
 * Muestra información básica y link al canal de Kick
 */
export const OfflineStreamerCard = memo(function OfflineStreamerCard({
  username,
  displayName,
  avatarUrl,
  inGameName,
  showCloseButton = true,
  onClose,
}: OfflineStreamerCardProps) {
  const kickUrl = `https://kick.com/${username}`;
  const defaultAvatar = '/images/logos/Logo-35.png'; // MindBreakers logo como fallback

  return (
    <div 
      className="relative w-full h-full group bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-gray-600 transition-all duration-200 opacity-60"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-gray-700">
          <img
            src={avatarUrl || defaultAvatar}
            alt={displayName || username}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
          />
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-white mb-2">
          {displayName || username}
        </h3>

        {/* In-game name */}
        {inGameName && (
          <p className="text-sm text-gray-400 mb-4">
            {inGameName}
          </p>
        )}

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/90 border border-gray-700 mb-4">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span className="text-sm text-gray-400 font-semibold uppercase">Offline</span>
        </div>

        {/* Link to Kick */}
        <a
          href={kickUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          <span>Ver en Kick.com</span>
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Helper text */}
        <p className="text-xs text-gray-500 mt-4">
          Este streamer no está transmitiendo actualmente
        </p>
      </div>

      {/* Close button */}
      {showCloseButton && onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800/90 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors z-10"
          title="Quitar"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Username badge (bottom left) */}
      <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-gray-800/90 backdrop-blur-sm">
        <span className="text-xs text-gray-400">@{username}</span>
      </div>
    </div>
  );
});
