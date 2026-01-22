---
name: routing-pages
description: >
  Patrones de React Router y estructura de páginas en MindBreakers.
  Trigger: When creating new pages, routes, or navigation.
license: MIT
metadata:
  author: mindbreakers
  version: "1.1"
  scope: [root]
  auto_invoke: "Crear nuevas páginas o rutas"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Repository Scope

> ⚠️ **PUBLIC repo only**. No admin routes or server management pages.

### Pages You CAN Create
- Public pages (landing, knowledge base, etc.)
- User pages (profile, settings, listings)
- Auth callback pages

### Pages You CANNOT Create (Out of Scope)
- ❌ Admin dashboard
- ❌ Server management pages
- ❌ User moderation pages
- ❌ RCON command pages

---

## Route Structure

```tsx
// App.tsx
<Routes>
  {/* Public */}
  <Route path="/" element={<Landing />} />
  <Route path="/knowledge-base" element={<KnowledgeBase />} />

  {/* Auth callbacks */}
  <Route path="/auth/callback" element={<AuthCallback />} />
  <Route path="/auth/steam-callback" element={<SteamCallback />} />

  {/* Protected - require login */}
  <Route path="/profile" element={<Profile />} />
</Routes>
```

## Page Template

```tsx
// pages/NewPage.tsx
import React from 'react'
import { useAuth } from '@/lib/auth'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const NewPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Page Title</h1>

        {/* Page content */}
      </main>

      <Footer />
    </div>
  )
}
```

## Protected Routes

### User Authentication
```tsx
// Check if user is logged in
import { useAuth } from '@/lib/auth'
import { Navigate } from 'react-router-dom'

export const ProtectedPage: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/" replace />

  return <div>Protected content</div>
}
```

### Protected Route Wrapper
```tsx
// components/auth/ProtectedRoute.tsx
import { useAuth } from '@/lib/auth'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/" replace />

  return <>{children}</>
}

// Usage in App.tsx
<Route path="/profile" element={
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>
} />
```

## Navigation

### Link Component
```tsx
import { Link } from 'react-router-dom'

<Link
  to="/profile"
  className="text-gray-400 hover:text-white transition-colors"
>
  Go to Profile
</Link>
```

### Programmatic Navigation
```tsx
import { useNavigate } from 'react-router-dom'

export const MyComponent: React.FC = () => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/profile')
  }

  // Con replace (no agrega al history)
  const handleLogin = () => {
    navigate('/profile', { replace: true })
  }

  return <button onClick={handleClick}>Go</button>
}
```

### URL Parameters
```tsx
// Route definition
<Route path="/user/:userId" element={<UserProfile />} />

// In component
import { useParams } from 'react-router-dom'

export const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  return <div>User: {userId}</div>
}
```

### Query Parameters
```tsx
import { useSearchParams } from 'react-router-dom'

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q')

  const updateSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery })
  }

  return <div>Searching: {query}</div>
}
```

## Layouts

### Standard Layout (with Header/Footer)
```tsx
// For public pages
export const PublicPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Page content */}
      </main>

      <Footer />
    </div>
  )
}
```

### User Layout (with Sidebar)
```tsx
// For authenticated user pages
import { UserLayout } from '@/components/UserLayout'

export const ProfilePage: React.FC = () => {
  return (
    <UserLayout>
      <h1>Profile Content</h1>
    </UserLayout>
  )
}
```

## Current Pages Reference

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `components/Landing.tsx` | `/` | Landing page |
| `pages/Profile.tsx` | `/profile` | Perfil de usuario |
| `components/KnowledgeBase.tsx` | `/knowledge-base` | Documentación SCUM |
| `pages/AuthCallback.tsx` | `/auth/callback` | OAuth callback |
| `pages/SteamCallback.tsx` | `/auth/steam-callback` | Steam auth |

## Checklist: New Page

- [ ] Crear componente en `src/pages/` o `src/components/`
- [ ] Agregar route en `App.tsx`
- [ ] Usar layout apropiado (Public/User)
- [ ] Usar `ProtectedRoute` wrapper si requiere auth
- [ ] Verificar auth con `useAuth()` si es protected
- [ ] Mobile-first responsive design
- [ ] Agregar a la tabla de rutas en esta skill
- [ ] **Verificar que NO es una página de admin/servidor**
