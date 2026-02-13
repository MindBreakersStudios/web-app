# Authentication Setup Guide

## Overview

MindBreakers supports three authentication methods:
1. **Email/Password** - Direct registration (no configuration needed)
2. **Discord OAuth** - Social login (requires Discord app setup)
3. **Steam OpenID** - Gaming platform authentication (requires edge functions)

---

## ✅ Email/Password Authentication (Ready)

**Status:** Works out of the box with local Supabase

### How it Works:
1. User registers with email/password
2. Supabase creates auth.users entry
3. Database trigger auto-creates users table entry
4. User can login immediately

### Testing:
```bash
# Start dev server
npm run dev

# Open http://localhost:5173
# Click "Login" → "Sign Up"
# Enter: test@mindbreakers.net / password123
# Register → Login
```

---

## ⚠️ Discord OAuth (Requires Setup)

**Status:** Requires Discord Developer Application configuration

### Setup Steps:

#### 1. Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: `MindBreakers` (or your choice)
4. Click **"Create"**

#### 2. Configure OAuth2
1. Go to **OAuth2** tab
2. Add Redirect URI:
   - Local: `http://127.0.0.1:54321/auth/v1/callback`
   - Production: `https://your-domain.com/auth/v1/callback`
3. Copy **Client ID** and **Client Secret**

#### 3. Configure Local Supabase
Edit `supabase/config.toml`:
```toml
[auth.external.discord]
enabled = true
client_id = "env(DISCORD_CLIENT_ID)"
secret = "env(DISCORD_CLIENT_SECRET)"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

Edit `.env.local`:
```bash
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

#### 4. Restart Supabase
```bash
npx supabase stop
npx supabase start
```

### Testing:
1. Click "Login" → "Discord" button
2. Authorize on Discord
3. Redirected back and logged in

---

## ⚙️ Steam OpenID (Requires Edge Functions)

**Status:** Edge functions available, needs local serving

### How Steam Authentication Works:

Steam uses OpenID 2.0 (different from OAuth2):

1. **User clicks Steam button**
   - Frontend calls: `/functions/v1/steam-auth?return_url=...`

2. **Edge function redirects to Steam**
   - Builds OpenID request
   - Redirects to: `https://steamcommunity.com/openid/login`

3. **User authenticates on Steam**
   - Steam validates identity
   - Redirects back to: `/functions/v1/steam-callback`

4. **Callback verifies and creates account**
   - Verifies OpenID signature
   - Extracts Steam ID
   - Creates/links Supabase account
   - Redirects to: `/auth/steam-callback` (frontend)

### Architecture:
```
┌─────────┐      ┌──────────────┐      ┌─────────┐
│ Frontend│─────>│ steam-auth   │─────>│  Steam  │
│         │      │ edge function│      │ OpenID  │
└─────────┘      └──────────────┘      └─────────┘
     ^                                       │
     │           ┌──────────────┐           │
     └───────────│steam-callback│<──────────┘
                 │ edge function│
                 └──────────────┘
```

### Setup for Local Development:

#### 1. Edge Functions Already Copied
```bash
# Functions are in:
web-app/supabase/functions/steam-auth/
web-app/supabase/functions/steam-callback/
```

#### 2. Configure Environment Variables

Create `supabase/functions/steam-auth/.env`:
```bash
# No API keys needed for Steam OpenID!
# Steam uses public OpenID endpoints
```

Create `supabase/functions/steam-callback/.env`:
```bash
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 3. Start Supabase (Auto-serves Functions)
```bash
npx supabase start
```

Functions will be served at:
- `http://127.0.0.1:54321/functions/v1/steam-auth`
- `http://127.0.0.1:54321/functions/v1/steam-callback`

#### 4. Test Steam Login
1. Click "Login" → "Steam" button
2. Should redirect to Steam
3. Authenticate on Steam
4. Redirected back and logged in

### Troubleshooting:

**Error: "404 Not Found" on steam-auth**
- Check if Supabase is running: `npx supabase status`
- Restart Supabase to load functions: `npx supabase stop && npx supabase start`

**Error: "Failed to verify Steam OpenID"**
- Check callback function has correct SUPABASE_URL
- Check SUPABASE_SERVICE_ROLE_KEY is set
- Verify return_url matches your domain

**Error: "No active session" (Old error)**
- Fixed! This was from using `initSecureLink()` which requires login
- Now uses edge function directly for initial sign-in

---

## Authentication Flow Summary

### Email/Password Flow:
```
User registers → Supabase Auth → Trigger creates user → Done
```

### Discord OAuth Flow:
```
Click Discord → Redirect to Discord → Authorize → Callback → Done
```

### Steam OpenID Flow:
```
Click Steam → Edge function → Steam OpenID → Verify → Create account → Done
```

---

## Database Schema

### auth.users (Supabase managed)
- Stores authentication credentials
- Managed by Supabase Auth

### public.users (Your app data)
- Auto-created by trigger on auth.users insert
- Stores profile data, admin flag, whitelist info

### Trigger:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Configuration Files

### Local Development:
- `supabase/config.toml` - OAuth providers
- `.env.local` - OAuth secrets
- `supabase/functions/*/.env` - Edge function config

### Production:
- Supabase Dashboard → Authentication → Providers
- Supabase Dashboard → Edge Functions → Secrets

---

## Testing Checklist

### Email/Password:
- [ ] Register new account
- [ ] Login with credentials
- [ ] See email in header
- [ ] Access profile page
- [ ] Logout

### Discord OAuth:
- [ ] Configure Discord app
- [ ] Add credentials to config
- [ ] Restart Supabase
- [ ] Click Discord button
- [ ] Authorize on Discord
- [ ] Redirected and logged in

### Steam OpenID:
- [ ] Edge functions copied
- [ ] Supabase restarted
- [ ] Click Steam button
- [ ] Redirected to Steam
- [ ] Authenticate on Steam
- [ ] Redirected and logged in
- [ ] Steam ID visible in profile

---

## Admin Features

### Set User as Admin:
```sql
-- Via Supabase Studio or SQL
UPDATE users
SET is_admin = TRUE
WHERE email = 'your@email.com';
```

### Admin Badge:
- Automatically shows in header
- Yellow badge: "ADMIN"
- Access to admin-only RPC functions

---

## Account Linking

Once logged in, users can link additional accounts:

### Link Steam to Existing Account:
1. Login with email/Discord
2. Go to Profile page
3. Click "Link Steam Account"
4. Authenticate on Steam
5. Steam ID added to profile

### Link Discord to Existing Account:
- Similar flow (future implementation)

---

## Production Deployment

### Discord OAuth:
1. Update redirect URI in Discord app
2. Add production domain
3. Update Supabase Dashboard → Auth → Providers

### Steam OpenID:
1. Deploy edge functions: `supabase functions deploy steam-auth`
2. Deploy edge functions: `supabase functions deploy steam-callback`
3. Set environment secrets in Supabase Dashboard
4. Update return URLs to production domain

---

## Security Notes

### Email/Password:
- Minimum 6 characters enforced
- Supabase handles hashing
- Session tokens in httpOnly cookies

### Discord OAuth:
- Client secret stored server-side only
- Tokens refreshed automatically
- RLS policies protect user data

### Steam OpenID:
- Public authentication (no API keys)
- Steam ID verified via OpenID signature
- Service role key required for account creation
- RLS policies prevent unauthorized access

---

## Related Documentation

- **DISCORD_AUTH_SETUP.md** - Detailed Discord configuration
- **STEAM_AUTH_SETUP.md** - Detailed Steam configuration
- **TESTING_GUIDE.md** - Complete testing instructions
- **WHITELIST_SYSTEM.md** - Whitelist architecture

---

## Status Summary

| Method | Status | Config Required | Works Locally | Works Production |
|--------|--------|----------------|---------------|------------------|
| Email/Password | ✅ Ready | No | ✅ | ✅ |
| Discord OAuth | ⚠️ Setup Required | Yes | ⚠️ | ⚠️ |
| Steam OpenID | 🔧 Functions Ready | Minimal | 🔧 | 🔧 |

**Legend:**
- ✅ Ready to use
- ⚠️ Requires configuration
- 🔧 Requires edge function deployment

---

## Quick Start (TL;DR)

**For Email/Password (5 seconds):**
```bash
npm run dev
# Click Login → Register → Done
```

**For Discord (10 minutes):**
```bash
# 1. Create Discord app
# 2. Add credentials to .env.local
# 3. Update supabase/config.toml
# 4. npx supabase stop && npx supabase start
# 5. Test login
```

**For Steam (5 minutes):**
```bash
# Edge functions already copied
# 1. npx supabase stop && npx supabase start
# 2. Test login (should work!)
```

---

**Last Updated:** 2026-02-13
**Version:** 1.0
