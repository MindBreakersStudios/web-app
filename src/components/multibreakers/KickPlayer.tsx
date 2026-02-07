import { memo, useState } from 'react';
import { X, MessageCircle, Volume2, VolumeX, Maximize2, ExternalLink } from 'lucide-react';
import { KickPlayerProps } from './multiviewer';

/**
 * KickPlayer - Embebe un stream individual de Kick.com
 * Usa el player oficial de Kick via iframe
 */
export const KickPlayer = memo(function KickPlayer({
  username,
  muted = true,
  showCloseButton = true,
  onClose,
  isPrimary = false,
  onActivateChat,
  isChatActive = false,
  isLive = true,
  onToggleMute,
}: KickPlayerProps) {
  // Estado local para mute individual (si no hay callback global)
  const [isLocalMuted, setIsLocalMuted] = useState(muted);
  const isMuted = onToggleMute ? muted : isLocalMuted;

  // Construir URL del player con parámetros
  const playerUrl = new URL(`https://player.kick.com/${username}`);
  playerUrl.searchParams.set('muted', isMuted ? 'true' : 'false');
  playerUrl.searchParams.set('autoplay', 'true');

  const handleToggleMute = () => {
    if (onToggleMute) {
      onToggleMute();
    } else {
      setIsLocalMuted(prev => !prev);
    }
  };

  const handleFullscreen = () => {
    const iframe = document.querySelector(`iframe[title="Kick stream: ${username}"]`) as HTMLIFrameElement;
    if (iframe?.requestFullscreen) {
      iframe.requestFullscreen();
    }
  };

  const kickChannelUrl = `https://kick.com/${username}`;

  return (
    <div 
      className={`
        relative w-full h-full group bg-black rounded-lg overflow-hidden
        border-2 transition-all duration-200
        ${isChatActive 
          ? 'border-lime-400 shadow-lg shadow-lime-400/20' 
          : 'border-gray-700 hover:border-gray-600'
        }
        ${isPrimary ? 'col-span-2 row-span-2' : ''}
      `}
    >
      {/* Player iframe */}
      <iframe
        src={playerUrl.toString()}
        className="w-full h-full absolute inset-0"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
        title={`Kick stream: ${username}`}
      />

      {/* Overlay con controles - visible en hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
      
      {/* NOT LIVE badge - subtle indicator at bottom-left, no blocking overlay */}
      {!isLive && (
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-lime-400/30">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            <span className="text-lime-400 font-medium uppercase text-[10px] tracking-wider">En servidor</span>
          </div>
        </div>
      )}
      
      {/* Header con nombre y controles */}
      <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
        {/* Username badge */}
        <a
          href={kickChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md hover:bg-black/90 transition-colors pointer-events-auto"
        >
          {isLive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          <span className="text-white font-medium text-sm">{username}</span>
        </a>

        {/* Control buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Mute/Unmute button */}
          <button
            onClick={handleToggleMute}
            className="p-2 bg-black/80 backdrop-blur-sm rounded-md text-white hover:bg-black/90 transition-colors"
            title={isMuted ? 'Activar audio' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            className="p-2 bg-black/80 backdrop-blur-sm rounded-md text-white hover:bg-black/90 transition-colors"
            title="Pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Open in Kick button */}
          <a
            href={kickChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-black/80 backdrop-blur-sm rounded-md text-white hover:bg-black/90 transition-colors"
            title="Abrir en Kick.com"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Chat toggle button */}
          {onActivateChat && isLive && (
            <button
              onClick={onActivateChat}
              className={`
                p-2 rounded-md transition-colors
                ${isChatActive 
                  ? 'bg-lime-400 text-black' 
                  : 'bg-black/80 backdrop-blur-sm text-white hover:bg-black/90'
                }
              `}
              title={isChatActive ? 'Chat activo' : 'Activar chat'}
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-black/80 backdrop-blur-sm rounded-md text-white hover:bg-red-500/80 transition-colors"
              title="Quitar stream"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Footer con indicador de chat activo */}
      {isChatActive && (
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <div className="flex items-center justify-center gap-2 bg-lime-400/90 backdrop-blur-sm px-3 py-1 rounded-md">
            <MessageCircle className="w-3 h-3 text-black" />
            <span className="text-black text-xs font-medium">Chat activo</span>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * KickPlayerSkeleton - Placeholder mientras carga
 */
export const KickPlayerSkeleton = memo(function KickPlayerSkeleton() {
  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 animate-pulse">
      <div className="aspect-video flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gray-700" />
      </div>
    </div>
  );
});
