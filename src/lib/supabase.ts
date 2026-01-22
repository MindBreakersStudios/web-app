import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase credentials are available
const hasSupabaseCredentials = !!(supabaseUrl && supabaseAnonKey)

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log('🔍 [SUPABASE] Environment variables check:', {
    url: supabaseUrl ? '✅ Set' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
    nodeEnv: import.meta.env.MODE,
    willInitialize: hasSupabaseCredentials
  })
}

if (!hasSupabaseCredentials) {
  console.warn('⚠️ [SUPABASE] Missing environment variables. App will run without Supabase features.')
  console.info('💡 To enable Supabase features, create a .env file with:')
  console.info('   VITE_SUPABASE_URL=your-project-url')
  console.info('   VITE_SUPABASE_ANON_KEY=your-anon-key')
}

/**
 * Lazy initialization of Supabase client
 * Only creates the client when credentials are available and when first accessed
 */
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseCredentials) {
    return null
  }
  
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl!, supabaseAnonKey!)
      if (import.meta.env.DEV) {
        console.log('✅ [SUPABASE] Client initialized successfully')
      }
    } catch (error) {
      console.error('❌ [SUPABASE] Failed to initialize client:', error)
      return null
    }
  }
  
  return supabaseInstance
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  return hasSupabaseCredentials && getSupabaseClient() !== null
}

/**
 * Supabase client - returns null if credentials are not available
 * Components should check for null before using
 * 
 * Usage:
 *   if (supabase) {
 *     const { data } = await supabase.from('table').select()
 *   }
 */
export const supabase: SupabaseClient | null = hasSupabaseCredentials 
  ? (() => {
      // Create a proxy that initializes on first access
      return new Proxy({} as SupabaseClient, {
        get(_target, prop) {
          const client = getSupabaseClient()
          if (!client) {
            // Return a no-op function for methods to prevent errors
            if (typeof prop === 'string' && prop !== 'then' && prop !== 'constructor') {
              if (import.meta.env.DEV) {
                console.warn(`⚠️ [SUPABASE] Attempted to use ${prop} but Supabase is not configured`)
              }
              return () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
            }
            return undefined
          }
          return (client as any)[prop]
        }
      })
    })()
  : null

export type Database = {
  public: {
    Tables: {
      // Add your database schema types here
    }
  }
} 