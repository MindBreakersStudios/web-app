# Types

TypeScript type definitions for the MindBreakers frontend.

## Creating Type Files

Organize types by domain:

```
types/
├── user.ts       # User-related types
├── game.ts       # Game data types
├── api.ts        # API response types
└── index.ts      # Re-exports
```

## Example Type Definitions

### User Types

```tsx
// types/user.ts
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
}

export interface UserProfile extends User {
  steam_id?: string
  discord_id?: string
  stats: PlayerStats
}

export interface PlayerStats {
  playtime: number
  kills: number
  deaths: number
  level: number
}
```

### API Types

```tsx
// types/api.ts
export interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}
```

### Index Re-export

```tsx
// types/index.ts
export * from './user'
export * from './game'
export * from './api'
```

## Guidelines

- Use `interface` for object shapes
- Use `type` for unions, intersections, and primitives
- Export all types from `index.ts` for easier imports
- Keep types close to where they're used if not shared
