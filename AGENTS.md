# MindBreakers - Guía para Agentes IA / AI Agent Guide

> 🌐 **Idioma / Language**: Este proyecto es bilingüe. Código y comentarios en inglés, documentación de usuario en español e inglés.
> This project is bilingual. Code and comments in English, user documentation in Spanish and English.

---

## Repository Scope / Alcance del Repositorio

> ⚠️ **IMPORTANT**: This is a **PUBLIC** repository. No sensitive business logic, private APIs, or admin functionality belongs here.

### What This Repo Contains

- **Public frontend** (React + Vite + Tailwind)
- **User-facing features** (login, profile, listings, knowledge base)
- **Supabase schema** for generic/display data only
- **UI components, pages, and styling**

### What This Repo Does NOT Contain

- ❌ Admin dashboard (separate private repo)
- ❌ Game server integrations (RCON, server management)
- ❌ Private API code (scum-service, humanitz-service)
- ❌ Sensitive business logic or credentials
- ❌ Server automation or moderation tools

---

## Architecture Overview / Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                     PUBLIC (This Repo)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐         ┌─────────────────────────────────┐  │
│   │   React     │ ──────▶ │        Supabase                 │  │
│   │   Frontend  │ ◀────── │  (Auth + Public Data)           │  │
│   └─────────────┘         └─────────────────────────────────┘  │
│         │                            ▲                          │
│         │ Users can:                 │                          │
│         │ • Login/Register           │                          │
│         │ • Update profile           │                          │
│         │ • Publish listings         │                          │
│         │ • Read game data           │                          │
│         │                            │                          │
└─────────────────────────────────────│──────────────────────────┘
                                      │
                    ┌─────────────────│─────────────────┐
                    │      PRIVATE (Out of Scope)       │
                    ├───────────────────────────────────┤
                    │                                   │
                    │  ┌─────────────────────────────┐  │
                    │  │  scum-service               │  │
                    │  │  humanitz-service           │──┘
                    │  │  (Game data sync to         │
                    │  │   Supabase)                 │
                    │  └─────────────────────────────┘
                    │                                   │
                    │  ┌─────────────────────────────┐  │
                    │  │  Admin Dashboard            │  │
                    │  │  (Server management, RCON)  │  │
                    │  └─────────────────────────────┘  │
                    │                                   │
                    └───────────────────────────────────┘
```

### Data Flow

1. **Users** interact with the public frontend
2. **Frontend** reads/writes to Supabase (user data, listings, profiles)
3. **Private services** (out of scope) sync game server data to Supabase
4. **Frontend** displays game data as read-only (synced by private services)

---

## Contributor Guidelines / Guía para Contribuidores

### ✅ You CAN Work On

| Area | Examples |
|------|----------|
| **UI Components** | Buttons, modals, cards, forms |
| **Pages** | Landing, profile, knowledge base |
| **Styling** | Tailwind classes, themes, responsive design |
| **i18n** | Spanish/English translations |
| **User Features** | Login flow, profile editing, listings |
| **Documentation** | README, guides, comments |

### ❌ You CANNOT Work On (Out of Scope)

| Area | Reason |
|------|--------|
| Game server integrations | Private services handle this |
| RCON commands | Security-sensitive |
| Admin dashboard | Separate private repo |
| Server automation | Private services |
| Player moderation tools | Admin repo |
| Private API endpoints | Security-sensitive |

---

## Available Skills

Use estas skills para patrones detallados cuando los necesites:

### Core Skills (Desarrollo Principal)
| Skill | Descripción | URL |
|-------|-------------|-----|
| `mindbreakers` | Project overview, estructura, convenciones | [SKILL.md](skills/mindbreakers/SKILL.md) |
| `react-components` | Patrones de componentes React + TypeScript | [SKILL.md](skills/react-components/SKILL.md) |
| `tailwind-styling` | Clases Tailwind, tema oscuro, responsive | [SKILL.md](skills/tailwind-styling/SKILL.md) |
| `routing-pages` | React Router, estructura de páginas | [SKILL.md](skills/routing-pages/SKILL.md) |

### Community Skills (Contribución)
| Skill | Descripción | URL |
|-------|-------------|-----|
| `contributing` | Cómo contribuir, PR workflow, commits | [SKILL.md](skills/contributing/SKILL.md) |
| `i18n` | Internacionalización español/inglés | [SKILL.md](skills/i18n/SKILL.md) |
| `skill-creator` | Crear nuevas skills para el proyecto | [SKILL.md](skills/skill-creator/SKILL.md) |
| `skill-sync` | Sincronizar skills con AGENTS.md | [SKILL.md](skills/skill-sync/SKILL.md) |

### Auto-invoke Skills

Cuando realices estas acciones, **SIEMPRE** invoca la skill correspondiente PRIMERO:

| Acción | Skill |
|--------|-------|
| Crear/modificar componentes React | `react-components` |
| Trabajar con estilos Tailwind | `tailwind-styling` |
| Crear nuevas páginas o rutas | `routing-pages` |
| Agregar textos en español/inglés | `i18n` |
| Crear un Pull Request | `contributing` |
| Crear nuevas skills | `skill-creator` |
| Actualizar tablas de auto-invoke | `skill-sync` |
| Preguntas generales del proyecto | `mindbreakers` |

---

## Project Overview

**MindBreakers** es una plataforma gaming para la comunidad MindBreakers, con servidores de SCUM, HumanitZ y futuros títulos.

### Tech Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3 | UI Framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.2 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 6.26 | Routing |
| Supabase | 2.50 | Auth + Database |
| Lucide React | 0.441 | Icons |

### Project Structure

```
website/
├── AGENTS.md              # ← Estás aquí
├── skills/                # Skills para agentes IA
├── src/                   # Código fuente
│   ├── components/        # Componentes reutilizables
│   │   └── ui/            # Componentes base (Button, Input, etc.)
│   ├── pages/             # Páginas de la aplicación
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades, API, auth
│   ├── types/             # TypeScript types
│   └── App.tsx            # Router principal
├── public/                # Assets estáticos
├── supabase/              # Migraciones y seeds
├── docs/                  # Documentación adicional
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

### Main Routes (Public)

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing page | Público |
| `/profile` | Perfil de usuario | Autenticado |
| `/dashboard` | Dashboard de usuario | Autenticado |

---

## Development Guidelines

### Convenciones de Código

```typescript
// ✅ Correcto: Componente funcional con TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {
  return <button className={`btn-${variant}`}>{children}</button>
}

// ❌ Incorrecto: Sin tipos, export default
export default function Button(props) {
  return <button>{props.children}</button>
}
```

### Estructura de Componentes

```typescript
// 1. Imports (externos primero, luego locales)
import React from 'react'
import { Icon } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

// 2. Types/Interfaces
interface ComponentProps {
  title: string
  isActive?: boolean
}

// 3. Component
export const Component: React.FC<ComponentProps> = ({ title, isActive = false }) => {
  // 4. Hooks primero
  const { user } = useAuth()

  // 5. Handlers
  const handleClick = () => {
    console.log('clicked')
  }

  // 6. Render
  return (
    <div className="p-4">
      <h1>{title}</h1>
    </div>
  )
}
```

---

## Quick Start

```bash
# Clonar el repositorio
git clone https://github.com/mindbreakers/website.git
cd website

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar desarrollo
npm run dev
```

---

## Contributing

1. Lee la skill `contributing` antes de empezar
2. Crea un branch desde `main`: `git checkout -b feature/mi-feature`
3. Sigue las convenciones de commits: `feat:`, `fix:`, `docs:`, `style:`
4. Abre un Pull Request con descripción clara
5. Espera review de un maintainer

**Remember**: This is a public repo. Do not add any sensitive logic, credentials, or admin functionality.

---

## Links Útiles

- **Discord**: [MindBreakers Community](#)
- **GitHub Issues**: Para reportar bugs o sugerir features

---

© 2020-2026 MindBreakers. Todos los derechos reservados.
