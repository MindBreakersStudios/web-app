/**
 * TwitchChat Component
 * ====================
 *
 * Componente para embeber chat de Twitch.
 * Utiliza el iframe de Twitch Chat Embed.
 *
 * Docs: https://dev.twitch.tv/docs/embed/chat
 */

import { useEffect, useState } from 'react';
import { MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';

interface TwitchChatProps {
  /** Twitch channel name */
  channel: string;
  /** Dark mode theme (default: true) */
  darkMode?: boolean;
  /** Custom height */
  height?: string;
}

export function TwitchChat({
  channel,
  darkMode = true,
  height = '100%'
}: TwitchChatProps) {
  const [error, setError] = useState<string | null>(null);

  // Build Twitch chat embed URL
  // https://www.twitch.tv/embed/{channel}/chat?parent={domain}
  const parentDomains = [
    window.location.hostname,
    'localhost',
    'mindbreakers.gg',
    '127.0.0.1'
  ];

  // Twitch requires parent param for embedding
  const chatUrl = new URL(`https://www.twitch.tv/embed/${channel}/chat`);
  parentDomains.forEach(domain => chatUrl.searchParams.append('parent', domain));

  if (darkMode) {
    chatUrl.searchParams.set('darkpopout', 'true');
  }

  useEffect(() => {
    // Reset error when channel changes
    setError(null);
  }, [channel]);

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-sm text-gray-400 mb-4">{error}</p>
        <a
          href={`https://www.twitch.tv/popout/${channel}/chat`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open chat in new window
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <iframe
        src={chatUrl.toString()}
        width="100%"
        height={height}
        className="border-0 bg-gray-900"
        title={`${channel} Twitch Chat`}
        onError={() => setError('Failed to load Twitch chat')}
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
      />
    </div>
  );
}

/**
 * TwitchChatPlaceholder
 * =====================
 * Shown when no chat is available or user hasn't selected a channel
 */

interface TwitchChatPlaceholderProps {
  message?: string;
  channel?: string;
}

export function TwitchChatPlaceholder({
  message = 'No chat selected',
  channel
}: TwitchChatPlaceholderProps) {
  return (
    <div className="w-full h-full bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-purple-600/10 rounded-full flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-purple-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {message}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {channel
          ? `Chat for ${channel} will appear here`
          : 'Select a streamer to view their chat'}
      </p>
      {channel && (
        <a
          href={`https://www.twitch.tv/popout/${channel}/chat`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Open chat in popup
        </a>
      )}
    </div>
  );
}

/**
 * TwitchChatButton
 * ================
 * Button to toggle Twitch chat visibility or open in popup
 */

interface TwitchChatButtonProps {
  channel: string;
  onClick?: () => void;
  variant?: 'toggle' | 'popup';
  isActive?: boolean;
}

export function TwitchChatButton({
  channel,
  onClick,
  variant = 'toggle',
  isActive = false
}: TwitchChatButtonProps) {
  if (variant === 'popup') {
    return (
      <a
        href={`https://www.twitch.tv/popout/${channel}/chat`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-gray-800 hover:bg-purple-600 text-gray-400 hover:text-white transition-colors"
        title="Open chat in new window"
      >
        <ExternalLink className="w-5 h-5" />
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 hover:bg-purple-600 text-gray-400 hover:text-white'
      }`}
      title={isActive ? 'Hide chat' : 'Show chat'}
    >
      <MessageCircle className="w-5 h-5" />
    </button>
  );
}
