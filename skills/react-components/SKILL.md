---
name: react-components
description: >
  Patrones para crear componentes React con TypeScript en MindBreakers.
  Trigger: When creating, modifying, or refactoring React components.
license: MIT
metadata:
  author: mindbreakers
  version: "1.1"
  scope: [root]
  auto_invoke: "Crear/modificar componentes React"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Repository Scope

> ⚠️ **PUBLIC repo only**. No admin components or server management UI.

### Components You CAN Create
- UI components (buttons, inputs, cards, modals)
- User-facing features (profile, listings, stats display)
- Auth components (login modal, OAuth buttons)
- Public content (knowledge base, landing sections)

### Components You CANNOT Create (Out of Scope)
- ❌ Admin panels or dashboards
- ❌ Server management UI
- ❌ RCON command interfaces
- ❌ User moderation tools

---

## Component Template

```tsx
import React from 'react'

interface ComponentNameProps {
  // Required props primero
  title: string
  // Optional props después con ?
  variant?: 'primary' | 'secondary'
  className?: string
  children?: React.ReactNode
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  title,
  variant = 'primary',
  className = '',
  children
}) => {
  return (
    <div className={`base-classes ${className}`}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

## Critical Rules

### ✅ ALWAYS DO

```tsx
// 1. Named exports (no default)
export const MyComponent: React.FC<Props> = () => {}

// 2. Interface para props (no type)
interface MyComponentProps {
  value: string
}

// 3. Valores por defecto en destructuring
const MyComponent = ({ size = 'md' }: Props) => {}

// 4. className prop para customización
interface Props {
  className?: string
}

// 5. Hooks al inicio del componente
const MyComponent = () => {
  const { user } = useAuth()      // hooks primero
  const [state, setState] = useState()

  const handleClick = () => {}    // handlers después

  return <div />                  // render al final
}
```

### ❌ NEVER DO

```tsx
// 1. No default exports
export default function MyComponent() {}  // ❌

// 2. No any types
const handleClick = (e: any) => {}  // ❌

// 3. No inline functions in JSX (para eventos complejos)
<button onClick={() => complexLogic()}>  // ❌

// 4. No props drilling > 2 niveles
<A><B><C prop={fromA} /></B></A>  // ❌ usar Context

// 5. No hardcoded colors
<div style={{ color: '#ccff00' }}>  // ❌ usar Tailwind
```

## File Organization

```
components/
├── ui/                    # Componentes base reutilizables
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── auth/                  # Componentes de autenticación
│   ├── LoginModal.tsx
│   └── ProtectedRoute.tsx
├── landing/               # Componentes del landing page
│   ├── Hero.tsx
│   └── Features.tsx
└── profile/               # Componentes de perfil de usuario
    ├── ProfileHeader.tsx
    └── StatsCard.tsx
```

## Component Categories

### UI Components (`components/ui/`)
Componentes base, sin lógica de negocio:
```tsx
// Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-lime-500 hover:bg-lime-600 text-black',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-800 text-white'
  }

  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
```

### Feature Components (`components/profile/`, etc.)
Componentes con lógica específica:
```tsx
// profile/StatsCard.tsx
import { useAuth } from '@/lib/auth'
import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: number
  icon: React.ReactNode
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </Card>
  )
}
```

## Hooks Pattern

```tsx
// Custom hook example
export const usePlayerStats = (playerId: string) => {
  const [stats, setStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getPlayerStats(playerId)
        setStats(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [playerId])

  return { stats, loading, error }
}
```

## Icons

Usar Lucide React para iconos:
```tsx
import { User, Settings, LogOut, ChevronRight } from 'lucide-react'

// Uso
<User className="w-5 h-5" />
<Settings className="w-5 h-5 text-gray-400" />
```

## Checklist: New Component

- [ ] Crear archivo en la carpeta correcta (`ui/`, `auth/`, `profile/`, etc.)
- [ ] Definir interface para props
- [ ] Named export (no default)
- [ ] Agregar prop `className?` para customización
- [ ] Usar Tailwind para estilos
- [ ] Documentar props complejas con comentarios
- [ ] **Verificar que NO es un componente de admin/servidor**
