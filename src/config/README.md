# Configuration Files Guide

## Image Configuration

### Location: `src/config/images.ts`

All image paths used across the MindBreakers website are centralized in this file. Update the paths here to change images site-wide.

## How to Use

### 1. **Update Image Paths**

Edit `src/config/images.ts` and modify the paths:

```typescript
export const images = {
  logo: {
    main: '/Logo-35.png',  // Change this path
    footer: '/Logo-35.png',
  },
  // ... etc
}
```

### 2. **Where to Place Images**

- **Local images**: Place in the `public/` folder and reference with paths starting with `/`
  - Example: `/images/games/scum.jpg` → `public/images/games/scum.jpg`
  
- **External images**: Use full URLs (CDN, S3, etc.)
  - Example: `https://cdn.example.com/image.jpg`

### 3. **Using Images in Components**

```typescript
import { images } from '@/config/images';

// Direct access
<img src={images.logo.main} alt="Logo" />

// Or use helper function
import { getImage } from '@/config/images';
<img src={getImage('logo.main')} alt="Logo" />
```

## Image Categories

### Logo & Branding
- `images.logo.main` - Main logo (Header, Hero)
- `images.logo.footer` - Footer logo

### Game Servers
- `images.games.scum.header` - SCUM server card header image
- `images.games.scum.icon` - SCUM small logo/icon
- `images.games.humanitz.header` - Humanitz server card header
- `images.games.humanitz.icon` - Humanitz small logo/icon

### Backgrounds
- `images.backgrounds.hero` - Landing page hero background
- `images.backgrounds.humanitzHero` - Humanitz page hero background
- `images.backgrounds.versionComparison.*` - Version comparison images

### Achievements
- `images.achievements.*` - Achievement icons

### Profile
- `images.profile.defaultAvatar` - Default user avatar

## Current Image Sources

Most images are currently using:
- **Logo**: External S3 URL (uploadthingy)
- **Game images**: Steam CDN URLs
- **Backgrounds**: Unsplash URLs

To use local images, update the paths in `images.ts` and place files in `public/` folder.

---

## Internationalization (i18n)

**Note**: The i18n system has been moved to a proper structure. See `src/i18n/README.md` for complete documentation.

### Quick Reference

- **Translation files**: `src/locales/en.json` and `src/locales/es.json`
- **Translation hook**: `useTranslation()` from `src/hooks/useTranslation.ts`
- **Language switcher**: `LanguageSwitcher` component in Header
- **Usage**: `const t = useTranslation(); t('about.headline')`
