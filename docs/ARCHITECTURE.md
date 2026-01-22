# Arquitectura del Proyecto

Documentación técnica de la arquitectura de MindBreakers Web App.

## Estructura del Proyecto

```
web-app/
├── src/                        # Código fuente principal
│   ├── components/             # Componentes React reutilizables
│   │   ├── ui/                 # Componentes de UI genéricos (botones, inputs, etc.)
│   │   ├── dashboard/          # Componentes específicos del dashboard
│   │   ├── Header.tsx          # Navegación principal
│   │   ├── Footer.tsx          # Pie de página
│   │   ├── Hero.tsx            # Sección hero de landing
│   │   ├── GameServers.tsx     # Listado de servidores
│   │   ├── VIPPlans.tsx        # Planes de suscripción
│   │   ├── LoginModal.tsx      # Modal de autenticación
│   │   └── LanguageSwitcher.tsx # Selector de idioma
│   │
│   ├── pages/                  # Páginas/rutas de la aplicación
│   │   ├── Dashboard.tsx       # Panel de usuario (en desarrollo)
│   │   ├── Profile.tsx         # Perfil de usuario
│   │   ├── Humanitz.tsx        # Landing page HumanitZ
│   │   ├── Scum.tsx            # Landing page SCUM
│   │   ├── Hytale.tsx          # Landing page Hytale
│   │   ├── AuthCallback.tsx    # Callback OAuth
│   │   ├── SteamCallback.tsx   # Callback Steam login
│   │   └── SteamLinkCallback.tsx # Callback vinculación Steam
│   │
│   ├── lib/                    # Utilidades y servicios
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── auth.tsx            # Provider y lógica de autenticación
│   │   └── api.ts              # Funciones de API
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTranslation.ts   # Hook para i18n
│   │   └── index.ts            # Exports centralizados
│   │
│   ├── contexts/               # React Context providers
│   │   └── LanguageContext.tsx # Contexto de idioma
│   │
│   ├── i18n/                   # Configuración de internacionalización
│   ├── locales/                # Archivos de traducción (ES/EN)
│   ├── types/                  # TypeScript type definitions
│   ├── config/                 # Configuración de la app
│   │
│   ├── App.tsx                 # Componente raíz y rutas
│   ├── index.tsx               # Entry point
│   └── index.css               # Estilos globales (Tailwind)
│
├── public/                     # Assets estáticos (imágenes, favicon)
├── docs/                       # Documentación técnica
├── skills/                     # Guías para AI agents
├── supabase/                   # Migraciones y seeds de BD
│   ├── migrations/             # Archivos de migración SQL
│   └── seed.sql                # Datos de prueba
│
├── .env.example                # Template de variables de entorno
├── vite.config.ts              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
├── tsconfig.json               # Configuración de TypeScript
└── package.json                # Dependencias y scripts
```

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   LanguageProvider                       │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │                  AuthProvider                    │    │    │
│  │  │  ┌─────────────────────────────────────────┐    │    │    │
│  │  │  │              BrowserRouter               │    │    │    │
│  │  │  │                                          │    │    │    │
│  │  │  │   ┌──────────┐  ┌─────────────────┐     │    │    │    │
│  │  │  │   │  Header  │  │     Routes      │     │    │    │    │
│  │  │  │   └──────────┘  │                 │     │    │    │    │
│  │  │  │                 │ /  → HomePage   │     │    │    │    │
│  │  │  │                 │ /profile        │     │    │    │    │
│  │  │  │                 │ /humanitz       │     │    │    │    │
│  │  │  │                 │ /scum           │     │    │    │    │
│  │  │  │                 │ /auth/*         │     │    │    │    │
│  │  │  │   ┌──────────┐  └─────────────────┘     │    │    │    │
│  │  │  │   │  Footer  │                          │    │    │    │
│  │  │  │   └──────────┘                          │    │    │    │
│  │  │  └─────────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### HomePage Components

```
┌─────────────────────────────────────────┐
│               HomePage                   │
│  ┌───────────────────────────────────┐  │
│  │              Hero                  │  │
│  │   (Banner principal con CTA)       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │          GameServers               │  │
│  │   (Lista de juegos/servidores)     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │           Features                 │  │
│  │   (Características destacadas)     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │             Stats                  │  │
│  │   (Estadísticas de comunidad)      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │              CTA                   │  │
│  │   (Call to action final)           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Flujo de Datos

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Usuario    │────▶│   React UI   │────▶│    Supabase      │
│  (Browser)   │◀────│  Components  │◀────│   (Backend)      │
└──────────────┘     └──────────────┘     └──────────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐     ┌──────────────────┐
                     │   Context    │     │   PostgreSQL     │
                     │  (Estado)    │     │   (Base datos)   │
                     │              │     │                  │
                     │ • Auth       │     │ • users          │
                     │ • Language   │     │ • games          │
                     └──────────────┘     │ • servers        │
                                          │ • subscriptions  │
                                          └──────────────────┘
```

### Flujo de Autenticación

```
┌─────────┐   1. Login    ┌─────────────┐   2. OAuth    ┌──────────┐
│ Usuario │──────────────▶│ LoginModal  │──────────────▶│ Supabase │
└─────────┘               └─────────────┘               │   Auth   │
     ▲                                                  └────┬─────┘
     │                                                       │
     │    4. Session                 3. Callback             │
     │◀──────────────────┬───────────────────────────────────┘
                         │
                  ┌──────┴───────┐
                  │ AuthCallback │
                  │    Page      │
                  └──────────────┘
```

### Flujo de Datos de Juegos

```
┌─────────────────┐     fetch()      ┌─────────────────┐
│  GameServers    │─────────────────▶│   lib/api.ts    │
│   Component     │◀─────────────────│   getGames()    │
└─────────────────┘   games[]        └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ lib/supabase.ts │
                                     │   supabase      │
                                     │   .from('games')│
                                     │   .select()     │
                                     └────────┬────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │    Supabase     │
                                     │   PostgreSQL    │
                                     │   games table   │
                                     └─────────────────┘
```

## Decisiones de Arquitectura

### React + Vite

**Por qué React:**
- Ecosistema maduro con amplia documentación
- Componentes reutilizables para UI consistente
- Gran comunidad y soporte para gaming/comunidades
- Facilita desarrollo incremental de features

**Por qué Vite:**
- Build times significativamente más rápidos que Create React App
- Hot Module Replacement (HMR) instantáneo
- Configuración mínima out-of-the-box
- Soporte nativo para TypeScript
- Optimización automática para producción

### Supabase como Backend

**Por qué Supabase:**
- **Autenticación integrada**: OAuth con Discord y Steam (esencial para gaming)
- **PostgreSQL**: Base de datos relacional robusta
- **Row Level Security (RLS)**: Seguridad a nivel de base de datos
- **API REST automática**: Sin necesidad de crear endpoints manualmente
- **Tier gratuito generoso**: Ideal para comunidades en crecimiento
- **Realtime subscriptions**: Para features futuras (chat, notificaciones)

**Alternativas consideradas:**
- Firebase: Descartado por modelo de datos NoSQL (menos flexible para relaciones complejas de suscripciones/servidores)
- Backend custom: Descartado por complejidad y tiempo de desarrollo

### Tailwind CSS

**Por qué Tailwind:**
- Desarrollo rápido con utility classes
- Consistencia visual sin escribir CSS custom
- Bundle size optimizado (purge de clases no usadas)
- Tema oscuro nativo (esencial para gaming aesthetic)

### TypeScript

**Por qué TypeScript:**
- Detección temprana de errores
- Mejor autocompletado y documentación en IDE
- Facilita refactoring seguro
- Types compartidos entre frontend y esquema de Supabase

### Separación Frontend Público vs Backend Privado

```
┌─────────────────────────────────────────────────────────┐
│                    PÚBLICO (Open Source)                 │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              web-app (este repo)                 │   │
│  │                                                  │   │
│  │  • Landing pages                                 │   │
│  │  • UI components                                 │   │
│  │  • Autenticación de usuarios                    │   │
│  │  • Perfil de usuario                            │   │
│  │  • Internacionalización (ES/EN)                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    PRIVADO (Repos separados)             │
│                                                         │
│  ┌──────────────────────┐  ┌────────────────────────┐  │
│  │   admin-dashboard    │  │   game-server-tools    │  │
│  │                      │  │                        │  │
│  │  • Gestión usuarios  │  │  • RCON integration    │  │
│  │  • Gestión servers   │  │  • Server automation   │  │
│  │  • Métricas/analytics│  │  • Whitelist sync      │  │
│  │  • Suscripciones     │  │  • Backups             │  │
│  └──────────────────────┘  └────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              supabase-functions                   │  │
│  │                                                   │  │
│  │  • Edge functions con lógica de negocio          │  │
│  │  • Webhooks de pagos                             │  │
│  │  • Integración con APIs de juegos                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Razones para la separación:**
1. **Seguridad**: Lógica de negocio sensible no expuesta públicamente
2. **Contribuciones**: Comunidad puede contribuir a UI sin acceso a backend
3. **Propiedad intelectual**: Herramientas custom de servidores permanecen privadas
4. **Flexibilidad**: Cada repo puede evolucionar independientemente

## Stack Tecnológico Completo

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | React 18 | UI Library |
| **Bundler** | Vite | Build tool |
| **Lenguaje** | TypeScript | Type safety |
| **Estilos** | Tailwind CSS | Styling |
| **Routing** | React Router | Navegación SPA |
| **Icons** | Lucide React | Iconografía |
| **Backend** | Supabase | BaaS (Backend as a Service) |
| **Database** | PostgreSQL | Base de datos relacional |
| **Auth** | Supabase Auth | Autenticación (Discord, Steam) |
| **Hosting** | Por definir | Vercel / Netlify recomendado |

## Convenciones de Código

- **Componentes**: PascalCase (`GameServers.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useTranslation.ts`)
- **Utilidades**: camelCase (`api.ts`)
- **Types**: PascalCase con sufijo descriptivo (`UserProfile`, `GameServer`)
- **CSS**: Tailwind utility classes (no CSS custom excepto en `index.css`)

## Links Relacionados

- [LOCAL_SETUP.md](../LOCAL_SETUP.md) - Configuración de desarrollo local
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuración de Supabase
- [AGENTS.md](../AGENTS.md) - Guía para AI agents
