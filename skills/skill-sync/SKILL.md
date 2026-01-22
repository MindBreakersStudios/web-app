---
name: skill-sync
description: >
  Sincroniza metadata de skills con las tablas de auto-invoke en AGENTS.md.
  Trigger: After creating or modifying skills.
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Actualizar tablas de auto-invoke"
allowed-tools: Read, Write, Bash
---

## Overview

Este script lee el campo `metadata.auto_invoke` de cada skill y actualiza automáticamente la tabla "Auto-invoke Skills" en `AGENTS.md`.

## Usage

```bash
./skills/skill-sync/assets/sync.sh
```

## What It Does

1. Escanea todos los archivos `skills/*/SKILL.md`
2. Extrae `name` y `metadata.auto_invoke`
3. Genera la tabla de auto-invoke
4. Actualiza `AGENTS.md` entre los marcadores

## Markers in AGENTS.md

El script busca estos marcadores:

```markdown
### Auto-invoke Skills

<!-- AUTO-INVOKE-START -->
| Acción | Skill |
|--------|-------|
| ... | ... |
<!-- AUTO-INVOKE-END -->
```

## Adding Auto-invoke to a Skill

En el frontmatter de tu skill:

```yaml
---
name: my-skill
metadata:
  auto_invoke: "Descripción de cuándo se activa"
---
```

Esto generará una entrada:

```markdown
| Descripción de cuándo se activa | `my-skill` |
```

## Manual Sync

Si prefieres no usar el script, agrega manualmente a la tabla:

```markdown
| Acción | Skill |
|--------|-------|
| Crear componentes React | `react-components` |
| Mi nueva acción | `my-new-skill` |
```

## Troubleshooting

### Skill no aparece en tabla
- Verificar que tiene `metadata.auto_invoke`
- Verificar que el archivo se llama `SKILL.md` (mayúsculas)
- Correr el script de nuevo

### Tabla no se actualiza
- Verificar que existen los marcadores `<!-- AUTO-INVOKE-START -->` y `<!-- AUTO-INVOKE-END -->`
- Verificar permisos de escritura en `AGENTS.md`
