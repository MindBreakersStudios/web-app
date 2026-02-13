# Testing Guide - Authentication & Whitelist System

## 🚀 Quick Start

### 1. Start the Development Server

```bash
cd C:\Users\lucia\Documents\MindBreakers\web-app
npm run dev
```

Then open: http://localhost:5173

---

## 🔐 Testing Authentication

### A. Register a New Account

1. Click the **"Login"** button in the top-right corner
2. Click **"Sign Up"** at the bottom of the modal
3. Fill in:
   - Display Name: `TestUser`
   - Email: `test@mindbreakers.net`
   - Password: `password123` (minimum 6 characters)
4. Click **"Create Account"**
5. You should see a success message
6. The form will switch to Login mode automatically

### B. Login with Email/Password

1. Click **"Login"** button
2. Enter:
   - Email: `test@mindbreakers.net`
   - Password: `password123`
3. Click **"Sign In"**
4. You should be logged in and see your email in the header

### C. Test Discord OAuth (requires setup)

1. Click **"Login"** button
2. Click the **Discord** button
3. You'll be redirected to Discord for authorization
4. After approval, you'll be redirected back and logged in

**Note:** Requires Discord OAuth configuration in Supabase (see `DISCORD_AUTH_SETUP.md`)

### D. Test Steam OpenID (requires setup)

1. Click **"Login"** button
2. Click the **Steam** button
3. You'll be redirected to Steam for authentication
4. After approval, you'll be redirected back and logged in

**Note:** Requires Steam edge functions deployed (see `STEAM_AUTH_SETUP.md`)

---

## 👤 Testing User Profile

### View Your Profile

1. After logging in, click on your **email** in the top-right
2. Click **"Profile Settings"**
3. You should see your profile page with:
   - User information
   - Steam ID linking option
   - Account settings

---

## 👑 Testing Admin Features

### Make Yourself Admin

```bash
# Connect to local Supabase
cd C:\Users\lucia\Documents\MindBreakers\web-app
npx supabase db reset  # Optional: reset if needed
```

Then manually set admin flag:

```sql
-- In Supabase Studio (http://localhost:54323)
-- Or via SQL:
UPDATE public.users
SET is_admin = TRUE
WHERE email = 'test@mindbreakers.net';
```

### Verify Admin Badge

1. Refresh the page
2. You should see a yellow **"ADMIN"** badge next to your email in the header
3. This indicates you have admin privileges

---

## 🎮 Testing Whitelist System

### Database Setup

```bash
# Make sure all migrations are applied
cd C:\Users\lucia\Documents\MindBreakers\web-app
npx supabase migration up
```

### Add User to Whitelist (via SQL)

```sql
-- Get game ID for HumanitZ
SELECT id FROM games WHERE slug = 'humanitz';

-- Add user to whitelist
INSERT INTO whitelist (user_id, game_id, steam_id, is_active, reason)
VALUES (
  (SELECT id FROM users WHERE email = 'test@mindbreakers.net'),
  (SELECT id FROM games WHERE slug = 'humanitz'),
  '76561198012345678',  -- Replace with real Steam ID
  TRUE,
  'Test player'
);
```

### Test Whitelist Check (via RPC)

```sql
-- Check if Steam ID is whitelisted
SELECT is_steam_id_whitelisted('76561198012345678', 'humanitz');
-- Should return: TRUE

-- Check if user is whitelisted
SELECT is_user_whitelisted(
  (SELECT id FROM users WHERE email = 'test@mindbreakers.net'),
  'humanitz'
);
-- Should return: TRUE
```

### Test Whitelist via API (in browser console)

```javascript
// After logging in, open browser console (F12)
const { data, error } = await window.supabase
  .rpc('is_user_whitelisted', {
    p_user_id: 'YOUR-USER-ID',  // Get from auth.users
    p_game_slug: 'humanitz'
  });

console.log('Whitelisted:', data);  // Should be true/false
```

---

## 🔍 Testing Whitelist Integration with LogWatcher

### Configure LogWatcher

```bash
cd C:\Users\lucia\Documents\MindBreakers\scripts\server-scripts\log-watcher

# Copy .env.example to .env
copy .env.example .env

# Edit .env and set:
WHITELIST_ENABLED=true
WHITELIST_CACHE_VALIDITY_MS=60000
WHITELIST_REFRESH_INTERVAL_MS=300000
WHITELIST_KICK_DELAY_MS=30000
```

### Run LogWatcher (simulation)

```bash
# Install dependencies
npm install

# Run LogWatcher
npx tsx logWatcher.ts
```

### Expected Behavior

When a player connects:

1. **Whitelisted Player:**
   ```
   [PLAYER] ➡️ TestUser connected (76561198012345678)
   [INFO] ✅ Player TestUser is whitelisted
   [DEBUG] Registered connection for TestUser
   ```

2. **Non-Whitelisted Player:**
   ```
   [PLAYER] ➡️ NewPlayer connected (76561198099999999)
   [WARN] ⚠️ Player NewPlayer (76561198099999999) is NOT whitelisted - scheduling kick
   [After 30 seconds...]
   [WARN] 🚫 Kicking NewPlayer (76561198099999999) - not whitelisted
   ```

3. **Player Added During Grace Period:**
   ```
   [PLAYER] ➡️ NewPlayer connected (76561198099999999)
   [WARN] ⚠️ Player NewPlayer is NOT whitelisted - scheduling kick
   [Admin adds them to whitelist within 30 seconds]
   [INFO] ✅ Player NewPlayer was whitelisted during grace period
   [DEBUG] Registered connection for NewPlayer
   ```

---

## 🛠️ Debugging Tools

### Check Supabase Studio

```bash
# Start Supabase (if not already running)
cd C:\Users\lucia\Documents\MindBreakers\web-app
npx supabase start
```

Open: http://localhost:54323

- **Table Editor:** View users, whitelist entries
- **SQL Editor:** Run test queries
- **Auth:** View registered users
- **Logs:** Check real-time activity

### Check Browser Console

Open DevTools (F12) and look for:
- `[HEADER] Auth state:` - Current user info
- `[AUTH]` - Authentication events
- `[WHITELIST]` - Whitelist checks

### Check LogWatcher Logs

```bash
# View cache stats
[WhitelistService] Refreshing whitelist cache...
[WhitelistService] Cache refreshed: 5 active entries
[WhitelistService] Cache stats: { total: 5, active: 5, expired: 0, hit_rate: 0.97 }
```

---

## ✅ Test Checklist

### Authentication:
- [ ] Register new account with email/password
- [ ] Login with email/password
- [ ] Logout
- [ ] View profile page
- [ ] See loading state during auth check
- [ ] Test Discord OAuth (if configured)
- [ ] Test Steam OpenID (if configured)

### Admin Features:
- [ ] Set user as admin via SQL
- [ ] See admin badge in header
- [ ] Verify admin can access RPC functions

### Whitelist System:
- [ ] Create whitelist entry via SQL
- [ ] Check whitelist status via RPC
- [ ] Test `is_steam_id_whitelisted()` function
- [ ] Test `is_user_whitelisted()` function
- [ ] Verify cache is working (LogWatcher logs)

### LogWatcher Integration:
- [ ] Configure environment variables
- [ ] Start LogWatcher successfully
- [ ] See "Whitelist: Enabled" in startup logs
- [ ] Simulate player connection (whitelisted)
- [ ] Simulate player connection (not whitelisted)
- [ ] Verify kick after grace period
- [ ] Test adding player during grace period

---

## 🐛 Troubleshooting

### "Login button not visible"
- Clear browser cache (Ctrl+Shift+R)
- Check if dev server is running
- Verify Header.tsx changes are saved

### "Can't connect to Supabase"
```bash
npx supabase status
# If not running:
npx supabase start
```

### "Whitelist check always returns false"
- Check migration applied: `npx supabase migration list`
- Verify game exists: `SELECT * FROM games WHERE slug = 'humanitz'`
- Check whitelist table: `SELECT * FROM whitelist`

### "Admin badge not showing"
- Clear browser cache
- Check SQL: `SELECT is_admin FROM users WHERE email = 'your@email.com'`
- Verify useAuth hook is loading admin status

---

## 📚 Related Documentation

- **WHITELIST_SYSTEM.md** - Complete whitelist system architecture
- **WHITELIST_INTEGRATION.md** - LogWatcher integration guide
- **DISCORD_AUTH_SETUP.md** - Discord OAuth configuration
- **STEAM_AUTH_SETUP.md** - Steam OpenID configuration
- **SPRINT_1_COMPLETE.md** - Sprint 1 summary (triggers, RLS, OAuth)

---

## 🎉 Success Criteria

You should be able to:
1. ✅ See login button in header
2. ✅ Register and login with email/password
3. ✅ See your email in header when logged in
4. ✅ Access profile page
5. ✅ Set yourself as admin and see badge
6. ✅ Add users to whitelist via SQL
7. ✅ Check whitelist status via RPC functions
8. ✅ Run LogWatcher with whitelist checking enabled
9. ✅ See whitelist checks in logs

**Everything is ready to test!** 🚀
