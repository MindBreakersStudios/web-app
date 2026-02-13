import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { authAPI, steamAPI, setGlobalSession as setApiGlobalSession } from './api'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  apiUserData: any | null
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: string }>
  signInWithDiscord: () => Promise<{ error?: string }>
  signInWithSteam: () => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiUserData, setApiUserData] = useState<any | null>(null)
  const [, setRetryCount] = useState(0)
  const [initTimeout, setInitTimeout] = useState<NodeJS.Timeout | null>(null)

  // Handle successful login - sync with API
  const handleSuccessfulLogin = async (session: Session, retryAttempt = 0) => {
    console.log('[AUTH] Starting API sync for user:', session.user.email, `(attempt ${retryAttempt + 1})`);
    
    try {
      // Sync user with backend API
      console.log('[AUTH] Calling syncUser...');
      const userData = await authAPI.syncUser();
      setApiUserData(userData);
      console.log('[AUTH] User synced to local database:', userData);
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error('[AUTH] Failed to sync user with API:', error);
      console.error('[AUTH] Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Retry logic for API failures
      if (retryAttempt < 2) {
        console.log(`[AUTH] Retrying API sync in 2 seconds... (attempt ${retryAttempt + 2})`);
        setRetryCount(retryAttempt + 1);
        setTimeout(() => {
          handleSuccessfulLogin(session, retryAttempt + 1);
        }, 2000);
        return;
      }
      
      // Don't prevent login if API sync fails
      setApiUserData(null);
    }
  };

  useEffect(() => {
    console.log('[AUTH] Initializing auth context...');
    
    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('[AUTH] Auth initialization taking too long, forcing completion...');
      setLoading(false);
    }, 5000); // 5 second timeout
    
    setInitTimeout(timeout);
    
    const initializeAuth = async () => {
      try {
        // Check if Supabase is properly configured
        if (!supabase || !supabase.auth) {
          console.warn('[AUTH] Supabase not configured - running without authentication features');
          setLoading(false);
          return;
        }

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Error getting initial session:', error);
          
          // Check if it's a corrupted session issue
          if (error.message.includes('Invalid') || error.message.includes('expired')) {
            console.log('[AUTH] Detected corrupted/expired session, clearing auth state...');
            try {
              await supabase.auth.signOut();
              localStorage.clear();
              console.log('[AUTH] Auth state cleared, page will reload...');
              window.location.reload();
              return;
            } catch (clearError) {
              console.error('[AUTH] Failed to clear corrupted state:', clearError);
            }
          }
          
          setLoading(false);
          return;
        }

        console.log('[AUTH] Initial session check:', session ? 'Found session' : 'No session');
        
        // Check if session is expired/invalid and refresh if needed
        if (session) {
          const now = Date.now() / 1000;
          const expiresAt = session.expires_at || 0;
          
          console.log('[AUTH] Session check:', {
            expiresAt: new Date(expiresAt * 1000),
            now: new Date(now * 1000),
            isExpired: expiresAt < now,
            timeLeft: Math.round((expiresAt - now) / 60) + ' minutes',
            accessToken: session.access_token ? 'Present' : 'Missing',
            refreshToken: session.refresh_token ? 'Present' : 'Missing'
          });
          
          // Always try to validate the token by making a test request
          console.log('[AUTH] Validating session token...');
          try {
            const { data: userData, error: userError } = await supabase.auth.getUser(session.access_token);
            
            console.log('[AUTH] Token validation result:', { userData: !!userData.user, error: userError });
            
            if (userError || !userData.user) {
              console.log('[AUTH] Token invalid, attempting refresh...');
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              if (refreshError || !refreshedSession) {
                console.error('[AUTH] Session refresh failed:', refreshError);
                console.log('[AUTH] Clearing corrupted session and reloading...');
                await supabase.auth.signOut();
                localStorage.clear();
                window.location.reload();
                return;
              }
              console.log('[AUTH] Session refreshed successfully');
              setSession(refreshedSession);
              setApiGlobalSession(refreshedSession);
              setUser(refreshedSession.user);
            } else {
              console.log('[AUTH] Token is valid');
              setSession(session);
              setApiGlobalSession(session);
              setUser(session.user);
            }
          } catch (tokenError) {
            console.error('[AUTH] Token validation failed:', tokenError);
            console.log('[AUTH] Network issue or token corruption, clearing session...');
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.reload();
            return;
          }
        } else {
          setSession(null);
          setApiGlobalSession(null);
          setUser(null);
        }
        
        if (session) {
          console.log('[AUTH] Found existing session, syncing with API...');
          try {
            await handleSuccessfulLogin(session);
          } catch (syncError) {
            console.error('[AUTH] Failed to sync on initial load:', syncError);
          }
        }
        
        setLoading(false);
        console.log('[AUTH] Initial auth setup complete');
      } catch (error) {
        console.error('[AUTH] Error during auth initialization:', error);
        setLoading(false);
      } finally {
        // Clear the timeout since initialization completed
        if (initTimeout) {
          clearTimeout(initTimeout);
          setInitTimeout(null);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes (only if Supabase is available)
    let subscription: { unsubscribe: () => void } | null = null;

    if (supabase && supabase.auth) {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] Auth state change:', event, session ? 'with session' : 'no session');
      
      // Set loading to true during transitions
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(true);
      }

      try {
        if (event === 'SIGNED_IN' && session) {
          console.log('[AUTH] User signed in, validating session...');
          
          // Validate the session token immediately
          console.log('[AUTH] Validating session token...');
          const { data: userData, error: userError } = await supabase.auth.getUser(session.access_token);
          
          console.log('[AUTH] Token validation result:', { userData: !!userData.user, error: userError });
          
          if (userError || !userData.user) {
            console.log('[AUTH] Token invalid, attempting refresh...');
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError || !refreshedSession) {
              console.error('[AUTH] Session refresh failed:', refreshError);
              console.log('[AUTH] Clearing corrupted session and reloading...');
              await supabase.auth.signOut();
              localStorage.clear();
              window.location.reload();
              return;
            }
            console.log('[AUTH] Session refreshed successfully');
            setSession(refreshedSession);
            setUser(refreshedSession.user);
            await handleSuccessfulLogin(refreshedSession);
          } else {
            console.log('[AUTH] Token is valid, proceeding with login...');
            setSession(session);
            setApiGlobalSession(session);
            setUser(session.user);
            await handleSuccessfulLogin(session);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[AUTH] User signed out, clearing API data');
          setSession(null);
          setApiGlobalSession(null);
          setUser(null);
          setApiUserData(null);
        } else {
          // For other events, just update the state
          setSession(session);
          setApiGlobalSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('[AUTH] Error during auth state change:', error);
        // If validation fails completely, clear everything
        console.log('[AUTH] Critical auth error, clearing session...');
        await supabase.auth.signOut();
        localStorage.clear();
        window.location.reload();
      } finally {
        setLoading(false);
      }
    });
      subscription = authSubscription;
    } else {
      console.warn('[AUTH] Supabase not available, skipping auth state listener');
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      // Clear timeout on cleanup
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase || !supabase.auth) {
      return { error: 'Authentication is not available. Please configure Supabase.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  }

  const signUp = async (email: string, password: string, metadata: any = {}) => {
    if (!supabase || !supabase.auth) {
      return { error: 'Authentication is not available. Please configure Supabase.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      return { error: error.message }
    }

    if (data.user) {
      console.log('User created in Supabase:', data.user.email)
    }

    return {}
  }

  const signInWithDiscord = async () => {
    if (!supabase || !supabase.auth) {
      return { error: 'Authentication is not available. Please configure Supabase.' }
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (err) {
      return { error: 'Discord authentication failed' }
    }
  }

  const signInWithSteam = async () => {
    if (!supabase || !supabase.auth) {
      return { error: 'Authentication is not available. Please configure Supabase.' }
    }

    try {
      // For local development, use edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const isLocalDev = supabaseUrl?.includes('127.0.0.1') || supabaseUrl?.includes('localhost')

      if (isLocalDev) {
        // Local development: use edge function
        const returnUrl = `${window.location.origin}/auth/steam-callback`
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/steam-auth?return_url=${encodeURIComponent(returnUrl)}`

        // Redirect to Steam via edge function
        window.location.href = edgeFunctionUrl
        return {}
      } else {
        // Production: Steam authentication requires logged-in user to link account
        // For sign-in without existing account, user should use email/password or Discord first
        return { error: 'Steam authentication requires an existing account. Please sign in with email or Discord first, then link your Steam account from your profile.' }
      }
    } catch (err) {
      console.error('[AUTH] Steam authentication error:', err)
      return { error: 'Failed to initiate Steam authentication' }
    }
  }

  const signOut = async () => {
    if (supabase && supabase.auth) {
      await supabase.auth.signOut()
    }
  }

  const value = {
    user,
    session,
    loading,
    apiUserData,
    isAdmin: false, // Admin functionality removed for public repo
    signIn,
    signUp,
    signInWithDiscord,
    signInWithSteam,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
