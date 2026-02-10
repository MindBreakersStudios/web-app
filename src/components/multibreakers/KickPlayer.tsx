import { memo, useState, useRef, useEffect } from 'react';
import { X, MessageCircle, Volume2, VolumeX, Volume1, Maximize2, ExternalLink } from 'lucide-react';
import { KickPlayerProps } from './watchparty-types';

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

  // Volume slider state
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(80);
  const [prevVolume, setPrevVolume] = useState(80);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Construir URL del player con parámetros
  const playerUrl = new URL(`https://player.kick.com/${username}`);
  playerUrl.searchParams.set('muted', isMuted ? 'true' : 'false');
  playerUrl.searchParams.set('autoplay', 'true');

  const handleToggleMute = () => {
    if (isMuted) {
      // Unmute: restore previous volume
      setVolume(prevVolume > 0 ? prevVolume : 80);
    } else {
      // Mute: save current volume
      setPrevVolume(volume);
      setVolume(0);
    }
    if (onToggleMute) {
      onToggleMute();
    } else {
      setIsLocalMuted(prev => !prev);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume === 0 && !isMuted) {
      setPrevVolume(prevVolume > 0 ? prevVolume : 80);
      if (onToggleMute) onToggleMute();
      else setIsLocalMuted(true);
    } else if (newVolume > 0 && isMuted) {
      if (onToggleMute) onToggleMute();
      else setIsLocalMuted(false);
    }
  };

  const handleVolumeMouseEnter = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    setShowVolumeSlider(true);
  };

  const handleVolumeMouseLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => setShowVolumeSlider(false), 300);
  };

  useEffect(() => {
    return () => { if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current); };
  }, []);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

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
      {/* Player iframe — oversized to hide Kick's built-in controls at bottom */}
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          src={playerUrl.toString()}
          className="absolute inset-0 w-full h-[calc(100%+44px)]"
          frameBorder="0"
          scrolling="no"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          title={`Kick stream: ${username}`}
        />
      </div>

      {/* Overlay con controles - visible en hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

      {/* Header con nombre y controles */}
      <div className="absolute top-0 left-0 right-0 p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
        {/* Username badge */}
        <a
          href={kickChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-md hover:bg-black/90 transition-colors pointer-events-auto"
        >
          {isLive && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
          <span className="text-white font-medium text-sm">{username}</span>
        </a>

        {/* Control buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Volume control with slider */}
          <div
            className="relative flex items-center"
            onMouseEnter={handleVolumeMouseEnter}
            onMouseLeave={handleVolumeMouseLeave}
          >
            {/* Volume slider (appears on hover) */}
            {showVolumeSlider && (
              <div className="absolute right-full mr-1 flex items-center bg-black/90 backdrop-blur-sm rounded-md px-2 py-1.5">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 accent-lime-400 cursor-pointer"
                  title={`Volumen: ${isMuted ? 0 : volume}%`}
                />
              </div>
            )}
            <button
              onClick={handleToggleMute}
              className="p-2 bg-black/80 backdrop-blur-sm rounded-md text-white hover:bg-black/90 transition-colors"
              title={isMuted ? 'Activar audio' : 'Silenciar'}
            >
              <VolumeIcon className="w-4 h-4" />
            </button>
          </div>

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

      {/* Small chat active indicator (bottom-right dot) */}
      {isChatActive && (
        <div className="absolute bottom-1.5 right-1.5 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1 bg-lime-400/90 backdrop-blur-sm px-2 py-0.5 rounded">
            <MessageCircle className="w-2.5 h-2.5 text-black" />
            <span className="text-black text-[10px] font-medium">Chat</span>
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
