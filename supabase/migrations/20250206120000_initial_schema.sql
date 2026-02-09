-- ============================================
-- MindBreakers - Schema Inicial
-- ============================================
-- Migración: 001_initial_schema.sql
-- Descripción: Crea todas las tablas base del sistema
-- Autor: MindBreakers Team
-- Fecha: 2025
-- ============================================

-- ============================================
-- TABLA: users
-- ============================================
-- Perfiles de usuario extendidos que complementan auth.users de Supabase.
-- Almacena información adicional como username, avatar, y conexiones
-- con plataformas externas (Steam, Discord, Twitch, etc).
-- El id hace referencia directa a auth.users para mantener sincronía.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  steam_id TEXT UNIQUE,
  discord_id TEXT UNIQUE,
  twitch_id TEXT UNIQUE,
  kick_id TEXT UNIQUE,
  google_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Perfiles de usuario con conexiones a plataformas externas';
COMMENT ON COLUMN users.steam_id IS 'Steam ID 64-bit del usuario para vincular cuenta de Steam';
COMMENT ON COLUMN users.discord_id IS 'Discord User ID para vincular cuenta de Discord';


-- ============================================
-- TABLA: games
-- ============================================
-- Catálogo de juegos soportados por MindBreakers.
-- Cada juego puede tener múltiples servidores asociados.
-- El campo status permite controlar la visibilidad:
--   - 'active': Juego activo con servidores disponibles
--   - 'coming_soon': Próximamente, visible pero no jugable
--   - 'legacy': Juego antiguo, archivado

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'coming_soon',
  launch_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT games_status_check CHECK (status IN ('active', 'coming_soon', 'legacy'))
);

COMMENT ON TABLE games IS 'Catálogo de juegos soportados por MindBreakers';
COMMENT ON COLUMN games.slug IS 'Identificador URL-friendly único (ej: scum, humanitz)';
COMMENT ON COLUMN games.status IS 'Estado del juego: active, coming_soon, legacy';


-- ============================================
-- TABLA: servers
-- ============================================
-- Servidores de juego administrados por MindBreakers.
-- Cada servidor pertenece a un juego específico.
-- El campo settings (JSONB) permite configuraciones flexibles
-- específicas de cada juego sin necesidad de cambiar el schema.
-- Ejemplos de settings: {pvp: true, high_loot: false, hardcore: true}

CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT DEFAULT 'latam',
  max_players INT DEFAULT 64,
  status TEXT DEFAULT 'offline',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT servers_status_check CHECK (status IN ('online', 'offline', 'maintenance'))
);

COMMENT ON TABLE servers IS 'Servidores de juego administrados por MindBreakers';
COMMENT ON COLUMN servers.slug IS 'Identificador URL-friendly único (ej: scum-latam-1)';
COMMENT ON COLUMN servers.region IS 'Región geográfica del servidor (latam, na, eu)';
COMMENT ON COLUMN servers.settings IS 'Configuración específica del servidor en formato JSON';


-- ============================================
-- TABLA: subscription_tiers
-- ============================================
-- Niveles de suscripción VIP disponibles.
-- Soporta múltiples monedas para la región LATAM:
--   - USD: Dólar estadounidense (precio base)
--   - ARS: Peso argentino
--   - CLP: Peso chileno
-- El campo benefits (JSONB) lista los beneficios de cada tier.

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  price_ars DECIMAL(10,2) NOT NULL,
  price_clp DECIMAL(10,2) NOT NULL,
  benefits JSONB DEFAULT '[]',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subscription_tiers IS 'Niveles de suscripción VIP (Bronze, Silver, Gold)';
COMMENT ON COLUMN subscription_tiers.slug IS 'Identificador único (bronze, silver, gold)';
COMMENT ON COLUMN subscription_tiers.benefits IS 'Lista de beneficios en formato JSON array';
COMMENT ON COLUMN subscription_tiers.sort_order IS 'Orden de visualización en la UI';


-- ============================================
-- TABLA: subscriptions
-- ============================================
-- Suscripciones activas e históricas de usuarios.
-- Registra cada compra/renovación de suscripción VIP.
-- El campo status controla el estado actual:
--   - 'active': Suscripción vigente
--   - 'expired': Suscripción vencida
--   - 'cancelled': Suscripción cancelada por el usuario
-- Guarda información del pago para auditoría.

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  currency_paid TEXT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_provider TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT subscriptions_status_check CHECK (status IN ('active', 'expired', 'cancelled')),
  CONSTRAINT subscriptions_currency_check CHECK (currency_paid IN ('usd', 'ars', 'clp'))
);

COMMENT ON TABLE subscriptions IS 'Historial de suscripciones VIP de usuarios';
COMMENT ON COLUMN subscriptions.currency_paid IS 'Moneda usada para el pago (usd, ars, clp)';
COMMENT ON COLUMN subscriptions.payment_provider IS 'Proveedor de pago (stripe, mercadopago)';
COMMENT ON COLUMN subscriptions.payment_id IS 'ID de transacción del proveedor de pago';


-- ============================================
-- TABLA: scum_player_stats
-- ============================================
-- Estadísticas de jugadores en servidores de SCUM.
-- Se sincroniza periódicamente desde el servidor de juego.
-- Cada registro es único por combinación de usuario y servidor,
-- permitiendo trackear stats separadas por servidor.
-- Los datos son de solo lectura para el frontend -
-- solo el backend sincroniza desde el servidor de juego.

CREATE TABLE IF NOT EXISTS scum_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  playtime_minutes INT DEFAULT 0,
  zombies_killed INT DEFAULT 0,
  animals_killed INT DEFAULT 0,
  distance_traveled INT DEFAULT 0,
  items_crafted INT DEFAULT 0,
  last_seen TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT scum_player_stats_unique UNIQUE (user_id, server_id)
);

COMMENT ON TABLE scum_player_stats IS 'Estadísticas de jugadores en servidores SCUM';
COMMENT ON COLUMN scum_player_stats.playtime_minutes IS 'Tiempo de juego total en minutos';
COMMENT ON COLUMN scum_player_stats.distance_traveled IS 'Distancia recorrida en metros';
COMMENT ON COLUMN scum_player_stats.last_seen IS 'Última vez que el jugador estuvo online';


-- ============================================
-- TABLA: humanitz_player_stats
-- ============================================
-- Estadísticas de jugadores en servidores de HumanitZ.
-- Similar a scum_player_stats pero con métricas específicas
-- del juego HumanitZ (bases construidas, misiones, etc).
-- Se sincroniza periódicamente desde el servidor de juego.

CREATE TABLE IF NOT EXISTS humanitz_player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  playtime_minutes INT DEFAULT 0,
  zombies_killed INT DEFAULT 0,
  bases_built INT DEFAULT 0,
  missions_completed INT DEFAULT 0,
  last_seen TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT humanitz_player_stats_unique UNIQUE (user_id, server_id)
);

COMMENT ON TABLE humanitz_player_stats IS 'Estadísticas de jugadores en servidores HumanitZ';
COMMENT ON COLUMN humanitz_player_stats.bases_built IS 'Número de bases construidas';
COMMENT ON COLUMN humanitz_player_stats.missions_completed IS 'Misiones completadas en el servidor';


-- ============================================
-- TABLA: scum_auction_listings
-- ============================================
-- Sistema de subastas/mercado in-game para SCUM.
-- Permite a jugadores listar items para vender por moneda del juego.
-- El estado de cada listing puede ser:
--   - 'active': Disponible para comprar
--   - 'sold': Vendido a otro jugador
--   - 'expired': Expiró sin venderse
--   - 'cancelled': Cancelado por el vendedor
-- item_data (JSONB) almacena detalles específicos del item.

CREATE TABLE IF NOT EXISTS scum_auction_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_category TEXT,
  item_data JSONB DEFAULT '{}',
  price INT NOT NULL,
  status TEXT DEFAULT 'active',
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  CONSTRAINT scum_auction_status_check CHECK (status IN ('active', 'sold', 'expired', 'cancelled')),
  CONSTRAINT scum_auction_category_check CHECK (item_category IN ('weapons', 'vehicles', 'gear', 'resources'))
);

COMMENT ON TABLE scum_auction_listings IS 'Mercado/subastas de items in-game para SCUM';
COMMENT ON COLUMN scum_auction_listings.price IS 'Precio en moneda del juego (no real)';
COMMENT ON COLUMN scum_auction_listings.item_data IS 'Datos adicionales del item en formato JSON';
COMMENT ON COLUMN scum_auction_listings.expires_at IS 'Fecha de expiración del listing';


-- ============================================
-- TABLA: achievements
-- ============================================
-- Sistema de logros/achievements de la comunidad.
-- Los logros pueden ser:
--   - Globales (game_id = NULL): Aplican a toda la plataforma
--   - Por juego (game_id = UUID): Específicos de un juego
-- Categorías: combat, social, subscription, milestone, exploration
-- Los logros secretos (is_secret = true) no muestran descripción
-- hasta ser desbloqueados.

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points INT DEFAULT 0,
  category TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT achievements_category_check CHECK (category IN ('combat', 'social', 'subscription', 'milestone', 'exploration'))
);

COMMENT ON TABLE achievements IS 'Sistema de logros de la comunidad MindBreakers';
COMMENT ON COLUMN achievements.game_id IS 'NULL para logros globales, UUID para logros específicos de un juego';
COMMENT ON COLUMN achievements.points IS 'Puntos que otorga el logro al perfil del usuario';
COMMENT ON COLUMN achievements.is_secret IS 'Logros secretos no muestran descripción hasta desbloquearse';


-- ============================================
-- TABLA: user_achievements
-- ============================================
-- Relación entre usuarios y logros desbloqueados.
-- Cada registro representa un logro que un usuario ha obtenido.
-- El campo metadata (JSONB) puede almacenar contexto adicional,
-- como en qué servidor se desbloqueó o estadísticas relacionadas.

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,

  CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id)
);

COMMENT ON TABLE user_achievements IS 'Logros desbloqueados por cada usuario';
COMMENT ON COLUMN user_achievements.metadata IS 'Contexto adicional del desbloqueo (servidor, stats, etc)';


-- ============================================
-- ÍNDICES
-- ============================================
-- Índices para optimizar queries frecuentes.
-- Cada índice está diseñado para casos de uso específicos
-- del frontend y backend.

-- Índices para users
-- Búsqueda rápida por plataformas vinculadas
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON users(steam_id) WHERE steam_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id) WHERE discord_id IS NOT NULL;

-- Índices para servers
-- Filtrar servidores por juego y estado (muy frecuente en homepage)
CREATE INDEX IF NOT EXISTS idx_servers_game_id ON servers(game_id);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_game_status ON servers(game_id, status);

-- Índices para subscriptions
-- Verificar suscripción activa de un usuario (muy frecuente)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at) WHERE status = 'active';

-- Índices para scum_player_stats
-- Leaderboards y perfil de usuario
CREATE INDEX IF NOT EXISTS idx_scum_stats_user_id ON scum_player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_scum_stats_server_id ON scum_player_stats(server_id);
CREATE INDEX IF NOT EXISTS idx_scum_stats_kills ON scum_player_stats(kills DESC);
CREATE INDEX IF NOT EXISTS idx_scum_stats_playtime ON scum_player_stats(playtime_minutes DESC);

-- Índices para humanitz_player_stats
-- Leaderboards y perfil de usuario
CREATE INDEX IF NOT EXISTS idx_humanitz_stats_user_id ON humanitz_player_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_humanitz_stats_server_id ON humanitz_player_stats(server_id);
CREATE INDEX IF NOT EXISTS idx_humanitz_stats_kills ON humanitz_player_stats(kills DESC);

-- Índices para scum_auction_listings
-- Navegación del marketplace
CREATE INDEX IF NOT EXISTS idx_auction_server_id ON scum_auction_listings(server_id);
CREATE INDEX IF NOT EXISTS idx_auction_seller_id ON scum_auction_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_auction_status ON scum_auction_listings(status);
CREATE INDEX IF NOT EXISTS idx_auction_category ON scum_auction_listings(item_category) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_auction_expires ON scum_auction_listings(expires_at) WHERE status = 'active';

-- Índices para user_achievements
-- Mostrar logros de un usuario
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);


-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
-- Próximos pasos (en migraciones separadas):
--   - 002_rls_policies.sql: Row Level Security policies
--   - 003_triggers.sql: Triggers para updated_at, etc
--   - 004_seed_data.sql: Datos iniciales (games, tiers, achievements)
-- ============================================
