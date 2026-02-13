-- =============================================
-- Migration: Game Events & Player Achievements
-- =============================================
-- Description: Add game event tracking from HMZLog.log and player-level
--              achievement system (separate from user_achievements which
--              requires a web account).
-- Author: MindBreakers Team
-- Date: 2026-02-15
--
-- Adds:
--   1A. players.death_count column
--   1B. player_achievements table (mirrors user_achievements but for players)
--   1C. game_events table (flexible event log)
--   1D. Seed 10 HumanitZ crafting achievements
--   1E. award_player_achievement() RPC
--   1F. record_player_death() RPC
--   1G. record_game_event() RPC
--   1H. RLS policies & grants
-- =============================================


-- =============================================
-- PART 1A: Add death_count to players
-- =============================================

ALTER TABLE players ADD COLUMN IF NOT EXISTS death_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN players.death_count IS
  'Total number of deaths tracked from HMZLog.log';


-- =============================================
-- PART 1B: player_achievements table
-- =============================================

CREATE TABLE IF NOT EXISTS player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,

  CONSTRAINT player_achievements_unique UNIQUE (player_id, achievement_id)
);

COMMENT ON TABLE player_achievements IS
  'Achievements unlocked by players (identified by steam_id, no web account required)';

CREATE INDEX IF NOT EXISTS idx_player_achievements_player_id
  ON player_achievements(player_id);

CREATE INDEX IF NOT EXISTS idx_player_achievements_achievement_id
  ON player_achievements(achievement_id);


-- =============================================
-- PART 1C: game_events table
-- =============================================

CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  steam_id TEXT,
  player_name TEXT NOT NULL,
  event_data JSONB,
  event_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT game_events_type_check CHECK (
    event_type IN ('structure_damage', 'player_death', 'damage_taken', 'lockpick', 'admin_access')
  )
);

COMMENT ON TABLE game_events IS
  'Flexible event log for all game events parsed from HMZLog.log';

-- Index: filter by type
CREATE INDEX IF NOT EXISTS idx_game_events_event_type
  ON game_events(event_type);

-- Index: paginated queries by type + timestamp
CREATE INDEX IF NOT EXISTS idx_game_events_type_timestamp
  ON game_events(event_type, event_timestamp DESC);

-- Index: per-player queries
CREATE INDEX IF NOT EXISTS idx_game_events_type_player_timestamp
  ON game_events(event_type, player_id, event_timestamp DESC);

-- Index: steam_id lookups
CREATE INDEX IF NOT EXISTS idx_game_events_steam_id
  ON game_events(steam_id);

-- Partial index: structure_damage queries (premium feature)
CREATE INDEX IF NOT EXISTS idx_game_events_structure_damage_timestamp
  ON game_events(event_timestamp DESC)
  WHERE event_type = 'structure_damage';


-- =============================================
-- PART 1D: Seed HumanitZ crafting achievements
-- =============================================

INSERT INTO achievements (game_id, slug, name, description, category, points, sort_order)
SELECT
  g.id,
  v.slug,
  v.name,
  v.description,
  v.category,
  v.points,
  v.sort_order
FROM (
  VALUES
    ('home-sweet-home',    'Home Sweet Home',    'Place your first Spawn Point',           'milestone',   50, 100),
    ('let-there-be-light', 'Let There Be Light', 'Build your first Campfire',              'exploration', 10, 101),
    ('getting-crafty',     'Getting Crafty',     'Build your first Workbench',             'milestone',   15, 102),
    ('pack-rat',           'Pack Rat',           'Build your first Storage Container',     'milestone',   10, 103),
    ('mad-scientist',      'Mad Scientist',      'Build your first Chemistry Station',     'milestone',   25, 104),
    ('locked-and-loaded',  'Locked and Loaded',  'Build your first Guns & Ammo Bench',     'combat',      30, 105),
    ('green-thumb',        'Green Thumb',        'Build your first Farm Plot',             'exploration', 20, 106),
    ('power-up',           'Power Up',           'Build your first Generator',             'milestone',   35, 107),
    ('grease-monkey',      'Grease Monkey',      'Build your first Vehicle Bench',         'milestone',   25, 108),
    ('fire-and-steel',     'Fire and Steel',     'Build your first Furnace',               'milestone',   20, 109)
) AS v(slug, name, description, category, points, sort_order)
CROSS JOIN (
  SELECT id FROM games WHERE slug = 'humanitz'
) AS g
ON CONFLICT (slug) DO NOTHING;


-- =============================================
-- PART 1E: award_player_achievement() RPC
-- =============================================

CREATE OR REPLACE FUNCTION award_player_achievement(
  p_steam_id TEXT,
  p_achievement_slug TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_achievement_id UUID;
  v_already_awarded BOOLEAN := FALSE;
BEGIN
  -- Resolve player via existing get_or_create_player
  v_player_id := get_or_create_player(p_steam_id);

  -- Resolve achievement by slug
  SELECT id INTO v_achievement_id
  FROM achievements
  WHERE slug = p_achievement_slug;

  IF v_achievement_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Achievement not found: ' || p_achievement_slug
    );
  END IF;

  -- Insert, ON CONFLICT DO NOTHING for idempotency
  INSERT INTO player_achievements (player_id, achievement_id, metadata)
  VALUES (v_player_id, v_achievement_id, p_metadata)
  ON CONFLICT (player_id, achievement_id) DO NOTHING;

  -- Check if it was already awarded (GET DIAGNOSTICS doesn't work with ON CONFLICT)
  IF NOT FOUND THEN
    v_already_awarded := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'success', TRUE,
    'already_awarded', v_already_awarded,
    'player_id', v_player_id,
    'achievement_id', v_achievement_id
  );
END;
$$;

COMMENT ON FUNCTION award_player_achievement(TEXT, TEXT, JSONB) IS
  'Idempotently awards a player achievement by steam_id and achievement slug';


-- =============================================
-- PART 1F: record_player_death() RPC
-- =============================================

CREATE OR REPLACE FUNCTION record_player_death(
  p_steam_id TEXT,
  p_player_name TEXT,
  p_game_id UUID,
  p_server_id UUID DEFAULT NULL,
  p_event_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
BEGIN
  -- Resolve player (create if needed)
  v_player_id := get_or_create_player(p_steam_id, p_player_name);

  -- Increment death count
  UPDATE players
  SET death_count = death_count + 1
  WHERE id = v_player_id;

  -- Insert game event
  INSERT INTO game_events (
    event_type, game_id, server_id, player_id, steam_id,
    player_name, event_data, event_timestamp
  ) VALUES (
    'player_death', p_game_id, p_server_id, v_player_id, p_steam_id,
    p_player_name, '{}'::JSONB, p_event_timestamp
  );

  RETURN jsonb_build_object(
    'success', TRUE,
    'player_id', v_player_id
  );
END;
$$;

COMMENT ON FUNCTION record_player_death(TEXT, TEXT, UUID, UUID, TIMESTAMPTZ) IS
  'Records a player death: increments death_count and inserts a game_event';


-- =============================================
-- PART 1G: record_game_event() RPC
-- =============================================

CREATE OR REPLACE FUNCTION record_game_event(
  p_event_type TEXT,
  p_steam_id TEXT,
  p_player_name TEXT,
  p_game_id UUID,
  p_server_id UUID DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}'::JSONB,
  p_event_timestamp TIMESTAMPTZ DEFAULT NOW()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_id UUID;
  v_event_id UUID;
BEGIN
  -- Resolve player_id from steam_id if available (SELECT only, no create)
  IF p_steam_id IS NOT NULL AND p_steam_id != '' THEN
    SELECT id INTO v_player_id
    FROM players
    WHERE steam_id = p_steam_id;
  END IF;

  INSERT INTO game_events (
    event_type, game_id, server_id, player_id, steam_id,
    player_name, event_data, event_timestamp
  ) VALUES (
    p_event_type, p_game_id, p_server_id, v_player_id, NULLIF(p_steam_id, ''),
    p_player_name, p_event_data, p_event_timestamp
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

COMMENT ON FUNCTION record_game_event(TEXT, TEXT, TEXT, UUID, UUID, JSONB, TIMESTAMPTZ) IS
  'Generic game event insert. Resolves player_id from steam_id if available.';


-- =============================================
-- PART 1H: RLS policies
-- =============================================

-- player_achievements
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read player achievements"
  ON player_achievements FOR SELECT
  USING (true);

CREATE POLICY "Only service role can manage player achievements"
  ON player_achievements FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- game_events
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game events"
  ON game_events FOR SELECT
  USING (true);

CREATE POLICY "Only service role can manage game events"
  ON game_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');


-- =============================================
-- PART 1H (cont): Grants
-- =============================================

GRANT SELECT ON player_achievements TO anon, authenticated;
GRANT SELECT ON game_events TO anon, authenticated;

GRANT EXECUTE ON FUNCTION award_player_achievement(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION record_player_death(TEXT, TEXT, UUID, UUID, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION record_game_event(TEXT, TEXT, TEXT, UUID, UUID, JSONB, TIMESTAMPTZ) TO authenticated;


-- =============================================
-- PART 1H (cont): Documentation
-- =============================================

COMMENT ON POLICY "Anyone can read player achievements" ON player_achievements IS
  'Player achievements are public for profiles and leaderboards';

COMMENT ON POLICY "Only service role can manage player achievements" ON player_achievements IS
  'Only the LogWatcher service (service_role) can award achievements';

COMMENT ON POLICY "Anyone can read game events" ON game_events IS
  'Game events are public for dashboards and alerts';

COMMENT ON POLICY "Only service role can manage game events" ON game_events IS
  'Only the LogWatcher service (service_role) can write game events';


-- =============================================
-- Verification
-- =============================================

DO $$
DECLARE
  v_has_death_count BOOLEAN;
  v_has_player_achievements BOOLEAN;
  v_has_game_events BOOLEAN;
  v_achievement_count INTEGER;
  v_has_award_fn BOOLEAN;
  v_has_death_fn BOOLEAN;
  v_has_event_fn BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'death_count'
  ) INTO v_has_death_count;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'player_achievements'
  ) INTO v_has_player_achievements;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'game_events'
  ) INTO v_has_game_events;

  SELECT COUNT(*) INTO v_achievement_count
  FROM achievements
  WHERE slug IN (
    'home-sweet-home', 'let-there-be-light', 'getting-crafty', 'pack-rat',
    'mad-scientist', 'locked-and-loaded', 'green-thumb', 'power-up',
    'grease-monkey', 'fire-and-steel'
  );

  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'award_player_achievement'
  ) INTO v_has_award_fn;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'record_player_death'
  ) INTO v_has_death_fn;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE routine_name = 'record_game_event'
  ) INTO v_has_event_fn;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Game Events & Achievements Migration';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'players.death_count: %', v_has_death_count;
  RAISE NOTICE 'player_achievements table: %', v_has_player_achievements;
  RAISE NOTICE 'game_events table: %', v_has_game_events;
  RAISE NOTICE 'Seeded achievements: %/10', v_achievement_count;
  RAISE NOTICE 'award_player_achievement(): %', v_has_award_fn;
  RAISE NOTICE 'record_player_death(): %', v_has_death_fn;
  RAISE NOTICE 'record_game_event(): %', v_has_event_fn;
  RAISE NOTICE '========================================';
END $$;


-- =============================================
-- END OF MIGRATION
-- =============================================
