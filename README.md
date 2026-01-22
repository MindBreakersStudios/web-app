# MindBreakers

Plataforma gaming para la comunidad MindBreakers LATAM. Servidores de juegos survival con comunidad activa desde 2020.

## Juegos Soportados

- **HumanitZ** - Lanzamiento: Febrero 2026 (servidor gratuito, whitelisted)
- **SCUM** - Lanzamiento: Mayo 2026 (suscripciones VIP)
- **Hytale** - Q4 2026 (próximamente)

### Servidores Anteriores

- DayZ (2020-2021)
- V Rising (2023)

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (opcional para desarrollo local)
- React Router

## Quick Start

```bash
git clone https://github.com/MindBreakersStudios/website.git
cd website
npm install
npm run dev
```

Ver [LOCAL_SETUP.md](./LOCAL_SETUP.md) para configuración completa con Supabase.

## Estructura del Proyecto

```
website/
├── src/               # Código fuente React
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── lib/           # Utilidades y configuración
│   ├── hooks/         # Custom hooks
│   └── types/         # TypeScript types
├── public/            # Assets estáticos
├── docs/              # Documentación técnica
├── skills/            # Guías para AI agents
├── supabase/          # Migraciones y seeds
├── package.json
└── vite.config.ts
```

## Contribuir

¡Contribuciones bienvenidas! Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para empezar.

Para agentes de IA, consulta [AGENTS.md](./AGENTS.md).

## Licencia

Este es un proyecto open source con licencia MIT + Commons Clause.
Ver [LICENSE](./LICENSE) para detalles.

---

© 2020-2026 MindBreakers. Todos los derechos reservados.
