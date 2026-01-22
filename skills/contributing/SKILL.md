---
name: contributing
description: >
  Guía para contribuir al proyecto MindBreakers. Workflow de PR, convenciones de commits, code review.
  Trigger: When creating a Pull Request, making commits, or asking about contribution workflow.
license: MIT
metadata:
  author: mindbreakers
  version: "1.1"
  scope: [root]
  auto_invoke: "Crear un Pull Request"
allowed-tools: Read, Glob, Grep
---

## Contribution Scope / Alcance de Contribuciones

> ⚠️ **IMPORTANT**: This is a PUBLIC repository. Review what's in scope before contributing.

### ✅ IN SCOPE (You CAN contribute)

| Area | Examples |
|------|----------|
| **UI Components** | Buttons, modals, cards, forms, inputs |
| **Pages** | Landing, profile, knowledge base |
| **Styling** | Tailwind classes, themes, responsive design |
| **i18n** | Spanish/English translations |
| **User Features** | Login flow, profile editing, user listings |
| **Supabase Schema** | Generic/display data tables (read by frontend) |
| **Documentation** | README, guides, skill files |

### ❌ OUT OF SCOPE (Do NOT contribute)

| Area | Reason |
|------|--------|
| Admin dashboard | Separate private repo |
| Game server integrations | Private services (scum-service, humanitz-service) |
| RCON commands | Security-sensitive, private services |
| Server automation | Private services |
| Player moderation tools | Admin repo |
| Business logic | Private services |
| Private API endpoints | Security-sensitive |

---

## Quick Start para Contribuidores

```bash
# 1. Fork del repositorio en GitHub

# 2. Clonar tu fork
git clone https://github.com/TU-USUARIO/website.git
cd website

# 3. Agregar upstream
git remote add upstream https://github.com/mindbreakers/website.git

# 4. Crear branch para tu feature
git checkout -b feature/mi-nueva-feature

# 5. Instalar dependencias
npm install

# 6. Desarrollar
npm run dev

# 7. Commit y push
git add .
git commit -m "feat: descripción de mi cambio"
git push origin feature/mi-nueva-feature

# 8. Crear Pull Request en GitHub
```

## Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descripción corta>

[cuerpo opcional]

[footer opcional]
```

### Tipos Permitidos

| Tipo | Cuándo usar | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat: add user profile page` |
| `fix` | Corrección de bug | `fix: resolve login redirect issue` |
| `docs` | Solo documentación | `docs: update README` |
| `style` | Formato, espacios (no cambia código) | `style: format with prettier` |
| `refactor` | Refactor sin cambiar funcionalidad | `refactor: extract auth logic to hook` |
| `test` | Agregar o modificar tests | `test: add unit tests for Button` |
| `chore` | Mantenimiento, deps | `chore: update dependencies` |

### Ejemplos Buenos

```bash
# ✅ Bien
git commit -m "feat: add VIP plans section to landing page"
git commit -m "fix: correct auth redirect after Discord login"
git commit -m "docs: add contributing guide in Spanish"
git commit -m "style: apply consistent spacing in Header"

# ❌ Mal
git commit -m "changes"
git commit -m "WIP"
git commit -m "fix stuff"
git commit -m "feat: Add new feature for the landing page that shows VIP plans" # muy largo
```

## Pull Request Workflow

### 1. Antes de crear PR

```bash
# Asegúrate de estar actualizado con main
git fetch upstream
git rebase upstream/main

# Corre lint y tests
npm run lint
npm run build

# Resuelve conflictos si hay
```

### 2. Crear Pull Request

Título del PR debe seguir conventional commits:
```
feat: add user stats display
fix: resolve mobile navigation bug
```

### 3. Template de PR

```markdown
## Descripción
<!-- Qué hace este PR? Por qué es necesario? -->

## Cambios
- [ ] Nuevo componente StatsCard
- [ ] Estilos responsive
- [ ] Tests unitarios

## Screenshots
<!-- Si hay cambios visuales, agregar screenshots -->

## Testing
<!-- Cómo probar los cambios -->
1. Ir a /profile
2. Verificar que se muestran las stats

## Checklist
- [ ] Leí la guía de contribución
- [ ] Mi código sigue las convenciones del proyecto
- [ ] Corrí `npm run lint` sin errores
- [ ] NO incluye código admin/servidor/business logic
- [ ] Agregué/actualicé documentación si es necesario
```

### 4. Code Review

- Espera review de al menos 1 maintainer
- Responde a los comentarios
- Haz los cambios solicitados
- Re-request review cuando esté listo

## Estructura de Branches

```
main                    # Producción, siempre estable
├── feature/xxx         # Nuevas funcionalidades
├── fix/xxx             # Correcciones de bugs
├── docs/xxx            # Solo documentación
└── refactor/xxx        # Refactors
```

### Nombres de Branch

```bash
# ✅ Bien
feature/user-profile
feature/vip-plans-section
fix/login-redirect
docs/add-spanish-readme

# ❌ Mal
myfeature
test
fix
feature/Add_New_Feature_For_Dashboard  # no usar mayúsculas ni underscore
```

## Qué Puedo Contribuir?

### Para Principiantes (Good First Issues)
- Mejorar documentación
- Agregar traducciones (i18n)
- Corregir typos
- Mejorar estilos/CSS
- Agregar tests

### Nivel Intermedio
- Nuevos componentes UI
- Mejoras de UX
- Optimización de rendimiento
- Nuevas páginas públicas

### Nivel Avanzado
- Arquitectura de features de usuario
- Sistema de autenticación (OAuth flows)
- Supabase schema para datos públicos
- Performance crítico

## Reglas de Código

### TypeScript
```tsx
// ✅ Siempre tipos explícitos
interface Props {
  title: string
  count: number
}

// ❌ No usar any
const data: any = fetchData()  // ❌
```

### Componentes
```tsx
// ✅ Named exports
export const MyComponent: React.FC<Props> = () => {}

// ❌ No default exports
export default function MyComponent() {}  // ❌
```

### Estilos
```tsx
// ✅ Tailwind classes
<div className="bg-gray-800 p-4 rounded-lg">

// ❌ No inline styles
<div style={{ backgroundColor: '#1f2937' }}>  // ❌
```

## Recursos

- **Discord**: Para preguntas rápidas
- **GitHub Issues**: Para bugs y features
- **AGENTS.md**: Guía general del proyecto
- **Skills**: Patrones específicos en `skills/`

## Checklist Final

Antes de crear tu PR, verifica:

- [ ] Branch actualizado con `main`
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` compila correctamente
- [ ] Commits siguen conventional commits
- [ ] PR tiene descripción clara
- [ ] Screenshots si hay cambios visuales
- [ ] **NO incluye código de admin, servidor, o business logic**
