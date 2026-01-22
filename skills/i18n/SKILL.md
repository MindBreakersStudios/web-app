---
name: i18n
description: >
  Guía de internacionalización para MindBreakers. Español como idioma principal, inglés como secundario.
  Trigger: When adding user-facing text, translations, or language-related features.
license: MIT
metadata:
  author: mindbreakers
  version: "1.0"
  scope: [root]
  auto_invoke: "Agregar textos en español/inglés"
allowed-tools: Read, Edit, Write, Glob, Grep
---

## Language Strategy

MindBreakers es un proyecto LATAM-first:
- **Español**: Idioma principal (default)
- **Inglés**: Idioma secundario
- **Código**: Siempre en inglés
- **Comentarios**: En inglés
- **UI text**: Bilingüe (español/inglés)

## Current Implementation

Actualmente usamos strings hardcoded. Futura implementación con i18next o similar.

### Pattern Actual (Temporal)

```tsx
// Para textos simples, usar constantes
const TEXTS = {
  es: {
    welcome: 'Bienvenido a MindBreakers',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
  },
  en: {
    welcome: 'Welcome to MindBreakers',
    login: 'Log in',
    logout: 'Log out',
  }
}

// En componente
const { language } = useLanguage() // 'es' | 'en'
const t = TEXTS[language]

<h1>{t.welcome}</h1>
```

### Future Pattern (con i18next)

```tsx
// locales/es/common.json
{
  "welcome": "Bienvenido a MindBreakers",
  "login": "Iniciar sesión"
}

// locales/en/common.json
{
  "welcome": "Welcome to MindBreakers",
  "login": "Log in"
}

// Uso
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
<h1>{t('welcome')}</h1>
```

## Guidelines

### ✅ DO

```tsx
// 1. Siempre agregar ambos idiomas
const texts = {
  es: 'Guardar cambios',
  en: 'Save changes'
}

// 2. Usar variables para fechas/números
// ✅ "Último acceso: {date}"
// ❌ "Último acceso: 15 de enero"

// 3. Considerar longitud del texto
// Español suele ser ~20% más largo que inglés
<button className="min-w-[120px]">  // Dar espacio extra
  {t.save}
</button>

// 4. Usar formato de fecha localizado
const date = new Date()
date.toLocaleDateString('es-AR')  // "15/1/2026"
date.toLocaleDateString('en-US')  // "1/15/2026"
```

### ❌ DON'T

```tsx
// 1. No mezclar idiomas en el mismo string
"Welcome bienvenido"  // ❌

// 2. No concatenar strings traducidos
t.hello + " " + userName  // ❌
// Usar interpolación
t.helloUser.replace('{name}', userName)  // ✅

// 3. No traducir código/términos técnicos
"Dashboard"  // Mantener en inglés si es término común
"Login"      // Puede ser "Iniciar sesión" en español
```

## Common Translations

| English | Español | Notas |
|---------|---------|-------|
| Dashboard | Panel / Dashboard | "Dashboard" es aceptable |
| Log in | Iniciar sesión | |
| Log out | Cerrar sesión | |
| Sign up | Registrarse | |
| Profile | Perfil | |
| Settings | Configuración | |
| Save | Guardar | |
| Cancel | Cancelar | |
| Delete | Eliminar | |
| Edit | Editar | |
| Loading... | Cargando... | |
| Error | Error | Igual en ambos |
| Success | Éxito | |
| Server | Servidor | |
| Player | Jugador | |
| VIP | VIP | Igual en ambos |

## Gaming-Specific Terms

| English | Español | Notas |
|---------|---------|-------|
| Spawn | Spawn / Aparecer | "Spawn" es común en gaming |
| Loot | Botín / Loot | "Loot" es aceptable |
| Kill | Eliminación / Kill | |
| Death | Muerte | |
| Stats | Estadísticas | |
| Leaderboard | Tabla de posiciones | |
| Achievement | Logro | |
| Whitelist | Lista blanca | |
| Ban | Baneo / Ban | |
| Admin | Administrador | |

## Date & Number Formatting

```tsx
// Fechas
const formatDate = (date: Date, locale: string) => {
  return date.toLocaleDateString(locale === 'es' ? 'es-AR' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
// es-AR: "15 de enero de 2026"
// en-US: "January 15, 2026"

// Números
const formatNumber = (num: number, locale: string) => {
  return num.toLocaleString(locale === 'es' ? 'es-AR' : 'en-US')
}
// es-AR: "1.234.567"
// en-US: "1,234,567"

// Moneda
const formatCurrency = (amount: number, locale: string) => {
  const currency = locale === 'es' ? 'ARS' : 'USD'
  return new Intl.NumberFormat(locale === 'es' ? 'es-AR' : 'en-US', {
    style: 'currency',
    currency
  }).format(amount)
}
```

## Pluralization

```tsx
// Español
const getPlayersText = (count: number) => {
  if (count === 1) return '1 jugador'
  return `${count} jugadores`
}

// Inglés
const getPlayersTextEn = (count: number) => {
  if (count === 1) return '1 player'
  return `${count} players`
}
```

## Checklist: Adding Text

- [ ] Agregar texto en español (principal)
- [ ] Agregar texto en inglés (secundario)
- [ ] Verificar que el texto más largo cabe en el UI
- [ ] Usar interpolación para valores dinámicos
- [ ] Usar formato de fecha/número localizado
- [ ] Considerar pluralización si aplica
