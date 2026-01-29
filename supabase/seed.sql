-- ============================================
-- MindBreakers - Datos de Prueba (Seed)
-- ============================================
-- Archivo: seed.sql
-- Descripción: Datos iniciales para desarrollo local
-- Uso: npx supabase db reset (ejecuta migraciones + seed)
--      o ejecutar manualmente en SQL Editor de Supabase
--
-- ADVERTENCIA: Este archivo es solo para desarrollo.
-- NUNCA ejecutar en producción.
-- ============================================


-- ============================================
-- GAMES
-- ============================================
-- Catálogo de juegos soportados por MindBreakers

INSERT INTO games (slug, name, description, image_url, status, launch_date) VALUES
  (
    'scum',
    'SCUM',
    'SCUM es un juego de supervivencia en mundo abierto con un sistema de metabolismo único y mecánicas de supervivencia realistas. Sobrevive, explora, y domina.',
    '/images/games/scum.jpg',
    'coming_soon',
    '2026-05-01'
  ),
  (
    'humanitz',
    'HumanitZ',
    'HumanitZ es un survival zombie con enfoque en la construcción de bases y cooperación. Construye, defiende, y sobrevive junto a tu comunidad.',
    '/images/games/humanitz.jpg',
    'coming_soon',
    '2026-02-06'
  ),
  (
    'hytale',
    'Hytale',
    'Hytale es un juego de aventura, construcción y supervivencia con elementos RPG. Explora mundos procedimentales, construye lo que imagines, y disfruta de minijuegos personalizados.',
    '/images/games/hytale.jpg',
    'coming_soon',
    '2026-10-01'
  ),
  (
    'dayz',
    'DayZ',
    'DayZ fue nuestro primer servidor. Aunque ya no está activo, fue donde comenzó la comunidad MindBreakers.',
    '/images/games/dayz.jpg',
    'legacy',
    NULL
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  launch_date = EXCLUDED.launch_date;


-- ============================================
-- SERVERS
-- ============================================
-- Servidores de juego (requiere que games exista primero)

INSERT INTO servers (slug, game_id, name, description, region, max_players, status, settings) VALUES
  (
    'scum-latam',
    (SELECT id FROM games WHERE slug = 'scum'),
    'SCUM LATAM',
    'Servidor principal de SCUM para la comunidad latinoamericana. PvP habilitado, whitelist activa.',
    'latam',
    64,
    'online',
    '{"pvp": true, "high_loot": false, "whitelist": true, "hardcore": false}'::jsonb
  ),
  (
    'humanitz-latam',
    (SELECT id FROM games WHERE slug = 'humanitz'),
    'HumanitZ LATAM',
    'Servidor de HumanitZ para LATAM. PvP habilitado, whitelist activa, acceso gratuito.',
    'latam',
    24,
    'offline',
    '{
      "pvp": true,
      "whitelist": true,
      "free": true,
      "base_protection": true,
      "airdrop": true
    }'::jsonb
  ),
  (
    'hytale-latam',
    (SELECT id FROM games WHERE slug = 'hytale'),
    'Hytale LATAM',
    'Servidor de Hytale para LATAM. Modo aventura, construcción creativa, minijuegos y soporte completo de mods.',
    'latam',
    100,
    'offline',
    '{"mod_support": true, "pvp": true, "adventure_mode": true, "creative_mode": true, "minigames": true}'::jsonb
  ),
  (
    'dayz-legacy',
    (SELECT id FROM games WHERE slug = 'dayz'),
    'DayZ Legacy',
    'Servidor histórico de DayZ. Ya no está activo pero se mantiene como archivo.',
    'latam',
    50,
    'offline',
    '{}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  settings = EXCLUDED.settings;


-- ============================================
-- SUBSCRIPTION TIERS
-- ============================================
-- Niveles de suscripción VIP con precios regionales

INSERT INTO subscription_tiers (slug, name, price_usd, price_ars, price_clp, benefits, sort_order, is_active) VALUES
  (
    'bronze',
    'Bronce',
    5.00,
    5000.00,
    4500.00,
    '["Acceso a servidores VIP", "Badge en Discord", "Sin cola de espera"]'::jsonb,
    1,
    true
  ),
  (
    'silver',
    'Plata',
    15.00,
    15000.00,
    13500.00,
    '["Todo de Bronce", "Kit mensual in-game", "Soporte prioritario", "Acceso anticipado a eventos"]'::jsonb,
    2,
    true
  ),
  (
    'gold',
    'Oro',
    20.00,
    20000.00,
    18000.00,
    '["Todo de Plata", "Kit semanal in-game", "Nombre en créditos", "Acceso a betas cerradas", "Canal exclusivo Discord"]'::jsonb,
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price_usd = EXCLUDED.price_usd,
  price_ars = EXCLUDED.price_ars,
  price_clp = EXCLUDED.price_clp,
  benefits = EXCLUDED.benefits,
  sort_order = EXCLUDED.sort_order;


-- ============================================
-- ACHIEVEMENTS
-- ============================================
-- Sistema de logros (globales y por juego)

-- Logros Globales (game_id = NULL)
INSERT INTO achievements (slug, game_id, name, description, icon_url, points, category, is_secret, sort_order) VALUES
  (
    'first-login',
    NULL,
    'Primera Conexión',
    'Iniciaste sesión por primera vez en MindBreakers',
    '/images/achievements/first-login.png',
    10,
    'milestone',
    false,
    1
  ),
  (
    'linked-steam',
    NULL,
    'Guerrero de Steam',
    'Vinculaste tu cuenta de Steam a tu perfil',
    '/images/achievements/steam-linked.png',
    20,
    'social',
    false,
    2
  ),
  (
    'linked-discord',
    NULL,
    'Conectado',
    'Vinculaste tu cuenta de Discord a tu perfil',
    '/images/achievements/discord-linked.png',
    20,
    'social',
    false,
    3
  ),
  (
    'first-subscription',
    NULL,
    'Supporter',
    'Adquiriste tu primera suscripción VIP',
    '/images/achievements/supporter.png',
    50,
    'subscription',
    false,
    4
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points;

-- Logros de SCUM
INSERT INTO achievements (slug, game_id, name, description, icon_url, points, category, is_secret, sort_order) VALUES
  (
    'scum-first-kill',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Primera Sangre',
    'Conseguiste tu primera kill en SCUM',
    '/images/achievements/scum/first-kill.png',
    10,
    'combat',
    false,
    10
  ),
  (
    'scum-zombie-hunter',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Cazador de Zombies',
    'Mataste 100 zombies en SCUM',
    '/images/achievements/scum/zombie-hunter.png',
    25,
    'combat',
    false,
    11
  ),
  (
    'scum-survivor',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Superviviente',
    'Sobreviviste 24 horas seguidas sin morir',
    '/images/achievements/scum/survivor.png',
    50,
    'milestone',
    false,
    12
  ),
  (
    'scum-trader',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Comerciante',
    'Vendiste tu primer item en el mercado',
    '/images/achievements/scum/trader.png',
    15,
    'social',
    false,
    13
  ),
  (
    'scum-explorer',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Explorador',
    'Recorriste 100km en el mapa de SCUM',
    '/images/achievements/scum/explorer.png',
    30,
    'exploration',
    false,
    14
  ),
  (
    'scum-secret-bunker',
    (SELECT id FROM games WHERE slug = 'scum'),
    'Descubrimiento Oscuro',
    '???',
    '/images/achievements/scum/secret.png',
    100,
    'exploration',
    true,
    99
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  points = EXCLUDED.points,
  is_secret = EXCLUDED.is_secret;


-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Queries para verificar que los datos se insertaron correctamente

-- Descomenta estas líneas para verificar:

-- SELECT 'Games:' as table_name, count(*) as count FROM games
-- UNION ALL
-- SELECT 'Servers:', count(*) FROM servers
-- UNION ALL
-- SELECT 'Subscription Tiers:', count(*) FROM subscription_tiers
-- UNION ALL
-- SELECT 'Achievements:', count(*) FROM achievements;

-- SELECT g.name as game, s.name as server, s.status
-- FROM servers s
-- JOIN games g ON g.id = s.game_id;

-- SELECT name, points, category,
--        CASE WHEN game_id IS NULL THEN 'Global' ELSE 'Game-specific' END as scope
-- FROM achievements
-- ORDER BY sort_order;


-- ============================================
-- FIN DEL SEED
-- ============================================
-- Total de registros insertados:
--   - 4 Games (Humanitz, SCUM, Hytale, DayZ)
--   - 4 Servers
--   - 3 Subscription Tiers
--   - 10 Achievements (4 globales + 6 de SCUM)
-- ============================================
