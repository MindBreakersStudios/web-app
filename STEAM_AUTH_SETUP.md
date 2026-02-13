# Steam Authentication Setup Guide

## Overview

This guide explains how to set up Steam OpenID authentication for MindBreakers. Unlike Discord/Twitch which use OAuth2, Steam uses the older OpenID 2.0 protocol.

**Important:** Steam authentication requires edge functions deployed to Supabase. It cannot be configured purely through the Supabase Dashboard like Discord/Twitter OAuth.

---

## Prerequisites

1. Steam Web API Key (free)
2. Supabase project with edge functions enabled
3. Deployed edge functions: `steam-auth` and `steam-callback`

---

## Step 1: Get Steam Web API Key

### 1.1 Register for Steam Web API Key
- Visit: https://steamcommunity.com/dev/apikey
- Log in with your Steam account
- Fill in the form:
  - **Domain Name**: `mindbreakers.gg` (or your domain)
  - **Agreement**: Check the box to agree to Steam Web API Terms
- Click **"Register"**
- Copy your **Steam Web API Key** (64-character hex string)

**Note:** The API key is optional for basic authentication but recommended for fetching player names and avatars.

---

## Step 2: Deploy Edge Functions

### 2.1 Configure Supabase Secrets

Set the following secrets in Supabase Dashboard > Edge Functions > Secrets:

```bash
STEAM_API_KEY=your_steam_api_key_here
STEAM_CALLBACK_URL=https://yoursite.com/auth/steam/callback
FRONTEND_URL=https://yoursite.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**For Local Development:**
Create `supabase/.env.local`:
```bash
STEAM_API_KEY=your_steam_api_key_here
STEAM_CALLBACK_URL=http://localhost:5173/auth/steam/callback
FRONTEND_URL=http://localhost:5173
```

### 2.2 Deploy Edge Functions

From the `scripts/edge-functions/` directory:

```bash
# Deploy steam-auth function
supabase functions deploy steam-auth

# Deploy steam-callback function
supabase functions deploy steam-callback
```

Alternatively, from the web-app directory (if functions are linked):
```bash
cd /path/to/MindBreakers/web-app

# Link functions from scripts repo
ln -s ../../scripts/edge-functions/steam-auth supabase/functions/steam-auth
ln -s ../../scripts/edge-functions/steam-callback supabase/functions/steam-callback

# Deploy
supabase functions deploy steam-auth
supabase functions deploy steam-callback
```

---

## Step 3: Frontend Integration

### 3.1 Create Steam Login Button

```typescript
// Example: SteamLoginButton.tsx
import { useState } from 'react';

export function SteamLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleSteamLogin = async () => {
    setLoading(true);

    try {
      // Call steam-auth edge function to get Steam login URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/steam-auth`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success && data.auth_url) {
        // Redirect to Steam login page
        window.location.href = data.auth_url;
      } else {
        console.error('Steam auth failed:', data.error);
        alert('Failed to initiate Steam login');
      }
    } catch (error) {
      console.error('Steam login error:', error);
      alert('An error occurred during Steam login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSteamLogin}
      disabled={loading}
      className="btn-steam"
    >
      {loading ? 'Connecting...' : 'Sign in with Steam'}
    </button>
  );
}
```

### 3.2 Create Callback Route

Create a route at `/auth/steam/callback` to handle the redirect:

```typescript
// Example: /auth/steam/callback route
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SteamCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const steamSuccess = searchParams.get('steam_success');
    const steamError = searchParams.get('steam_error');
    const steamId = searchParams.get('steam_id');
    const steamName = searchParams.get('steam_name');

    if (steamSuccess === 'true') {
      // Success! Steam ID is linked
      console.log('Steam linked:', steamId, steamName);
      // Show success message or redirect to dashboard
      navigate('/dashboard?steam_linked=true');
    } else if (steamError) {
      // Error occurred
      console.error('Steam auth error:', steamError);
      alert(`Steam login failed: ${steamError}`);
      navigate('/login');
    } else {
      // Unexpected state
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="loading-screen">
      <p>Completing Steam authentication...</p>
    </div>
  );
}
```

---

## Step 4: Database Integration

### 4.1 Steam ID Storage

Steam IDs are stored in the `users.steam_id` column (TEXT, UNIQUE).

### 4.2 Verify Linked Account

```sql
SELECT id, username, email, steam_id, created_at
FROM users
WHERE steam_id IS NOT NULL;
```

### 4.3 Link Steam to Existing Account

If a user is already authenticated, the `steam-callback` function automatically links their Steam ID to their profile.

If the user is not authenticated, they are redirected to signup with Steam ID in query params.

---

## How It Works

### OpenID 2.0 Flow

1. **User clicks "Sign in with Steam"**
   - Frontend calls `/functions/v1/steam-auth`
   - Edge function generates Steam OpenID URL
   - User is redirected to Steam login page

2. **User authenticates on Steam**
   - Steam prompts user to sign in (if not already)
   - User authorizes the application
   - Steam redirects to callback URL with OpenID parameters

3. **Callback verification**
   - `/functions/v1/steam-callback` receives the redirect
   - Extracts OpenID parameters from URL
   - Verifies response with Steam servers (mode=check_authentication)
   - Extracts Steam ID from `claimed_id` parameter

4. **User profile update**
   - If user is authenticated: Link Steam ID to their profile
   - If user is not authenticated: Redirect to signup with Steam ID
   - Optionally fetch Steam player info (name, avatar) from Steam Web API

5. **Redirect to frontend**
   - Success: Redirect with `?steam_success=true&steam_id=...`
   - Error: Redirect with `?steam_error=...`

---

## Troubleshooting

### Issue: "Invalid Steam response"
**Cause:** Steam OpenID parameters are missing or malformed
**Solution:** Check that the callback URL matches exactly (including https/http)

### Issue: "Verification failed"
**Cause:** Steam's verification server rejected the response
**Solution:**
- Ensure all `openid.*` parameters are passed correctly
- Check that you're using POST method for verification
- Verify the callback URL is whitelisted in Steam API settings

### Issue: "Steam ID already linked to another account"
**Cause:** The Steam ID is already associated with a different user
**Solution:** User should log in to their existing account first, or contact support

### Issue: "Missing player info (name/avatar)"
**Cause:** `STEAM_API_KEY` not configured or invalid
**Solution:**
- Get a Steam Web API key from https://steamcommunity.com/dev/apikey
- Set `STEAM_API_KEY` in Supabase secrets
- Redeploy edge functions

### Issue: Edge function not found (404)
**Cause:** Edge functions not deployed
**Solution:**
```bash
supabase functions deploy steam-auth
supabase functions deploy steam-callback
```

---

## Security Considerations

1. **HTTPS Required in Production**
   - Steam requires HTTPS for callback URLs in production
   - Local development can use HTTP (localhost)

2. **Verify OpenID Response**
   - Always verify the response with Steam's servers
   - Never trust the `claimed_id` parameter without verification

3. **Rate Limiting**
   - Steam may rate-limit requests to the verification endpoint
   - Implement retry logic with exponential backoff

4. **API Key Security**
   - Never commit Steam API key to git
   - Store in Supabase secrets or environment variables
   - Rotate key if compromised

5. **Prevent Account Hijacking**
   - Only allow linking Steam ID if user is authenticated
   - Check if Steam ID is already linked before allowing signup
   - Implement email verification for new accounts

---

## Environment Variables

### Production (Supabase Secrets)
```bash
STEAM_API_KEY=your_steam_api_key_64_chars
STEAM_CALLBACK_URL=https://mindbreakers.gg/auth/steam/callback
FRONTEND_URL=https://mindbreakers.gg
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Local Development (.env.local)
```bash
STEAM_API_KEY=your_steam_api_key_64_chars
STEAM_CALLBACK_URL=http://localhost:5173/auth/steam/callback
FRONTEND_URL=http://localhost:5173
```

---

## Steam OpenID vs OAuth2

| Feature | Steam OpenID 2.0 | Discord/Twitch OAuth2 |
|---------|------------------|----------------------|
| Protocol | OpenID 2.0 | OAuth 2.0 |
| Config | Edge functions | Supabase Dashboard |
| Redirect | Query params | OAuth flow |
| Token | No tokens | Access/refresh tokens |
| Scopes | N/A | Required |
| User Info | Optional (Web API) | Included in response |

---

## API Endpoints

### steam-auth
**URL:** `https://your-project.supabase.co/functions/v1/steam-auth`
**Method:** GET
**Response:**
```json
{
  "success": true,
  "auth_url": "https://steamcommunity.com/openid/login?openid.ns=...",
  "callback_url": "https://yoursite.com/auth/steam/callback"
}
```

### steam-callback
**URL:** `https://your-project.supabase.co/functions/v1/steam-callback`
**Method:** GET (called by Steam redirect, not directly)
**Parameters:** All OpenID parameters from Steam
**Response:** HTTP 302 redirect to frontend with success/error params

---

## Testing

### Manual Test Flow
1. Visit `/functions/v1/steam-auth` in browser
2. Copy the `auth_url` from response
3. Visit the auth URL in browser
4. Sign in with Steam (if not already)
5. Authorize the application
6. Verify redirect to callback URL
7. Check database for new `steam_id` entry

### Automated Testing
```typescript
// Example test
describe('Steam Authentication', () => {
  it('should generate valid Steam login URL', async () => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/steam-auth`);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.auth_url).toContain('steamcommunity.com/openid/login');
    expect(data.auth_url).toContain('openid.ns=');
  });
});
```

---

## References

- [Steam Web API Documentation](https://steamcommunity.com/dev)
- [OpenID 2.0 Specification](https://openid.net/specs/openid-authentication-2_0.html)
- [Steam OpenID Guide](https://steamcommunity.com/dev/apikey)

---

**Status:** Implementation complete, ready for testing
**Estimated Setup Time:** 30-45 minutes (including edge function deployment)
**Difficulty:** Medium (requires edge function deployment and OpenID understanding)
