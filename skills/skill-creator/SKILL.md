---
name: skill-creator
description: >
  Guía para crear nuevas skills para el proyecto MindBreakers.
  Trigger: When creating new AI agent skills.
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Crear nuevas skills"
allowed-tools: Read, Write, Glob, Grep
---

## What is a Skill?

Una skill es un archivo markdown que enseña a agentes IA (Claude, Copilot, etc.) cómo realizar tareas específicas en el proyecto.

## Skill Structure

```
skills/
├── {skill-name}/
│   ├── SKILL.md          # Requerido - instrucciones principales
│   ├── assets/           # Opcional - templates, scripts
│   └── references/       # Opcional - links a docs locales
```

## SKILL.md Template

```markdown
---
name: skill-name
description: >
  Descripción breve de la skill.
  Trigger: When [condición que activa esta skill].
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Acción que activa auto-invocación"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Overview
[Explicación breve de qué hace esta skill]

## Critical Rules

### ✅ ALWAYS
[Reglas que siempre se deben seguir]

### ❌ NEVER
[Cosas que nunca se deben hacer]

## Patterns
[Ejemplos de código y patrones]

## Checklist
- [ ] Paso 1
- [ ] Paso 2
```

## Frontmatter Fields

| Campo | Requerido | Descripción |
|-------|-----------|-------------|
| `name` | ✅ | Identificador único (kebab-case) |
| `description` | ✅ | Qué hace + cuándo usarla |
| `license` | ✅ | Siempre "MIT" |
| `metadata.author` | ✅ | "mindbreakers" |
| `metadata.version` | ✅ | Versión semántica |
| `metadata.scope` | ✅ | Dónde aplica: [root], [src], etc. |
| `metadata.auto_invoke` | ⚡ | Acción que activa invocación automática |
| `allowed-tools` | Opcional | Tools que puede usar el agente |

## Best Practices

### 1. Keep It Concise
```markdown
<!-- ✅ Bien: directo al punto -->
## Component Template
\`\`\`tsx
export const Button: React.FC<Props> = () => {}
\`\`\`

<!-- ❌ Mal: demasiada explicación -->
## Component Template
En React, los componentes son funciones que retornan JSX.
JSX es una extensión de sintaxis para JavaScript...
[3 párrafos más]
```

### 2. Lead with Critical Rules
```markdown
<!-- ✅ Las reglas importantes primero -->
## Critical Rules

### ✅ ALWAYS
- Use named exports
- Define interfaces for props

### ❌ NEVER
- Use `any` type
- Use default exports
```

### 3. Show, Don't Tell
```markdown
<!-- ✅ Ejemplo concreto -->
\`\`\`tsx
// ✅ Correcto
export const Button: React.FC<Props> = ({ children }) => (
  <button>{children}</button>
)

// ❌ Incorrecto
export default function Button(props) {
  return <button>{props.children}</button>
}
\`\`\`

<!-- ❌ Solo texto -->
Siempre usa named exports en lugar de default exports...
```

### 4. Include a Checklist
```markdown
## Checklist: Creating a Component

- [ ] Create file in correct folder
- [ ] Define Props interface
- [ ] Use named export
- [ ] Add className prop
- [ ] Write tests
```

## Scope Values

| Scope | Aplica a |
|-------|----------|
| `[root]` | Todo el proyecto |
| `[src]` | Frontend (React app) |
| `[supabase]` | Base de datos y migraciones |

## After Creating a Skill

1. Agregar a la tabla de skills en `AGENTS.md`
2. Agregar a la tabla de auto-invoke si tiene `auto_invoke`
3. Correr `./skills/skill-sync/assets/sync.sh` (si está configurado)

## Example: Creating a New Skill

```bash
# 1. Crear directorio
mkdir -p skills/my-new-skill

# 2. Crear SKILL.md
cat > skills/my-new-skill/SKILL.md << 'EOF'
---
name: my-new-skill
description: >
  Does something specific.
  Trigger: When doing that specific thing.
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Doing the specific thing"
allowed-tools: Read, Edit, Write
---

## Overview

This skill helps with...

## Critical Rules

### ✅ ALWAYS
- Rule 1
- Rule 2

## Patterns

\`\`\`tsx
// Example code
\`\`\`

## Checklist
- [ ] Step 1
- [ ] Step 2
EOF

# 3. Actualizar AGENTS.md (agregar a tabla de skills)
```

## Checklist: New Skill

- [ ] Crear directorio `skills/{name}/`
- [ ] Crear `SKILL.md` con frontmatter completo
- [ ] Incluir sección "Critical Rules"
- [ ] Agregar ejemplos de código
- [ ] Incluir checklist al final
- [ ] Agregar a tabla en `AGENTS.md`
- [ ] Agregar a auto-invoke si aplica
