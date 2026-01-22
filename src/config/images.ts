/**
 * Image Configuration for MindBreakers Website
 * 
 * This file centralizes all image paths used across the application.
 * Update the paths here to change images site-wide.
 * 
 * Images should be placed in the `public/` folder and referenced
 * with paths starting with `/` (e.g., `/images/logo.png`)
 * 
 * For external images (CDN, etc.), use full URLs.
 */

export const images = {
  // ============================================
  // LOGO & BRANDING
  // ============================================
  logo: {
    // Main logo used in Header and Hero
    main: 'https://uploadthingy.s3.us-west-1.amazonaws.com/j4KwKME8Sszn3RKxeLHnDw/Logo-35.png',
    // Alternative: Use local file
    // main: '/Logo-35.png',
    
    // Footer logo (can be same or different)
    footer: 'https://uploadthingy.s3.us-west-1.amazonaws.com/j4KwKME8Sszn3RKxeLHnDw/Logo-35.png',
  },

  // ============================================
  // GAME SERVERS
  // ============================================
  games: {
    scum: {
      // Header image for SCUM server card
      header: 'https://cdn.akamai.steamstatic.com/steam/apps/513710/header.jpg',
      // Small logo/icon for SCUM
      icon: 'https://cdn.akamai.steamstatic.com/steam/apps/513710/capsule_sm_120.jpg',
      // Full game image (for game detail pages)
      full: '/images/games/scum.jpg',
    },
    humanitz: {
      header: 'https://cdn.akamai.steamstatic.com/steam/apps/1711420/header.jpg',
      icon: 'https://cdn.akamai.steamstatic.com/steam/apps/1711420/capsule_sm_120.jpg',
      full: '/images/games/humanitz.jpg',
    },
    hytale: {
      // Hytale is not on Steam yet, using placeholder gradient
      header: '/images/games/hytale.jpg',
      icon: '/images/games/hytale-icon.jpg',
      full: '/images/games/hytale.jpg',
    },
  },

  // ============================================
  // HERO & BACKGROUNDS
  // ============================================
  backgrounds: {
    // Hero section background (landing page)
    hero: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1650&q=80',
    
    // Humanitz page hero background (title image)
    humanitzHero: '/images/humanitz/title.jpg',
    
    // Version comparison images (Humanitz page)
    // Current version (0.9) - left column
    versionComparison: {
      current: {
        zombieAI: '/images/humanitz/1-0.9.png',
        baseBuilding: '/images/humanitz/2-0.9.png',
        lootSystem: '/images/humanitz/3-0.9.png',
        performance: '/images/humanitz/4-0.9.png',
      },
      // New version (1.0) - right column
      new: {
        zombieAI: '/images/humanitz/1-1.0.png',
        baseBuilding: '/images/humanitz/2-1.0.png',
        lootSystem: '/images/humanitz/3-1.0.png',
        performance: '/images/humanitz/4-1.0.png',
      },
    },
  },

  // ============================================
  // ACHIEVEMENTS
  // ============================================
  achievements: {
    // Global achievements
    firstLogin: '/images/achievements/first-login.png',
    steamLinked: '/images/achievements/steam-linked.png',
    discordLinked: '/images/achievements/discord-linked.png',
    supporter: '/images/achievements/supporter.png',
    
    // SCUM achievements
    scum: {
      firstKill: '/images/achievements/scum/first-kill.png',
      zombieHunter: '/images/achievements/scum/zombie-hunter.png',
      survivor: '/images/achievements/scum/survivor.png',
      trader: '/images/achievements/scum/trader.png',
      explorer: '/images/achievements/scum/explorer.png',
      secret: '/images/achievements/scum/secret.png',
    },
  },

  // ============================================
  // USER AVATARS & PROFILE
  // ============================================
  profile: {
    // Default avatar when user has no avatar
    defaultAvatar: '/images/profile/default-avatar.png',
  },
} as const;

/**
 * Helper function to get image path
 * Usage: getImage('logo.main') or getImage('games.scum.header')
 */
export function getImage(path: string): string {
  const keys = path.split('.');
  let value: any = images;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Image path not found: ${path}`);
      return '';
    }
  }
  
  return value;
}
