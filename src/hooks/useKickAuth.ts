/**
 * useKickAuth Hook
 * ================
 * 
 * Hook para manejar autenticación OAuth de Kick.
 * Permite a los usuarios conectar su cuenta de Kick para enviar mensajes al chat.
 * 
 * Uso:
 *   const { isConnected, user, login, logout, isLoading } = useKickAuth();
 */

import { useState, useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface KickUser {
  id: string;
  username: string;
  profile_picture: string | null;
}

interface KickAuthState {
  kick_user_id: string;
  kick_username: string;
  profile_picture: string | null;
}

interface UseKickAuthReturn {
  isConnected: boolean;
  user: KickUser | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'kick_auth_state';
const EDGE_FUNCTION_BASE = 'https://flwgrttppsnsfmigblvz.supabase.co/functions/v1';

// =============================================================================
// Hook
// =============================================================================

export function useKickAuth(): UseKickAuthReturn {
  const [user, setUser] = useState<KickUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // Load user from localStorage on mount
  // =========================================================================
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: KickAuthState = JSON.parse(stored);
        setUser({
          id: parsed.kick_user_id,
          username: parsed.kick_username,
          profile_picture: parsed.profile_picture,
        });
      } catch (err) {
        console.error('[useKickAuth] Error parsing stored state:', err);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // =========================================================================
  // Login - Iniciar flujo OAuth
  // =========================================================================
  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 1. Llamar a Edge Function para obtener auth_url
      const response = await fetch(`${EDGE_FUNCTION_BASE}/kick-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.auth_url || !data.state || !data.code_verifier) {
        throw new Error('Invalid response from kick-auth endpoint');
      }

      // 2. Guardar state y code_verifier en sessionStorage
      sessionStorage.setItem('kick_oauth_state', data.state);
      sessionStorage.setItem('kick_oauth_code_verifier', data.code_verifier);

      // 3. Redirigir a Kick para autorización
      window.location.href = data.auth_url;
    } catch (err) {
      console.error('[useKickAuth] Login error:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Kick');
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // Logout - Limpiar estado
  // =========================================================================
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem('kick_oauth_state');
    sessionStorage.removeItem('kick_oauth_code_verifier');
  }, []);

  return {
    isConnected: !!user,
    user,
    login,
    logout,
    isLoading,
    error,
  };
}

// =============================================================================
// Helper: Save user to localStorage
// =============================================================================

export function saveKickUser(user: KickUser): void {
  const state: KickAuthState = {
    kick_user_id: user.id,
    kick_username: user.username,
    profile_picture: user.profile_picture,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// =============================================================================
// Helper: Send chat message
// =============================================================================

export interface SendChatMessageParams {
  kick_user_id: string;
  channel_id: string;
  message: string;
}

export async function sendKickChatMessage(params: SendChatMessageParams): Promise<boolean> {
  try {
    const response = await fetch(`${EDGE_FUNCTION_BASE}/kick-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.success === true;
  } catch (err) {
    console.error('[sendKickChatMessage] Error:', err);
    throw err;
  }
}
