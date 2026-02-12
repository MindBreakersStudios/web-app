/**
 * TwitchPlayer Component
 * ======================
 *
 * Componente para embeber streams de Twitch usando el Twitch Embed SDK.
 * Similar a KickPlayer pero adaptado a la API de Twitch.
 *
 * Docs: https://dev.twitch.tv/docs/embed
 */

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface TwitchPlayerProps {
  /** Twitch username (channel name) */
  channel: string;
  /** Whether to show chat alongside player */
  showChat?: boolean;
  /** Callback when player is ready */
  onReady?: () => void;
  /** Callback when player fails to load */
  onError?: (error: Error) => void;
}

// Twitch Embed SDK types
interface TwitchEmbedOptions {
  width: string | number;
  height: string | number;
  channel: string;
  layout?: 'video' | 'video-with-chat';
  parent: string[];
  autoplay?: boolean;
  muted?: boolean;
}

interface TwitchEmbedPlayer {
  play: () => void;
  pause: () => void;
  setChannel: (channel: string) => void;
  getChannel: () => string;
  getMuted: () => boolean;
  setMuted: (muted: boolean) => void;
  getVolume: () => number;
  setVolume: (volume: number) => void;
}

interface TwitchEmbed {
  Embed: new (elementId: string, options: TwitchEmbedOptions) => {
    getPlayer: () => TwitchEmbedPlayer;
  };
}

declare global {
  interface Window {
    Twitch?: TwitchEmbed;
  }
}

export function TwitchPlayer({
  channel,
  showChat = false,
  onReady,
  onError
}: TwitchPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // =========================================================================
  // Load Twitch Embed SDK
  // =========================================================================
  useEffect(() => {
    // Check if SDK is already loaded
    if (window.Twitch) {
      setSdkLoaded(true);
      return;
    }

    // Load SDK script
    const script = document.createElement('script');
    script.src = 'https://embed.twitch.tv/embed/v1.js';
    script.async = true;

    script.onload = () => {
      console.log('[TwitchPlayer] SDK loaded');
      setSdkLoaded(true);
    };

    script.onerror = () => {
      const err = new Error('Failed to load Twitch Embed SDK');
      console.error('[TwitchPlayer]', err);
      setError(err.message);
      onError?.(err);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove script as it's shared across instances
      // script.remove();
    };
  }, [onError]);

  // =========================================================================
  // Initialize Twitch Embed
  // =========================================================================
  useEffect(() => {
    if (!sdkLoaded || !containerRef.current || !window.Twitch) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get parent domains for embedding (required by Twitch)
      const parentDomains = [
        window.location.hostname,
        'localhost',
        'mindbreakers.gg',
        '127.0.0.1'
      ];

      // Create unique ID for this player instance
      const playerId = `twitch-embed-${channel}-${Date.now()}`;

      // Create container div for Twitch embed
      const embedContainer = document.createElement('div');
      embedContainer.id = playerId;
      embedContainer.className = 'w-full h-full';

      // Clear and append
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(embedContainer);

      // Initialize Twitch Embed
      const embed = new window.Twitch.Embed(playerId, {
        width: '100%',
        height: '100%',
        channel: channel,
        layout: showChat ? 'video-with-chat' : 'video',
        parent: parentDomains,
        autoplay: true,
        muted: false,
      });

      embedRef.current = embed;

      // Wait a bit for embed to initialize
      setTimeout(() => {
        setIsLoading(false);
        onReady?.();
      }, 1000);

      console.log(`[TwitchPlayer] Initialized for channel: ${channel}`);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error initializing Twitch player');
      console.error('[TwitchPlayer] Error:', error);
      setError(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  }, [sdkLoaded, channel, showChat, onReady, onError]);

  // =========================================================================
  // Handle channel changes
  // =========================================================================
  useEffect(() => {
    if (!embedRef.current) return;

    try {
      const player = embedRef.current.getPlayer();
      if (player && player.getChannel() !== channel) {
        console.log(`[TwitchPlayer] Switching channel to: ${channel}`);
        player.setChannel(channel);
      }
    } catch (err) {
      console.error('[TwitchPlayer] Error changing channel:', err);
    }
  }, [channel]);

  // =========================================================================
  // Render
  // =========================================================================

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Error Loading Twitch Stream
        </h3>
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <a
          href={`https://www.twitch.tv/${channel}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Watch on Twitch
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading Twitch stream...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

/**
 * TwitchPlayerPlaceholder
 * =======================
 * Shown when no Twitch stream is available
 */

interface TwitchPlayerPlaceholderProps {
  channel?: string;
  message?: string;
}

export function TwitchPlayerPlaceholder({
  channel,
  message = 'Stream is offline'
}: TwitchPlayerPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-gray-900 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {message}
      </h3>
      {channel && (
        <>
          <p className="text-sm text-gray-400 mb-6">
            Channel: <span className="text-purple-400 font-medium">{channel}</span>
          </p>
          <a
            href={`https://www.twitch.tv/${channel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
            </svg>
            Watch on Twitch
          </a>
        </>
      )}
    </div>
  );
}
