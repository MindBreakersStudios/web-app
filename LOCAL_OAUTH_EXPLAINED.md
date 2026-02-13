# How Local Supabase OAuth Works - Explained Simply

## 🤔 Your Question: "How does local OAuth work?"

Great question! Here's how it works:

---

## 📦 What is "Local Supabase"?

When you run `npx supabase start`, you're running a **complete, real Supabase instance** on your computer using Docker containers.

It includes:
- ✅ PostgreSQL database
- ✅ Auth service (GoTrue) - handles login/OAuth
- ✅ API Gateway (Kong)
- ✅ Edge Functions runtime (Deno)
- ✅ Storage service
- ✅ Studio UI (http://localhost:54323)

**It's the EXACT same code that runs on Supabase Cloud**, just running locally!

---

## 🔐 How OAuth Providers Work Locally

### The Confusion:
"If I'm running Supabase locally, why do I need to configure Discord/Steam/etc.?"

### The Answer:
You're configuring **Discord to allow YOUR local Supabase to authenticate users**.

Here's the flow:

```
┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│ Your Browser │────>│ Local Supabase  │────>│ Discord  │
│ localhost    │     │ (Docker on PC)  │     │ (Cloud)  │
└──────────────┘     └─────────────────┘     └──────────┘
       ^                                            │
       └────────────────────────────────────────────┘
              User authenticates on Discord
```

### Step-by-Step:

1. **User clicks "Login with Discord"**
   - Your browser sends request to: `http://127.0.0.1:54321/auth/v1/authorize?provider=discord`

2. **Local Supabase redirects to Discord**
   - Discord URL: `https://discord.com/oauth2/authorize?client_id=YOUR_ID&redirect_uri=http://127.0.0.1:54321/auth/v1/callback`

3. **User authorizes on Discord.com (real Discord)**
   - This happens on Discord's servers (in the cloud)
   - Discord checks: "Is this client_id allowed?"
   - Discord checks: "Is this redirect_uri allowed?"

4. **Discord redirects back to YOUR local Supabase**
   - Redirect: `http://127.0.0.1:54321/auth/v1/callback?code=DISCORD_CODE`
   - Your local Supabase exchanges the code for a Discord token
   - Creates user account in YOUR local database

---

## ⚙️ Configuration: Two Places

### 1. Discord Developer Portal (Cloud)
**Why?** Discord needs to know your app exists and where to redirect users.

**What to configure:**
- Application name: "MindBreakers Local Dev"
- Redirect URI: `http://127.0.0.1:54321/auth/v1/callback`
- Copy: Client ID and Client Secret

### 2. Local Supabase Config (Your Computer)
**Why?** Your local Supabase needs credentials to talk to Discord.

**Where:** Two files work together:

#### `supabase/config.toml`
```toml
[auth.external.discord]
enabled = true
client_id = "env(DISCORD_CLIENT_ID)"      # Read from .env file
secret = "env(DISCORD_CLIENT_SECRET)"     # Read from .env file
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

#### `.env` (in web-app directory)
```bash
DISCORD_CLIENT_ID=1116835026064126112
DISCORD_CLIENT_SECRET=b8oyBtiN0aUgp4mP5ouBk3pSTtHn-9kV
```

---

## 🔄 How Supabase Reads Your Configuration

When you start Supabase with `npx supabase start`:

1. **Reads `config.toml`**
   - Sees: `enabled = true` for Discord
   - Sees: `client_id = "env(DISCORD_CLIENT_ID)"`

2. **Looks for environment variable**
   - Checks system environment variables
   - Checks `.env` file in current directory
   - Finds: `DISCORD_CLIENT_ID=1116835026064126112`
   - Substitutes the value

3. **Configures Auth Service**
   - Discord provider is now active
   - When user clicks Discord button, it works!

---

## 🚫 Common Misconceptions

### ❌ "I need to configure Supabase Dashboard online"
**NO!** When running locally, you configure everything in files:
- `config.toml` - OAuth providers
- `.env` - Secrets
- `migrations/*.sql` - Database schema

The online Supabase Dashboard is ONLY for production deployments!

### ❌ "OAuth won't work locally because I'm not on a real domain"
**WRONG!** OAuth providers (Discord, Google, etc.) explicitly support `localhost` and `127.0.0.1` for development. That's why you add `http://127.0.0.1:54321/auth/v1/callback` as a redirect URI.

### ❌ "I need to deploy something for OAuth to work"
**NOPE!** Everything runs on your computer. Discord is the only thing "in the cloud" - and that's because Discord needs to verify user identity.

---

## ✅ What You've Already Done (Correct!)

1. ✅ **Added Discord credentials to `.env`**
   ```bash
   DISCORD_CLIENT_ID=1116835026064126112
   DISCORD_CLIENT_SECRET=b8oyBtiN0aUgp4mP5ouBk3pSTtHn-9kV
   ```

2. ✅ **`config.toml` is already configured**
   ```toml
   [auth.external.discord]
   enabled = true
   client_id = "env(DISCORD_CLIENT_ID)"
   secret = "env(DISCORD_CLIENT_SECRET)"
   redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
   ```

3. ⚠️ **Need to do: Restart Supabase**
   ```bash
   npx supabase stop
   npx supabase start
   ```

4. ⚠️ **Need to do: Make sure Docker Desktop is running**
   - Supabase requires Docker to run containers
   - Error: "The system cannot find the file specified" = Docker not running

---

## 🎯 Quick Test Once Supabase Starts

1. **Start Supabase:**
   ```bash
   npx supabase start
   ```

2. **Check status:**
   ```bash
   npx supabase status
   ```
   You should see:
   ```
   API URL: http://127.0.0.1:54321
   DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
   Studio URL: http://127.0.0.1:54323
   ```

3. **Start your app:**
   ```bash
   npm run dev
   ```

4. **Test Discord login:**
   - Open: http://localhost:5173
   - Click "Login" → "Discord"
   - Should redirect to Discord.com
   - Authorize the app
   - Should redirect back and log you in!

---

## 🔍 Debugging: How to Check if Discord is Configured

### Method 1: Check Studio UI
1. Open: http://localhost:54323
2. Go to: Authentication → Providers
3. You should see "Discord" with a green checkmark

### Method 2: Check Logs
```bash
# Start Supabase and watch logs
npx supabase start
# Look for: "Discord provider enabled"
```

### Method 3: Test the Auth Endpoint
Open in browser:
```
http://127.0.0.1:54321/auth/v1/authorize?provider=discord
```

**If Discord is configured:** Redirects to Discord
**If NOT configured:** Error message

---

## 🎨 Visual Comparison: Local vs Production

### Local Development:
```
Your PC:
┌──────────────────────────────────────┐
│  Docker Containers:                  │
│  - PostgreSQL (database)             │
│  - GoTrue (auth service)             │
│  - Kong (API gateway)                │
│  - Edge Runtime (functions)          │
│                                       │
│  Configuration:                       │
│  - config.toml                       │
│  - .env (secrets)                    │
└──────────────────────────────────────┘
         ↕ (connects to)
    Discord Cloud API
```

### Production:
```
Supabase Cloud:
┌──────────────────────────────────────┐
│  Same containers as local:           │
│  - PostgreSQL                        │
│  - GoTrue                            │
│  - Kong                              │
│  - Edge Runtime                      │
│                                       │
│  Configuration:                       │
│  - Supabase Dashboard UI             │
│  - Environment secrets               │
└──────────────────────────────────────┘
         ↕ (connects to)
    Discord Cloud API
```

**Same code, different configuration location!**

---

## 📋 TL;DR (Too Long; Didn't Read)

**Q: How does local OAuth work?**
**A:** Your local Supabase (running in Docker) talks to real Discord servers. Discord doesn't care if you're local or production - it just checks if your client_id and redirect_uri are registered.

**Q: Where do I configure OAuth locally?**
**A:** In two files:
1. `config.toml` - Enable providers and set redirect URIs
2. `.env` - Store client IDs and secrets

**Q: Do I need the online Supabase Dashboard?**
**A:** NO! Only for production. Local dev uses files only.

**Q: Why isn't it working?**
**A:** Make sure:
1. ✅ Docker Desktop is running
2. ✅ Discord credentials in `.env`
3. ✅ Supabase restarted after adding credentials
4. ✅ Discord redirect URI includes `http://127.0.0.1:54321/auth/v1/callback`

---

## 🚀 Next Steps for You

1. **Start Docker Desktop** (if not running)
2. **Restart Supabase:**
   ```bash
   npx supabase stop
   npx supabase start
   ```
3. **Verify Discord is configured** (Studio UI or test endpoint)
4. **Test login!**

Your configuration is already correct - you just need Docker running and Supabase restarted! 🎉
