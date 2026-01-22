---
name: mindbreakers
description: >
  MindBreakers project overview, structure, and conventions.
  Trigger: When starting work on the project, asking about architecture, or needing project context.
license: MIT
metadata:
  author: mindbreakers
  version: "1.1"
  scope: [root]
  auto_invoke: "Preguntas generales del proyecto"
allowed-tools: Read, Glob, Grep
---

## Repository Scope

> ⚠️ **This is a PUBLIC repository**. No admin panels, server integrations, or sensitive business logic.

### What This Repo Contains
- Public frontend (React + Vite + Tailwind)
- User-facing features (login, profile, listings)
- Supabase schema for generic/display data
- Knowledge base (public documentation)

### What This Repo Does NOT Contain
- ❌ Admin dashboard (separate private repo)
- ❌ Game server integrations (RCON, server management)
- ❌ Private API code (scum-service, humanitz-service)
- ❌ Sensitive business logic

## Project Overview

MindBreakers es una plataforma gaming comunitaria con:
- **Landing Page**: Presentación de servidores y comunidad
- **User Profile**: Perfil de usuario con stats y configuración
- **Knowledge Base**: Documentación pública de SCUM

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PUBLIC (This Repo)                        │
├─────────────────────────────────────────────────────────────┤
│   React Frontend ──────▶ Supabase (Auth + Public Data)      │
│        │                         ▲                          │
│        │ Users can:              │ Game data synced by      │
│        │ • Login/Register        │ private services         │
│        │ • Update profile        │ (out of scope)           │
│        │ • Read game data        │                          │
└────────│─────────────────────────│──────────────────────────┘
         │                         │
         │    ┌────────────────────┘
         │    │  PRIVATE (Out of Scope)
         │    │  • scum-service
         │    │  • humanitz-service
         │    │  • Admin Dashboard
         └────┘
```

## Tech Stack Quick Reference

| Tech | Para qué | Documentación |
|------|----------|---------------|
| React 18 | Componentes UI | `components/` |
| TypeScript | Tipado estático | Interfaces en cada archivo |
| Vite | Dev server + build | `vite.config.ts` |
| Tailwind 3.4 | Estilos | `tailwind.config.js` |
| React Router 6 | Navegación | `App.tsx` |
| Supabase | Auth + DB | `lib/supabase.ts` |
| Lucide | Iconos | `import { Icon } from 'lucide-react'` |

## Key Files

```
src/
├── App.tsx              # Router y layout principal
├── lib/
│   ├── auth.tsx         # AuthProvider, useAuth hook
│   ├── supabase.ts      # Cliente Supabase
│   └── api.ts           # Llamadas API (public data only)
├── components/
│   ├── ui/Button.tsx    # Componentes base reutilizables
│   ├── Header.tsx       # Navegación principal
│   └── dashboard/       # Componentes del dashboard
├── pages/
│   └── Profile.tsx      # Perfil de usuario
├── hooks/               # Custom hooks
└── types/               # TypeScript types
```

## Authentication Flow

```
Usuario → LoginModal → Supabase Auth → AuthCallback → Profile
                ↓
        Discord/Steam OAuth
```

El `AuthProvider` en `lib/auth.tsx` maneja:
- Estado de sesión
- Token JWT
- User profile

## Routing Structure

```tsx
// Public routes
/                    → Landing (Hero, Features, VIPPlans)
/knowledge-base      → Knowledge Base

// Protected routes (requieren auth)
/profile             → User Profile

// Auth callbacks
/auth/callback       → OAuth callback
/auth/steam-callback → Steam auth
```

## Common Patterns

### Importar componentes
```tsx
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'
```

### Usar autenticación
```tsx
const { user, signOut } = useAuth()

if (!user) return <LoginModal />
return <UserProfile user={user} />
```

### Estilos con Tailwind
```tsx
// Tema oscuro es el default
<div className="bg-gray-900 text-white">
  <button className="bg-blue-600 hover:bg-blue-700">
    Click me
  </button>
</div>
```

## Environment Variables

```bash
# .env.local (no commitear)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_APP_URL=http://localhost:5173
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Check code quality
```
