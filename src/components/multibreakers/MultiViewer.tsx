import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  X,
  Grid2X2,
  Grid3X3,
  Maximize2,
  MessageCircle,
  MessageCircleOff,
  Share2,
  Trash2,
  Volume2,
  VolumeX,
  Users,
  Radio,
  Copy,
  Check,
  LayoutGrid,
} from 'lucide-react';
import { useMultiViewer } from './useMultiViewer';
import { KickPlayer } from './KickPlayer';
import { KickChat, KickChatPlaceholder } from './KickChat';
import { OfflineStreamerCard } from './OfflineStreamerCard';
import { WatchPartyProps, GRID_LAYOUTS, ActiveGameStreamer } from './multiviewer';
import { useTranslation } from '../../hooks/useTranslation';
import { KickLoginButton } from '../KickLoginButton';

/**
 * WatchParty - Componente principal para ver múltiples streams de Kick
 * 
 * Features:
 * - Grilla responsive con layouts configurables (1x1, 2x2, 3x3, 4x4)
 * - Agregar/quitar streams manualmente
 * - Chat integrado (uno activo a la vez)
 * - URLs compartibles
 * - Preparado para integración con API de streamers activos del servidor
 */
export function WatchParty({
  initialStreamers = [],
  activeServerStreamers = [],
  game,
  onStreamersChange,
  showServerStreamers = false,
  maxHeight = '80vh',
  className = '',
}: WatchPartyProps) {
  const t = useTranslation();

  const {
    state,
    allStreamers,
    availableStreamers,
    addStreamer,
    removeStreamer,
    clearAllStreamers,
    setLayout,
    toggleChat,
    setActiveChatStreamer,
    toggleMute,
    toggleMuteForStreamer,
    isStreamerMuted,
    canAddMore,
    streamerCount,
  } = useMultiViewer({
    activeServerStreamers,
    game,
  });

  // Grid classes based on layout
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`bg-gray-900 overflow-hidden h-full flex flex-col ${className}`}>
      {/* Available streamers section - MOVED TO TOP */}
      {showServerStreamers && availableStreamers.length > 0 && (
        <div className="border-b border-gray-700 px-4 py-3 bg-gray-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">
              Streamers disponibles ({availableStreamers.filter(s => s.isOnlineInGame).length} en vivo)
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableStreamers.map((streamer) => {
              const isAdded = allStreamers.some(s => s.username === streamer.username);
              const isLive = streamer.isLive ?? false;
              const isOnline = streamer.isOnlineInGame;
              const isOffline = !isOnline;
              const isChatActive = state.activeChatStreamer === streamer.username;
              
              const handleClick = () => {
                if (isAdded) {
                  // Toggle: remove if already added
                  removeStreamer(streamer.username);
                } else if (canAddMore) {
                  // Add if not added and can add more (permitir agregar offline también)
                  addStreamer(streamer.username);
                }
              };

              const handleChatClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                if (isAdded) {
                  setActiveChatStreamer(streamer.username);
                }
              };
              
              return (
                <button
                  key={streamer.steamId}
                  onClick={handleClick}
                  disabled={!canAddMore && !isAdded}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${isAdded
                      ? isLive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 cursor-pointer'
                        : isOnline
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 cursor-pointer'
                          : 'bg-gray-700/20 text-gray-400 hover:bg-gray-700/30 border border-gray-600/30 cursor-pointer opacity-50'
                      : isLive
                        ? canAddMore
                          ? 'bg-gray-700 text-white hover:bg-gray-600 border border-green-500/50'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-700'
                        : isOnline
                          ? canAddMore
                            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-blue-500/50'
                            : 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-700'
                          : canAddMore
                            ? 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 border border-gray-700/50 opacity-50'
                            : 'bg-gray-800/50 text-gray-500 cursor-not-allowed border border-gray-700/50 opacity-40'
                    }
                  `}
                >
                  {/* Status indicator */}
                  {isLive ? (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  ) : isOnline ? (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-gray-600" />
                  )}
                  
                  <span className={isOffline ? 'opacity-75' : ''}>{streamer.displayName || streamer.username}</span>
                  
                  {/* Viewer count (solo si está LIVE) */}
                  {streamer.viewerCount !== undefined && isLive && (
                    <span className="text-xs text-gray-400">
                      ({streamer.viewerCount.toLocaleString()} viewers)
                    </span>
                  )}
                  
                  {/* Status badges */}
                  {isLive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 uppercase font-semibold border border-green-500/30">
                      Live
                    </span>
                  )}
                  {!isLive && isOnline && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 uppercase font-semibold border border-blue-500/30">
                      In-Game
                    </span>
                  )}
                  {isOffline && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 uppercase font-semibold">
                      Offline
                    </span>
                  )}
                  
                  {/* Add icon (solo si no está agregado y puede agregar más) */}
                  {!isAdded && canAddMore && <Plus className="w-3 h-3" />}
                  
                  {/* Controls para streamers agregados */}
                  {isAdded && (
                    <div className="flex items-center gap-1">
                      {isLive && (
                        <button
                          onClick={handleChatClick}
                          className={`p-0.5 rounded transition-colors ${
                            isChatActive 
                              ? 'bg-green-400 text-black' 
                              : 'hover:bg-green-400/20'
                          }`}
                          title="Ver chat"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </button>
                      )}
                      <X className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header / Toolbar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Title and streamer count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-lime-400" />
              <h2 className="font-bold text-white">WatchParty</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-700/50 px-2 py-1 rounded text-xs">
              <Users className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">{streamerCount}/12</span>
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="flex items-center gap-2">
            {/* Kick Login Button */}
            <KickLoginButton
              variant="minimal"
              size="sm"
              showAvatar={true}
            />

            {/* Chat toggle */}
            <button
              onClick={toggleChat}
              className={`
                p-1.5 rounded-md transition-colors
                ${state.showChat
                  ? 'bg-lime-400 text-black'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
                }
              `}
              title={state.showChat ? 'Ocultar chat' : 'Mostrar chat'}
            >
              {state.showChat ? <MessageCircle className="w-4 h-4" /> : <MessageCircleOff className="w-4 h-4" />}
            </button>

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              className={`
                p-1.5 rounded-md transition-colors
                ${state.isMuted
                  ? 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'bg-blue-500 text-white'
                }
              `}
              title={state.isMuted ? 'Activar audio' : 'Silenciar'}
            >
              {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Streams grid */}
        <div className={`flex-1 overflow-hidden p-2 ${state.showChat && state.activeChatStreamer ? 'w-2/3' : 'w-full'}`}>
          {allStreamers.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                <Radio className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sin streams activos</h3>
              <p className="text-gray-400 max-w-md">
                {showServerStreamers 
                  ? 'No hay streamers en vivo en el servidor actualmente'
                  : 'Selecciona streamers de la lista para comenzar a ver'}
              </p>
            </div>
          ) : (
            /* Streams grid - Fixed height, no scroll */
            <div className={`grid ${gridClasses[state.currentLayout.columns]} gap-2 h-full`}>
              {allStreamers.map((streamer) => {
                const isLive = streamer.isLive ?? false;
                const isOnline = streamer.isOnlineInGame ?? false;
                const isOffline = !isOnline;

                return (
                  <div key={streamer.username} className="relative w-full h-full min-h-0">
                    {isOffline ? (
                      /* Offline card - sin iframe */
                      <OfflineStreamerCard
                        username={streamer.username}
                        displayName={streamer.displayName}
                        avatarUrl={streamer.avatarUrl}
                        inGameName={streamer.inGameName}
                        showCloseButton={true}
                        onClose={() => removeStreamer(streamer.username)}
                      />
                    ) : (
                      /* KickPlayer - con iframe */
                      <KickPlayer
                        username={streamer.username}
                        muted={isStreamerMuted(streamer.username)}
                        showCloseButton={true}
                        onClose={() => removeStreamer(streamer.username)}
                        onActivateChat={() => setActiveChatStreamer(streamer.username)}
                        isChatActive={state.activeChatStreamer === streamer.username}
                        isLive={isLive}
                        onToggleMute={() => toggleMuteForStreamer(streamer.username)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat sidebar */}
        {state.showChat && allStreamers.length > 0 && (
          <div className="w-80 min-w-[320px] border-l border-gray-700">
            {state.activeChatStreamer ? (
              <KickChat
                username={state.activeChatStreamer}
                isVisible={true}
              />
            ) : (
              <KickChatPlaceholder />
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default MultiViewer;
