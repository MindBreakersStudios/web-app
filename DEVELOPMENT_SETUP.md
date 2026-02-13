# MindBreakers - Development Setup Guide

> 🎯 **Goal**: Develop safely against local Supabase, deploy to production when ready

---

## 🏗️ Development vs Production

### Production Environment ✅
- **Supabase URL**: `https://flwgrttppsnsfmigblvz.supabase.co`
- **Used by**: Live website, game servers, edge functions
- **Data**: Real player data, streamers, live connections
- **⚠️ NEVER develop directly against production!**

### Development Environment (Local) ✅
- **Supabase URL**: `http://127.0.0.1:54321`
- **Used by**: Local development on your machine
- **Data**: Test data, safe to experiment
- **✅ Safe to break things!**

---

## 🚀 Quick Start

### 1. Start Local Supabase

```bash
cd /c/Users/lucia/Documents/MindBreakers/web-app
supabase start
```

**This will**:
- ✅ Start local PostgreSQL database (port 54322)
- ✅ Start local API server (port 54321)
- ✅ Start Supabase Studio (port 54323)
- ✅ Apply all migrations automatically
- ✅ Seed database with test data

**Access points**:
- 🌐 **Studio**: http://127.0.0.1:54323 (database UI)
- 📡 **API**: http://127.0.0.1:54321
- 📬 **Mailpit**: http://127.0.0.1:54324 (test emails)

### 2. Start Web App

```bash
npm run dev
```

The web app will automatically use `.env.local` (local Supabase) if it exists.

### 3. Develop Safely!

You're now developing against your **local database**. Break things, experiment, and have fun!

---

## 📁 Environment Files

### `.env` (Production - Committed)
```env
VITE_SUPABASE_URL=https://flwgrttppsnsfmigblvz.supabase.co
VITE_SUPABASE_KEY=sb_publishable_O8XlfjVQhBJNZ_svqcEnUA_GOYRWWmx
```
- Used as fallback
- Safe to commit (public anon key)
- Used in production builds

### `.env.local` (Development - NOT Committed) ✅
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_DEV_MODE=true
```
- Used in local development
- In `.gitignore` (never committed)
- **Overrides `.env`** when present

---

## 🛠️ Common Commands

### Local Supabase Management

| Command | Description |
|---------|-------------|
| `supabase start` | Start local Supabase stack |
| `supabase stop` | Stop local Supabase (keeps data) |
| `supabase stop --no-backup` | Stop and delete all data |
| `supabase status` | Check if running and get URLs |
| `supabase db reset` | Reset database (apply all migrations fresh) |

### Database Operations

| Command | Description |
|---------|-------------|
| `supabase db diff` | Compare local vs production schema |
| `supabase db push` | Push local changes to production |
| `supabase migration new <name>` | Create new migration file |
| `supabase db reset` | Reset local DB and reapply migrations |

### Studio Access

```bash
# Open Supabase Studio in browser
start http://127.0.0.1:54323
```

**Studio Features**:
- 📊 Table Editor - View and edit data
- 🔍 SQL Editor - Run queries
- 🔐 Auth - Manage users
- 📦 Storage - File management
- ⚙️ Database - Schema viewer

---

## 🗄️ Database Setup

### Migrations

Your migrations are automatically applied when you run `supabase start`:

```
supabase/migrations/
├── 20250206120000_initial_schema.sql          # Base schema
├── 20260208000001_kick_live_status.sql        # Kick integration
├── 20260209000001_active_streamers_logwatcher.sql  # LogWatcher support
├── 20260209000002_fix_get_live_streamers.sql  # Functions
├── 20260209000004_users_master_restructure.sql # Players table
├── 20260209203342_twitch_integration.sql      # Twitch support
└── 20260210000001_fix_players_schema_and_functions.sql
```

### Seed Data

Test data is automatically seeded from `supabase/seed.sql`:
- Sample games (SCUM, HumanitZ)
- Sample servers
- Sample subscription tiers
- Sample achievements

---

## 🔄 Workflow Examples

### Starting Your Day

```bash
# 1. Start local Supabase
cd /c/Users/lucia/Documents/MindBreakers/web-app
supabase start

# 2. Start web app
npm run dev

# 3. Open browser to http://localhost:5173
```

### Creating a New Migration

```bash
# 1. Make changes in Studio or SQL Editor
# 2. Create migration file
supabase migration new add_whitelist_table

# 3. Edit the migration file
# supabase/migrations/20260212000001_add_whitelist_table.sql

# 4. Apply it locally
supabase db reset

# 5. Test your changes

# 6. Commit the migration
git add supabase/migrations/
git commit -m "feat: add whitelist table"
```

### Testing Edge Functions Locally

```bash
# Start Supabase (includes edge runtime)
supabase start

# Deploy function locally
supabase functions serve steam-auth

# Test it
curl -X POST http://127.0.0.1:54321/functions/v1/steam-auth \
  -H "Content-Type: application/json" \
  -d '{"steam_id": "76561198012345678"}'
```

### Resetting Your Local Database

```bash
# Reset everything (fresh start)
supabase db reset

# This will:
# - Drop all tables
# - Reapply all migrations
# - Run seed.sql
```

---

## 🚢 Deploying to Production

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Database > Migrations**
4. Review pending migrations
5. Click **Apply** to run them

### Option 2: Via CLI

```bash
# Link to production project
supabase link --project-ref flwgrttppsnsfmigblvz

# Push migrations
supabase db push

# Deploy edge functions
cd /c/Users/lucia/Documents/MindBreakers/scripts/edge-functions
supabase functions deploy kick-auth
supabase functions deploy twitch-auth
# etc...
```

---

## 🔍 Troubleshooting

### Port Already in Use

**Problem**: `Bind for 0.0.0.0:54322 failed: port is already allocated`

**Solution**:
```bash
supabase stop --project-id lucia
supabase start
```

### Migrations Not Applying

**Problem**: Changes not showing up

**Solution**:
```bash
# Hard reset
supabase db reset
```

### Wrong Environment

**Problem**: Accidentally using production

**Solution**:
1. Check `.env.local` exists and has local URL
2. Restart dev server: `npm run dev`
3. Verify in browser console: Check API calls go to `127.0.0.1`

### Docker Not Running

**Problem**: `Cannot connect to Docker daemon`

**Solution**:
1. Start Docker Desktop
2. Wait for it to fully start
3. Run `supabase start` again

---

## 📊 Verifying Your Setup

### Check Environment

```bash
# In web-app directory
cat .env.local
# Should show: VITE_SUPABASE_URL=http://127.0.0.1:54321
```

### Check Supabase Status

```bash
supabase status
# Should show all services running
```

### Check Web App

1. Open http://localhost:5173
2. Open browser DevTools (F12)
3. Check Network tab
4. API calls should go to `http://127.0.0.1:54321`

### Check Database

1. Open Supabase Studio: http://127.0.0.1:54323
2. Click **Table Editor**
3. You should see tables: `games`, `servers`, `players`, `connected_players`, etc.

---

## 🎯 Best Practices

### ✅ DO

- ✅ Always develop against local Supabase
- ✅ Test migrations locally before pushing
- ✅ Use `supabase db reset` frequently to test fresh setups
- ✅ Commit migration files to git
- ✅ Use Supabase Studio for quick data inspection
- ✅ Stop Supabase when not developing (`supabase stop`)

### ❌ DON'T

- ❌ Never develop directly against production
- ❌ Don't commit `.env.local` (it's gitignored)
- ❌ Don't manually edit production database
- ❌ Don't skip testing migrations locally
- ❌ Don't push untested edge functions to production

---

## 🚀 Next Steps

Now that your local environment is set up, you can:

1. **Start Sprint 1**:
   - Create database triggers (#2, #3)
   - Add RLS policies (#17)
   - Implement Discord auth (#9)
   - Implement Steam auth (#8)

2. **Explore your data**:
   - Open Supabase Studio: http://127.0.0.1:54323
   - Browse tables and run queries

3. **Test edge functions**:
   - Deploy to local edge runtime
   - Test with curl or Postman

---

## 📚 Resources

- [Supabase Local Development](https://supabase.com/docs/guides/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Migrations Guide](https://supabase.com/docs/guides/local-development/migrations)

---

**You're all set! Happy developing! 🎮**

© 2020-2026 MindBreakers
