# Discord Authentication Setup Guide

## Overview

This guide walks through setting up Discord OAuth authentication in Supabase for MindBreakers. Discord auth allows users to sign in with their Discord account and automatically link their profile.

---

## Prerequisites

1. Discord Developer Account (free)
2. Supabase project (local or production)
3. Admin access to Supabase Dashboard

---

## Step 1: Create Discord Application

### 1.1 Go to Discord Developer Portal
- Visit: https://discord.com/developers/applications
- Click **"New Application"**
- Name: `MindBreakers` (or your preferred name)
- Click **"Create"**

### 1.2 Get OAuth2 Credentials
- Click on your new application
- Go to **OAuth2 > General** in the left sidebar
- Copy the following:
  - **Client ID** (example: `1234567890123456789`)
  - **Client Secret** (click "Reset Secret" if needed, then copy)

### 1.3 Configure Redirect URLs
In the OAuth2 settings, add redirect URLs:

**For Local Development:**
```
http://127.0.0.1:54321/auth/v1/callback
```

**For Production:**
```
https://flwgrttppsnsfmigblvz.supabase.co/auth/v1/callback
```

Replace `flwgrttppsnsfmigblvz` with your actual Supabase project reference.

Click **"Save Changes"**

---

## Step 2: Configure Supabase (Local Development)

### 2.1 Update Local Supabase Config

Edit `supabase/config.toml`:

```toml
[auth.external.discord]
enabled = true
client_id = "YOUR_DISCORD_CLIENT_ID"
secret = "YOUR_DISCORD_CLIENT_SECRET"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

### 2.2 Restart Local Supabase

```bash
supabase stop
supabase start
```

---

## Step 3: Configure Supabase (Production)

### 3.1 Open Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Select your project
- Navigate to **Authentication > Providers**

### 3.2 Enable Discord Provider
- Find **Discord** in the provider list
- Toggle **"Enable Discord"** to ON
- Fill in the form:
  - **Discord Client ID**: (paste from Discord Developer Portal)
  - **Discord Secret**: (paste from Discord Developer Portal)
- Click **"Save"**

---

## Step 4: Test Authentication Flow

### 4.1 Frontend Implementation

The Discord login button is already implemented in the codebase. Users click the button and are redirected to Discord's OAuth consent screen.

**Example usage (already in code):**
```typescript
import { supabase } from './lib/supabase';

async function loginWithDiscord() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: window.location.origin + '/auth/callback',
    },
  });

  if (error) console.error('Discord login error:', error);
}
```

### 4.2 Test Flow
1. Click "Sign in with Discord" button
2. Authorize the MindBreakers application on Discord
3. Get redirected back to your app
4. User profile is auto-created via database trigger
5. User is authenticated

---

## Step 5: Database Integration

### 5.1 Auto-Profile Creation
The database trigger `handle_new_user()` automatically creates a user profile when Discord authentication succeeds.

### 5.2 Discord ID Linking
The user's Discord ID is stored in `users.discord_id` column for future reference and linking.

### 5.3 Verify in Database
```sql
SELECT id, username, email, discord_id, created_at
FROM users
WHERE discord_id IS NOT NULL;
```

---

## Troubleshooting

### Issue: "Invalid redirect_uri"
**Solution:** Ensure the redirect URI in Discord Developer Portal exactly matches the Supabase callback URL. Include the protocol (`http://` or `https://`).

### Issue: "Client secret invalid"
**Solution:** Reset the client secret in Discord Developer Portal and update it in Supabase config.

### Issue: "Provider not enabled"
**Solution:** Verify Discord is enabled in Supabase Dashboard > Authentication > Providers.

### Issue: User profile not created
**Solution:** Check that the `on_auth_user_created` trigger is installed:
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

---

## Security Considerations

1. **Never commit client secrets** - Store in `.env` files (gitignored)
2. **Use HTTPS in production** - Discord requires HTTPS for production redirect URIs
3. **Validate redirect URIs** - Only whitelist your actual domains
4. **Rotate secrets regularly** - Update client secret every 6-12 months
5. **Monitor failed logins** - Check Supabase logs for suspicious activity

---

## Environment Variables

### Local Development (.env.local)
```bash
# Discord OAuth (optional, handled by config.toml)
VITE_DISCORD_CLIENT_ID=your_discord_client_id
```

### Production (.env)
```bash
# Discord OAuth is configured in Supabase Dashboard
# No need for environment variables in frontend
```

---

## API Scopes

Discord OAuth automatically requests these scopes:
- `identify` - Get user ID, username, avatar
- `email` - Get user email address

These are configured in Supabase and cannot be customized without custom OAuth flow.

---

## User Data Mapping

Discord provides these fields that map to our `users` table:

| Discord Field | Users Table Column | Notes |
|---------------|-------------------|-------|
| `id` | `discord_id` | Unique Discord user ID |
| `email` | `email` | User's email address |
| `username` | `username` | Discord username |
| `avatar` | `avatar_url` | Discord avatar URL |

---

## Next Steps

After Discord authentication is working:

1. ✅ Test login flow with real Discord account
2. ✅ Verify user profile is created in database
3. ✅ Test profile linking (if user already has account)
4. ⏭️ Implement Steam authentication (next task)
5. ⏭️ Add user dashboard with linked accounts display

---

## References

- [Discord OAuth2 Documentation](https://discord.com/developers/docs/topics/oauth2)
- [Supabase Auth Providers](https://supabase.com/docs/guides/auth/social-login/auth-discord)
- [Discord Developer Portal](https://discord.com/developers/applications)

---

**Status:** Ready for implementation
**Estimated Setup Time:** 10-15 minutes
**Difficulty:** Easy (configuration-only, no code required)
