import React from 'react';
import { useAuth } from '../lib/auth';

export const DebugInfo = () => {
  const { user, session, loading, isAdmin, apiUserData } = useAuth();
  const [refreshCount, setRefreshCount] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg max-w-sm text-xs z-50">
        <div 
          className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-bold text-yellow-400">🐛 Debug Info</h3>
          <button className="text-gray-400 hover:text-white">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="px-3 pb-3 border-t border-gray-600">
        <div className="space-y-1 text-gray-300">
          <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
          <div><strong>User:</strong> {user?.email || 'None'}</div>
          <div><strong>Session:</strong> {session ? 'Active' : 'None'}</div>
          <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
          <div><strong>API Data:</strong> {apiUserData ? 'Loaded' : 'None'}</div>
          <div><strong>User ID:</strong> {user?.id || 'None'}</div>
          <div><strong>Refresh Count:</strong> {refreshCount}</div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-600 space-y-1">
          <button 
            onClick={() => console.log('Full auth state:', { user, session, loading, isAdmin, apiUserData })}
            className="text-blue-400 hover:text-blue-300 text-xs block w-full text-left"
          >
            Log Full State
          </button>
          <button 
            onClick={() => {
              if (session) {
                console.log('JWT Token:', session.access_token);
                console.log('Token expires at:', new Date(session.expires_at! * 1000));
              } else {
                console.log('No session available');
              }
            }}
            className="text-blue-400 hover:text-blue-300 text-xs block w-full text-left"
          >
            Log JWT Token
          </button>
          <button 
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:8000/api/v1/auth/admin-status', {
                  headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                  }
                });
                const data = await response.json();
                console.log('Direct API test:', { status: response.status, data });
              } catch (error) {
                console.error('Direct API test failed:', error);
              }
            }}
            className="text-yellow-400 hover:text-yellow-300 text-xs block w-full text-left"
          >
            Test API Direct
          </button>
          <button 
            onClick={() => {
              setRefreshCount(prev => prev + 1);
              window.location.reload();
            }}
            className="text-red-400 hover:text-red-300 text-xs block w-full text-left"
          >
            Force Refresh
          </button>
          <button 
            onClick={async () => {
              console.log('[DEBUG] Force refreshing session...');
              try {
                const { useAuth } = await import('../lib/auth');
                // Get supabase instance
                const { supabase } = await import('../lib/supabase');
                if (!supabase || !supabase.auth) {
                  alert('Supabase is not configured');
                  return;
                }
                const { data, error } = await supabase.auth.refreshSession();
                if (error) {
                  console.error('[DEBUG] Session refresh failed:', error);
                  alert('Session refresh failed: ' + error.message);
                } else {
                  console.log('[DEBUG] Session refreshed successfully');
                  window.location.reload();
                }
              } catch (error) {
                console.error('[DEBUG] Refresh error:', error);
              }
            }}
            className="text-blue-400 hover:text-blue-300 text-xs block w-full text-left"
          >
            🔄 Force Session Refresh
          </button>
          <button 
            onClick={() => {
              console.log('[DEBUG] Clearing all auth data...');
              localStorage.clear();
              sessionStorage.clear();
              // Clear Supabase auth
              if (window.supabase) {
                window.supabase.auth.signOut();
              }
              window.location.reload();
            }}
            className="text-red-500 hover:text-red-400 text-xs block w-full text-left"
          >
            🚨 Clear Auth Data
          </button>
        </div>
        </div>
        )}
      </div>
    );
  }
  
  return null;
};
