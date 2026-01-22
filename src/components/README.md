# Components

Reusable UI components for the MindBreakers frontend.

## Structure

```
components/
├── ui/           # Base UI components (Button, Input, Card, etc.)
├── auth/         # Authentication-related components (LoginModal)
├── dashboard/    # User dashboard components
├── landing/      # Landing page sections
└── *.tsx         # Top-level shared components
```

## Guidelines

### Creating Components

1. Use TypeScript with proper interfaces for props
2. Use named exports (not default exports)
3. Add `className` prop for customization
4. Follow the component template:

```tsx
import React from 'react'

interface MyComponentProps {
  title: string
  className?: string
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  className = ''
}) => {
  return (
    <div className={`base-classes ${className}`}>
      {title}
    </div>
  )
}
```

### Component Categories

| Folder | Purpose | Examples |
|--------|---------|----------|
| `ui/` | Base, reusable components | Button, Input, Card, Modal |
| `auth/` | Auth flow components | LoginModal, ProtectedRoute |
| `dashboard/` | User dashboard | DashboardLayout, StatsCard |

## Out of Scope

Do NOT add components for:
- Admin panels or dashboards
- Server management UI
- RCON command interfaces
- User moderation tools

These belong in the private admin repository.
