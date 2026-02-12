import { useState, useMemo } from 'react';
import {
  Plus,
  X,
  MessageCircle,
  MessageCircleOff,
  Users,
  Radio,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { useWatchPartyViewer } from './useWatchPartyViewer';
import { KickPlayer } from './KickPlayer';
import { KickChat, KickChatPlaceholder } from './KickChat';
import { TwitchPlayer } from './TwitchPlayer';
import { TwitchChat, TwitchChatPlaceholder } from './TwitchChat';
import { OfflineStreamerCard } from './OfflineStreamerCard';
import { WatchPartyProps, ActiveGameStreamer } from './watchparty-types';
import { KickLoginButton } from '../KickLoginButton';

// =============================================================================
// Streamer Sidebar Component
// =============================================================================

interface StreamerSidebarProps {
  availableStreamers: ActiveGameStreamer[];
  allStreamers: { username: string }[];
  activeChatStreamer: string | null;
  canAddMore: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onAddStreamer: (username: string) => void;
  onRemoveStreamer: (username: string) => void;
  onSetActiveChat: (username: string) => void;
}

function StreamerSidebar({
  availableStreamers,
  allStreamers,
  activeChatStreamer,
  canAddMore,
  collapsed,
  onToggleCollapse,
  onAddStreamer,
  onRemoveStreamer,
  onSetActiveChat,
}: StreamerSidebarProps) {
  const [offlineExpanded, setOfflineExpanded] = useState(false);

  // Separate streamers: Live vs Offline (everyone not live)
  const liveStreamers = useMemo(
    () => availableStreamers.filter(s => s.isLive).sort((a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0)),
    [availableStreamers]
  );
  const offlineStreamers = useMemo(
    () => availableStreamers.filter(s => !s.isLive),
    [availableStreamers]
  );

  const isAdded = (username: string) =>
    allStreamers.some(s => s.username.toLowerCase() === username.toLowerCase());

  const handleClick = (streamer: ActiveGameStreamer) => {
    if (isAdded(streamer.username)) {
      onRemoveStreamer(streamer.username);
    } else if (canAddMore) {
      onAddStreamer(streamer.username);
    }
  };

  const handleChatClick = (e: React.MouseEvent, streamer: ActiveGameStreamer) => {
    e.stopPropagation();
    if (!isAdded(streamer.username) && canAddMore) {
      onAddStreamer(streamer.username);
    }
    onSetActiveChat(streamer.username);
  };

  // ------- Collapsed state: just icons -------
  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 bg-gray-800/60 border-r border-gray-700 flex flex-col items-center py-2 gap-1 overflow-y-auto">
        {/* Expand button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors mb-2"
          title="Expandir canales"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Live streamers icons */}
        {liveStreamers.map((s) => (
          <button
            key={s.steamId}
            onClick={() => handleClick(s)}
            className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${
              isAdded(s.username)
                ? 'border-green-500 ring-1 ring-green-500/30'
                : 'border-gray-600 hover:border-green-400'
            }`}
            title={`${s.displayName || s.username} — LIVE (${s.viewerCount?.toLocaleString() || 0})`}
          >
            {s.avatarUrl ? (
              <img src={s.avatarUrl} alt={s.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[10px] text-white font-bold">
                {(s.displayName || s.username).charAt(0).toUpperCase()}
              </div>
            )}
            {/* Live dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
          </button>
        ))}

        {/* Offline count */}
        {offlineStreamers.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div
              className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-[10px] text-gray-500 font-bold"
              title={`${offlineStreamers.length} offline`}
            >
              {offlineStreamers.length}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------- Expanded state: full list -------
  return (
    <div className="w-56 flex-shrink-0 bg-gray-800/60 border-r border-gray-700 flex flex-col overflow-hidden">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Canales
        </span>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="Colapsar"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {/* LIVE Section */}
        {liveStreamers.length > 0 && (
          <div className="py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-green-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live — {liveStreamers.length}
            </div>
            {liveStreamers.map((s) => {
              const added = isAdded(s.username);
              const chatActive = activeChatStreamer?.toLowerCase() === s.username.toLowerCase();
              return (
                <button
                  key={s.steamId}
                  onClick={() => handleClick(s)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors ${
                    added
                      ? 'bg-green-500/10 hover:bg-green-500/20'
                      : 'hover:bg-gray-700/50'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full overflow-hidden border-2 ${
                      added ? 'border-green-500' : 'border-gray-600'
                    }`}>
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt={s.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[9px] text-white font-bold">
                          {(s.displayName || s.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-[1.5px] border-gray-800" />
                  </div>

                  {/* Name & Viewers */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-medium truncate ${added ? 'text-green-300' : 'text-white'}`}>
                      {s.displayName || s.username}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Eye className="w-2.5 h-2.5" />
                      <span>{s.viewerCount?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {added ? (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={(e) => handleChatClick(e, s)}
                        className={`p-0.5 rounded transition-colors ${
                          chatActive ? 'bg-lime-400 text-black' : 'text-gray-500 hover:text-lime-400'
                        }`}
                        title="Chat"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveStreamer(s.username); }}
                        className="p-0.5 rounded text-gray-500 hover:text-red-400 transition-colors"
                        title="Quitar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : canAddMore ? (
                    <Plus className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {/* OFFLINE Section (Accordion) */}
        {offlineStreamers.length > 0 && (
          <div className="py-1 border-t border-gray-700/50">
            <button
              onClick={() => setOfflineExpanded(!offlineExpanded)}
              className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-700/30 transition-colors"
            >
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                Offline — {offlineStreamers.length}
              </span>
              {offlineExpanded ? (
                <ChevronUp className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              )}
            </button>
            {offlineExpanded && offlineStreamers.map((s) => {
              const added = isAdded(s.username);
              return (
                <button
                  key={s.steamId}
                  onClick={() => handleClick(s)}
                  disabled={!canAddMore && !added}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors opacity-60 ${
                    added ? 'bg-gray-700/20' : 'hover:bg-gray-700/30'
                  } ${!canAddMore && !added ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-gray-700">
                      {s.avatarUrl ? (
                        <img src={s.avatarUrl} alt={s.username} className="w-full h-full object-cover grayscale" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-[9px] text-gray-400 font-bold">
                          {(s.displayName || s.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 truncate">
                      {s.displayName || s.username}
                    </div>
                  </div>
                  {added && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveStreamer(s.username); }}
                      className="p-0.5 rounded text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {availableStreamers.length === 0 && (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-gray-500">No hay streamers registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// WatchParty Main Component
// =============================================================================

/**
 * WatchParty - Componente principal para ver múltiples streams
 *
 * Features:
 * - Grilla responsive con layouts auto-calculados
 * - Sidebar colapsable con lista de streamers (estilo Kick/Twitch)
 * - Chat integrado (uno activo a la vez)
 * - Agregar/quitar streams desde la sidebar
 */
export function WatchParty({
  activeServerStreamers = [],
  game,
  showServerStreamers = false,
  className = '',
}: WatchPartyProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    state,
    allStreamers,
    availableStreamers,
    addStreamer,
    removeStreamer,
    toggleChat,
    setActiveChatStreamer,
    canAddMore,
    streamerCount,
  } = useWatchPartyViewer({
    activeServerStreamers,
    game,
  });

  // Grid classes based on layout
  const gridClasses: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`bg-gray-900 overflow-hidden h-full flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-lime-400" />
              <h2 className="font-bold text-white">WatchParty</h2>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400 uppercase font-bold tracking-widest border border-lime-400/30">
                BETA
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-700/50 px-2 py-1 rounded text-xs">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">{streamerCount}/12</span>
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="flex items-center gap-2">
            <KickLoginButton variant="minimal" size="sm" showAvatar={true} />

            {/* Chat toggle */}
            <button
              onClick={toggleChat}
              className={`p-1.5 rounded-md transition-colors ${
                state.showChat
                  ? 'bg-lime-400 text-black'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
              title={state.showChat ? 'Ocultar chat' : 'Mostrar chat'}
            >
              {state.showChat ? <MessageCircle className="w-4 h-4" /> : <MessageCircleOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content: Sidebar + Grid + Chat */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar: Streamer list */}
        {showServerStreamers && (
          <StreamerSidebar
            availableStreamers={availableStreamers}
            allStreamers={allStreamers}
            activeChatStreamer={state.activeChatStreamer}
            canAddMore={canAddMore}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onAddStreamer={addStreamer}
            onRemoveStreamer={removeStreamer}
            onSetActiveChat={setActiveChatStreamer}
          />
        )}

        {/* Streams grid */}
        <div className="flex-1 overflow-hidden p-2">
          {allStreamers.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Radio className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sin streams activos</h3>
              <p className="text-gray-400 max-w-md">
                {showServerStreamers
                  ? 'Seleccioná streamers de la lista para empezar a ver'
                  : 'No hay streamers en vivo en el servidor actualmente'}
              </p>
            </div>
          ) : (
            /* Streams grid */
            <div className={`grid ${gridClasses[state.currentLayout.columns]} gap-2 h-full`}>
              {allStreamers.map((streamer) => {
                const isLive = streamer.isLive ?? false;
                const platform = streamer.platform || 'kick';

                return (
                  <div key={streamer.username} className="relative w-full h-full min-h-0">
                    {!isLive ? (
                      <OfflineStreamerCard
                        username={streamer.username}
                        displayName={streamer.displayName}
                        avatarUrl={streamer.avatarUrl}
                        inGameName={streamer.inGameName}
                        showCloseButton={true}
                        onClose={() => removeStreamer(streamer.username)}
                      />
                    ) : platform === 'twitch' ? (
                      <TwitchPlayer
                        channel={streamer.username}
                        showChat={false}
                        onReady={() => console.log(`Twitch player ready: ${streamer.username}`)}
                        onError={(err) => console.error(`Twitch player error:`, err)}
                      />
                    ) : (
                      <KickPlayer
                        username={streamer.username}
                        showCloseButton={true}
                        onClose={() => removeStreamer(streamer.username)}
                        onActivateChat={() => setActiveChatStreamer(streamer.username)}
                        isChatActive={
                          state.activeChatStreamer?.toLowerCase() === streamer.username.toLowerCase()
                        }
                        isLive={isLive}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat sidebar (right) */}
        {state.showChat && allStreamers.length > 0 && (
          <div className="w-80 min-w-[320px] border-l border-gray-700 flex-shrink-0">
            {state.activeChatStreamer ? (() => {
              // Find the active streamer's platform
              const activeStreamer = allStreamers.find(
                s => s.username.toLowerCase() === state.activeChatStreamer?.toLowerCase()
              );
              const platform = activeStreamer?.platform || 'kick';

              return platform === 'twitch' ? (
                <TwitchChat channel={state.activeChatStreamer} darkMode={true} />
              ) : (
                <KickChat username={state.activeChatStreamer} isVisible={true} />
              );
            })() : (
              <KickChatPlaceholder />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchParty;
