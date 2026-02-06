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
import { MultiViewerProps, GRID_LAYOUTS, ActiveGameStreamer } from './multiviewer';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * MultiViewer - Componente principal para ver múltiples streams de Kick
 * 
 * Features:
 * - Grilla responsive con layouts configurables (1x1, 2x2, 3x3, 4x4)
 * - Agregar/quitar streams manualmente
 * - Chat integrado (uno activo a la vez)
 * - URLs compartibles
 * - Preparado para integración con API de streamers activos del servidor
 */
export function MultiViewer({
  initialStreamers = [],
  activeServerStreamers = [],
  game,
  onStreamersChange,
  showServerStreamers = false,
  maxHeight = '80vh',
  className = '',
}: MultiViewerProps) {
  const t = useTranslation();

  const {
    state,
    allStreamers,
    addStreamer,
    removeStreamer,
    clearAllStreamers,
    setLayout,
    toggleChat,
    setActiveChatStreamer,
    toggleMute,
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
    <div className={`bg-gray-900 rounded-xl border border-gray-700 overflow-hidden ${className}`}>
      {/* Header / Toolbar */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left side: Title and streamer count */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-lime-400" />
              <h2 className="font-bold text-white text-lg">MultiViewer</h2>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-700/50 px-2.5 py-1 rounded-md">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{streamerCount}/12</span>
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layout selector */}
            <div className="flex items-center bg-gray-700/50 rounded-md p-1">
              {GRID_LAYOUTS.map((layout) => (
                <button
                  key={layout.columns}
                  onClick={() => setLayout(layout)}
                  className={`
                    px-2.5 py-1.5 rounded text-sm font-medium transition-colors
                    ${state.currentLayout.columns === layout.columns
                      ? 'bg-lime-400 text-black'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600'
                    }
                  `}
                  title={`Layout ${layout.label}`}
                >
                  {layout.columns === 1 && <Maximize2 className="w-4 h-4" />}
                  {layout.columns === 2 && <Grid2X2 className="w-4 h-4" />}
                  {layout.columns === 3 && <Grid3X3 className="w-4 h-4" />}
                  {layout.columns === 4 && <LayoutGrid className="w-4 h-4" />}
                </button>
              ))}
            </div>

            {/* Chat toggle */}
            <button
              onClick={toggleChat}
              className={`
                p-2 rounded-md transition-colors
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
                p-2 rounded-md transition-colors
                ${state.isMuted
                  ? 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600'
                  : 'bg-blue-500 text-white'
                }
              `}
              title={state.isMuted ? 'Activar audio' : 'Silenciar'}
            >
              {state.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Clear all */}
            {streamerCount > 0 && (
              <button
                onClick={clearAllStreamers}
                className="p-2 rounded-md bg-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Limpiar todo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex" style={{ maxHeight }}>
        {/* Streams grid */}
        <div className={`flex-1 overflow-auto p-4 ${state.showChat && state.activeChatStreamer ? 'w-2/3' : 'w-full'}`}>
          {allStreamers.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
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
            /* Streams grid */
            <div className={`grid ${gridClasses[state.currentLayout.columns]} gap-4`}>
              {allStreamers.map((streamer) => (
                <div key={streamer.username} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <div className="absolute inset-0">
                    <KickPlayer
                      username={streamer.username}
                      muted={state.isMuted}
                      showCloseButton={true}
                      onClose={() => removeStreamer(streamer.username)}
                      onActivateChat={() => setActiveChatStreamer(streamer.username)}
                      isChatActive={state.activeChatStreamer === streamer.username}
                    />
                  </div>
                </div>
              ))}
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

      {/* Server streamers section (for future API integration) */}
      {showServerStreamers && activeServerStreamers.length > 0 && (
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-white">
              Streamers en el servidor ({activeServerStreamers.filter(s => s.isOnlineInGame).length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeServerStreamers
              .filter(s => s.isOnlineInGame)
              .map((streamer) => {
                const isAdded = allStreamers.some(s => s.username === streamer.username);
                return (
                  <button
                    key={streamer.steamId}
                    onClick={() => !isAdded && addStreamer(streamer.username)}
                    disabled={isAdded || !canAddMore}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                      ${isAdded
                        ? 'bg-lime-400/20 text-lime-400 cursor-default'
                        : canAddMore
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>{streamer.displayName || streamer.username}</span>
                    {streamer.inGameName && (
                      <span className="text-xs text-gray-400">({streamer.inGameName})</span>
                    )}
                    {!isAdded && canAddMore && <Plus className="w-3 h-3" />}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

export default MultiViewer;
