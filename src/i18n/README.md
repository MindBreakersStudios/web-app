# Internationalization (i18n) System

## Overview

The MindBreakers website uses a custom i18n system supporting English (en), Spanish (es), and Brazilian Portuguese (pt-br). This system is designed to be scalable and ready for dashboard implementation.

## Structure

```
src/
├── locales/
│   ├── en.json          # English translations
│   ├── es.json          # Spanish translations
│   └── pt-br.json       # Brazilian Portuguese translations
├── i18n/
│   ├── index.ts         # Translation utilities
│   └── README.md        # This file
├── contexts/
│   └── LanguageContext.tsx  # Language state management
└── hooks/
    └── useTranslation.ts    # Translation hook
```

## Usage

### 1. Basic Translation in Components

```typescript
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const t = useTranslation();
  
  return (
    <div>
      <h1>{t('about.headline')}</h1>
      <p>{t('common.home')}</p>
    </div>
  );
}
```

### 2. Adding New Translations

1. **Add to all locale files** (`src/locales/en.json`, `src/locales/es.json`, and `src/locales/pt-br.json`):

```json
{
  "mySection": {
    "title": "My Title",
    "description": "My description"
  }
}
```

2. **Use in components**:
```typescript
const t = useTranslation();
t('mySection.title')
```

### 3. Language Switcher

The `LanguageSwitcher` component is already integrated in the Header. It:
- Shows current language flag and name
- Toggles between English, Spanish, and Brazilian Portuguese
- Persists selection in localStorage
- Detects browser language on first visit

### 4. Language Context

The `LanguageProvider` wraps the app in `App.tsx` and provides:
- Current locale state
- `setLocale()` function to change language
- Automatic localStorage persistence
- Browser language detection

## Translation File Structure

### Current Sections

- `about.*` - About Us section content
- `common.*` - Common UI strings (navigation, buttons, etc.)

### Adding New Sections

Organize translations by feature/page:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "stats": {
      "playtime": "Total Playtime",
      "kills": "Kill Count"
    }
  },
  "servers": {
    "scum": {
      "title": "SCUM Server",
      "description": "..."
    }
  }
}
```

## Best Practices

1. **Use nested keys** for organization: `section.subsection.key`
2. **Keep keys descriptive**: `about.headline` not `about.h1`
3. **Group related content**: All about section keys under `about.*`
4. **Add to all languages**: Always update `en.json`, `es.json`, and `pt-br.json`
5. **Use fallbacks**: The `t()` function falls back to English if a key is missing

## Future Dashboard Integration

When implementing i18n in the dashboard:

1. **Add dashboard translations** to both locale files:
```json
{
  "dashboard": {
    "sidebar": { ... },
    "stats": { ... },
    "settings": { ... }
  }
}
```

2. **Use the same hook**:
```typescript
const t = useTranslation();
t('dashboard.stats.playtime')
```

3. **Language switcher** is already available - just import `LanguageSwitcher` component

## Technical Details

- **Storage**: Language preference stored in `localStorage` as `mindbreakers-locale`
- **Default**: Falls back to Spanish if no preference set
- **Detection**: Automatically detects browser language on first visit (en, es, pt)
- **Type Safety**: TypeScript types ensure locale safety (`'en' | 'es' | 'pt-br'`)
