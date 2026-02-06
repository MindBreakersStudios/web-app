import { memo } from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { KickChatProps } from './multiviewer';

/**
 * KickChat - Embebe el chat de un canal de Kick.com
 * Nota: Kick no tiene un embed oficial de chat separado,
 * pero podemos usar un iframe con la página del canal
 */
export const KickChat = memo(function KickChat({
  username,
  isVisible,
}: KickChatProps) {
  if (!isVisible || !username) {
    return null;
  }

  // Kick no tiene embed de chat oficial separado, usamos el popout
  const chatUrl = `https://kick.com/${username}/chatroom`;

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-lime-400" />
          <span className="font-medium text-white text-sm">Chat de {username}</span>
        </div>
        <a
          href={`https://kick.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Abrir en Kick.com"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Chat iframe */}
      <div className="flex-1 relative">
        <iframe
          src={chatUrl}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          scrolling="yes"
          title={`Chat de ${username}`}
        />
      </div>
    </div>
  );
});

/**
 * KickChatPlaceholder - Cuando no hay chat seleccionado
 */
export const KickChatPlaceholder = memo(function KickChatPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 border-l border-gray-700 p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-gray-600" />
      </div>
      <h3 className="text-white font-medium mb-2">Sin chat activo</h3>
      <p className="text-gray-400 text-sm max-w-xs">
        Haz click en el ícono de chat de cualquier stream para activar su chat aquí
      </p>
    </div>
  );
});
