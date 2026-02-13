# Whitelist System Documentation

## Overview

The MindBreakers whitelist system manages server access control on a per-game basis. Admins can add/remove users from game whitelists, and the LogWatcher service automatically checks whitelist status when players connect.

---

## Features

### For Admins
- ✅ Add users to game whitelist
- ✅ Remove users from whitelist
- ✅ Set temporary whitelist (with expiration)
- ✅ Add reason/notes for whitelist entries
- ✅ View all whitelist entries per game
- ✅ Edit user profiles (username, streamer status, etc.)
- ✅ Manage admin roles

### For Users
- ✅ Check their own whitelist status
- ✅ See which games they have access to
- ✅ View whitelist expiration (if temporary)

### For LogWatcher
- ✅ Real-time whitelist checking via Supabase
- ✅ In-memory cache for performance
- ✅ Periodic cache refresh
- ✅ Expired entry cleanup

---

## Database Schema

### `whitelist` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users table |
| `game_id` | UUID | Foreign key to games table |
| `steam_id` | TEXT | Player's Steam ID |
| `is_active` | BOOLEAN | Whether whitelist entry is active |
| `added_by` | UUID | Admin who added this entry |
| `added_at` | TIMESTAMPTZ | When entry was added |
| `expires_at` | TIMESTAMPTZ | Optional expiration date |
| `reason` | TEXT | Reason for whitelist (streamer, VIP, etc.) |
| `admin_notes` | TEXT | Internal notes for admins |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- Unique: `(user_id, game_id)` - One whitelist entry per user per game
- Unique: `(steam_id, game_id)` - One Steam ID per game

**Indexes:**
- `idx_whitelist_user_game` - For user whitelist lookups
- `idx_whitelist_steam_game` - For Steam ID lookups (LogWatcher)
- `idx_whitelist_game_active` - For active whitelist queries
- `idx_whitelist_expires` - For expiration cleanup

### `users` Table (Admin Columns)

| Column | Type | Description |
|--------|------|-------------|
| `is_admin` | BOOLEAN | Whether user has admin privileges |
| `admin_notes` | TEXT | Internal notes about user (admin only) |

---

## RPC Functions

### 1. `is_user_whitelisted(user_id, game_slug)`
**Purpose:** Check if a user is whitelisted for a game
**Access:** Public (authenticated users)
**Returns:** BOOLEAN

```sql
SELECT is_user_whitelisted(
  'user-uuid-here',
  'humanitz'
);
-- Returns: true or false
```

### 2. `is_steam_id_whitelisted(steam_id, game_slug)`
**Purpose:** Check if a Steam ID is whitelisted (used by LogWatcher)
**Access:** Public (including service role)
**Returns:** BOOLEAN

```sql
SELECT is_steam_id_whitelisted(
  '76561198123456789',
  'scum'
);
-- Returns: true or false
```

### 3. `get_game_whitelist(game_slug)`
**Purpose:** Get all whitelist entries for a game
**Access:** Admins only
**Returns:** Table of whitelist entries

```sql
SELECT * FROM get_game_whitelist('humanitz');
-- Returns: steam_id, user_id, username, email, is_active, expires_at, reason, added_at, added_by_username
```

### 4. `add_to_whitelist(user_id, game_slug, reason?, expires_at?, admin_notes?)`
**Purpose:** Add a user to game whitelist
**Access:** Admins only
**Returns:** JSONB with success/error

```sql
SELECT add_to_whitelist(
  'user-uuid-here',
  'humanitz',
  'Verified streamer',
  NULL, -- No expiration
  'Approved by admin team'
);
-- Returns: {"success": true, "whitelist_id": "...", ...}
```

### 5. `remove_from_whitelist(user_id, game_slug)`
**Purpose:** Remove a user from whitelist (soft delete)
**Access:** Admins only
**Returns:** JSONB with success/error

```sql
SELECT remove_from_whitelist(
  'user-uuid-here',
  'humanitz'
);
-- Returns: {"success": true, "user_id": "...", ...}
```

### 6. `cleanup_expired_whitelist()`
**Purpose:** Deactivate expired whitelist entries
**Access:** Service role (cron job)
**Returns:** INTEGER (count of deactivated entries)

```sql
SELECT cleanup_expired_whitelist();
-- Returns: 5 (deactivated 5 expired entries)
```

---

## Row Level Security (RLS)

### Whitelist Table Policies

1. **Users can see own whitelist status**
   ```sql
   auth.uid() = user_id
   ```

2. **Admins can see all whitelist entries**
   ```sql
   EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)
   ```

3. **Admins can manage whitelist**
   - Full CRUD access for admin users

4. **Service role has full access**
   - Backend operations (LogWatcher, cleanup jobs)

### Users Table Admin Policies

1. **Admins can see all users**
   - View all user profiles

2. **Admins can update users**
   - Edit usernames, streamer status, etc.
   - **Cannot** directly set `is_admin` (security measure)

---

## Admin Dashboard UI

### Components Needed

#### 1. User Management Page (`/admin/users`)
```typescript
// Features:
- List all users (paginated)
- Search by username/email/Steam ID
- Filter by: is_admin, is_streamer, has_steam_id
- Edit user profile (username, avatar, streamer status)
- Add/remove from whitelist
- View user's whitelist entries
```

#### 2. Whitelist Management Page (`/admin/whitelist`)
```typescript
// Features:
- Filter by game
- List all whitelist entries
- Add user to whitelist (with reason, expiration)
- Remove from whitelist
- Bulk actions (add multiple, export list)
```

#### 3. User Whitelist Status (`/dashboard/whitelist`)
```typescript
// Features (for regular users):
- View own whitelist status
- See which games they have access to
- See expiration dates (if temporary)
- Request whitelist access (form for admins)
```

---

## LogWatcher Integration

### WhitelistService Class

**File:** `scripts/server-scripts/log-watcher/WhitelistService.ts`

**Features:**
- In-memory cache of whitelist entries
- Periodic refresh from Supabase
- Async whitelist checking
- Expiration handling
- Performance optimized

**Usage:**
```typescript
import { WhitelistService } from './WhitelistService';

const whitelistService = new WhitelistService(
  supabase,
  'humanitz', // game slug
  60000 // cache validity (1 minute)
);

// Start periodic refresh (5 minutes)
whitelistService.startPeriodicRefresh(300000);

// Check if player is whitelisted
const isAllowed = await whitelistService.isWhitelisted('76561198123456789');

if (!isAllowed) {
  console.log('Player not whitelisted - kicking from server');
  kickPlayer(steamId);
}
```

### Environment Variables

Add to `.env` for LogWatcher:

```bash
# Whitelist Configuration
WHITELIST_ENABLED=true
WHITELIST_CACHE_VALIDITY_MS=60000     # 1 minute
WHITELIST_REFRESH_INTERVAL_MS=300000  # 5 minutes
WHITELIST_KICK_DELAY_MS=30000         # 30 seconds (grace period)
```

---

## Admin API Examples

### Frontend Integration

#### Add User to Whitelist
```typescript
async function addToWhitelist(userId: string, gameSlug: string) {
  const { data, error } = await supabase.rpc('add_to_whitelist', {
    p_user_id: userId,
    p_game_slug: gameSlug,
    p_reason: 'Verified streamer',
    p_expires_at: null, // Never expires
    p_admin_notes: 'Manually added by admin',
  });

  if (error) {
    console.error('Failed to add to whitelist:', error);
    return;
  }

  console.log('Added to whitelist:', data);
}
```

#### Remove from Whitelist
```typescript
async function removeFromWhitelist(userId: string, gameSlug: string) {
  const { data, error } = await supabase.rpc('remove_from_whitelist', {
    p_user_id: userId,
    p_game_slug: gameSlug,
  });

  if (error) {
    console.error('Failed to remove from whitelist:', error);
    return;
  }

  console.log('Removed from whitelist:', data);
}
```

#### Check User's Own Status
```typescript
async function checkMyWhitelistStatus(gameSlug: string) {
  const { data: user } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase.rpc('is_user_whitelisted', {
    p_user_id: user.user.id,
    p_game_slug: gameSlug,
  });

  return data === true;
}
```

#### Get All Whitelist Entries (Admin)
```typescript
async function getGameWhitelist(gameSlug: string) {
  const { data, error } = await supabase.rpc('get_game_whitelist', {
    p_game_slug: gameSlug,
  });

  if (error) {
    console.error('Failed to get whitelist:', error);
    return [];
  }

  return data;
}
```

---

## Security Considerations

### Admin Role Management
- ✅ **Only superadmins can create admins** (manual database update required)
- ✅ **Admins cannot promote themselves** to superadmin
- ✅ **Admin actions are logged** (`added_by` field tracks who added whitelist entries)
- ✅ **RLS prevents direct admin column updates** (must use specific RPC functions)

### Whitelist Security
- ✅ **Users cannot whitelist themselves** (admin-only operation)
- ✅ **Service role enforced** for LogWatcher (separate API key)
- ✅ **Soft deletes** (is_active flag) preserve audit trail
- ✅ **Expiration enforced** both in database and cache

### Data Privacy
- ✅ **Users see only their own whitelist status** (RLS enforced)
- ✅ **Admin notes are not visible to users**
- ✅ **Steam IDs are only exposed to admins and service role**

---

## Migration & Deployment

### Apply Migration
```bash
# Local development
cd web-app
supabase db reset

# Production
supabase db push
```

### Create First Admin
```sql
-- Manually set a user as admin (in Supabase Studio or psql)
UPDATE users
SET is_admin = TRUE
WHERE email = 'admin@mindbreakers.gg';
```

### Deploy LogWatcher Update
```bash
cd scripts/server-scripts/log-watcher

# Update dependencies
npm install

# Update .env with whitelist settings
WHITELIST_ENABLED=true

# Restart service
pm2 restart logwatcher
```

---

## Maintenance

### Periodic Cleanup (Cron Job)
Run `cleanup_expired_whitelist()` daily to deactivate expired entries:

```sql
-- Add to cron job or scheduled function
SELECT cleanup_expired_whitelist();
```

**Using pg_cron (Supabase):**
```sql
SELECT cron.schedule(
  'cleanup-expired-whitelist',
  '0 2 * * *', -- Run at 2 AM daily
  $$SELECT cleanup_expired_whitelist()$$
);
```

---

## Troubleshooting

### User not whitelisted but should be
1. Check if entry exists: `SELECT * FROM whitelist WHERE steam_id = 'xxx'`
2. Check if entry is active: `is_active = TRUE`
3. Check if entry is expired: `expires_at > NOW() OR expires_at IS NULL`
4. Check Steam ID matches exactly (case-sensitive)

### Admin cannot add to whitelist
1. Verify user is admin: `SELECT is_admin FROM users WHERE id = 'xxx'`
2. Check RLS policies are enabled on whitelist table
3. Verify user has linked Steam ID

### LogWatcher not enforcing whitelist
1. Check `WHITELIST_ENABLED=true` in .env
2. Verify WhitelistService is initialized
3. Check cache statistics: `whitelistService.getCacheStats()`
4. Verify Supabase connection is working

---

## Future Enhancements

- [ ] Whitelist approval workflow (users request, admins approve)
- [ ] Bulk whitelist import (CSV upload)
- [ ] Whitelist history/audit log
- [ ] Discord bot integration (whitelist commands)
- [ ] Auto-whitelist for VIP subscribers
- [ ] Whitelist quotas per admin

---

**Status:** ✅ Complete and ready for production
**Version:** 1.0
**Last Updated:** 2026-02-12
