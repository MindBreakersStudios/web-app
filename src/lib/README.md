# Lib

Utility functions, API clients, and core services.

## Files

| File | Purpose |
|------|---------|
| `supabase.ts` | Supabase client initialization |
| `auth.tsx` | AuthProvider and useAuth hook |
| `api.ts` | API client for backend services |
| `knowledge-base-data.ts` | Static data for knowledge base |

## Supabase Client

```tsx
import { supabase } from '@/lib/supabase'

// Use for direct Supabase queries
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

## Authentication

```tsx
import { useAuth } from '@/lib/auth'

const { user, loading, signIn, signOut } = useAuth()
```

## API Client

```tsx
import { authAPI, profileAPI, steamAPI } from '@/lib/api'

// Get user profile
const profile = await profileAPI.getProfile()

// Sync user after login
const userData = await authAPI.syncUser()
```

## Configuration

API URL is configured via environment variable:

```bash
VITE_API_URL=http://localhost:8000/api/v1
```

## Out of Scope

Do NOT add:
- Admin API endpoints
- Server management functions
- RCON command utilities
- Business logic for game integrations

API endpoints for admin functionality belong in private services.
