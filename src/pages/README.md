# Pages

Application pages/routes for the MindBreakers frontend.

## Current Pages

| Page | Route | Description |
|------|-------|-------------|
| `Dashboard.tsx` | `/dashboard` | User dashboard with stats and achievements |
| `Profile.tsx` | `/profile` | User profile management |
| `AuthCallback.tsx` | `/auth/callback` | OAuth callback handler |
| `SteamCallback.tsx` | `/auth/steam-callback` | Steam auth callback |
| `SteamLinkCallback.tsx` | `/auth/steam-link-callback` | Steam account linking callback |

## Creating New Pages

1. Create the component in this folder
2. Add the route in `App.tsx`
3. Use appropriate layout (Header/Footer or DashboardLayout)

```tsx
import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const NewPage: React.FC = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-900 py-8">
        {/* Page content */}
      </main>
      <Footer />
    </>
  )
}
```

## Out of Scope

Do NOT add pages for:
- Admin dashboard
- Server management
- User moderation
- RCON commands

These belong in the private admin repository.
