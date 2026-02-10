import { memo, useState, FormEvent } from 'react';
import { MessageCircle, ExternalLink, Send, Loader2 } from 'lucide-react';
import { KickChatProps } from './watchparty-types';
import { useKickAuth, sendKickChatMessage } from '../../hooks/useKickAuth';
import { KickLoginButton } from '../KickLoginButton';

/**
 * KickChat - Embebe el chat de un canal de Kick.com con input para enviar mensajes
 */
export const KickChat = memo(function KickChat({
  username,
  isVisible,
}: KickChatProps) {
  const { isConnected, user } = useKickAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (!isVisible || !username) {
    return null;
  }

  // Kick no tiene embed de chat oficial separado, usamos el popout
  const chatUrl = `https://kick.com/${username}/chatroom`;

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user || !isConnected) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      // TODO: Obtener channel_id real del streamer
      // Por ahora usamos el username como channel_id
      const success = await sendKickChatMessage({
        kick_user_id: user.id,
        channel_id: username,
        message: message.trim(),
      });

      if (success) {
        setMessage('');
      } else {
        setSendError('Error al enviar mensaje');
      }
    } catch (err) {
      console.error('[KickChat] Send error:', err);
      setSendError(err instanceof Error ? err.message : 'Error al enviar mensaje');
    } finally {
      setIsSending(false);
    }
  };

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

      {/* Chat iframe - oversized to push Kick's built-in input/login out of view */}
      <div className="flex-1 relative min-h-0 overflow-hidden">
        <iframe
          src={chatUrl}
          className="absolute inset-0 w-full h-[calc(100%+120px)]"
          frameBorder="0"
          scrolling="yes"
          title={`Chat de ${username}`}
        />
        {/* Click-blocking overlay: prevents interaction with Kick's hidden input area */}
        <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-auto z-10" />
        {/* Gradient fade at the bottom edge for a clean transition to our input */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent z-20 pointer-events-none" />
      </div>

      {/* Message input area */}
      <div className="border-t border-gray-700 bg-gray-800 p-3">
        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-3">
              Conecta tu cuenta de Kick para chatear
            </p>
            <KickLoginButton
              variant="primary"
              size="sm"
              loginText="Conectar con Kick"
              showAvatar={false}
            />
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-2">
            <div className="flex items-center gap-2">
              {/* User avatar */}
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border border-lime-400"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-lime-400/20 border border-lime-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-lime-400 font-bold text-xs">
                    {user?.username[0].toUpperCase()}
                  </span>
                </div>
              )}

              {/* Message input */}
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                disabled={isSending}
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-50"
                maxLength={500}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className="p-2 rounded-lg bg-lime-400 text-black hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Enviar mensaje"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Error message */}
            {sendError && (
              <p className="text-red-400 text-xs">
                {sendError}
              </p>
            )}
          </form>
        )}
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
