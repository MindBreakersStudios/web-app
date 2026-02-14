// supabase/functions/steam-callback/index.ts
// Edge Function to handle Steam OpenID callback and verify identity
// Deploy: supabase functions deploy steam-callback
//
// Steam OpenID 2.0 verification flow:
// 1. Receive callback from Steam with OpenID parameters
// 2. Verify the response with Steam's servers
// 3. Extract Steam ID from claimed_id
// 4. Link Steam ID to user profile in database
// 5. Redirect to frontend

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_API_KEY = Deno.env.get("STEAM_API_KEY") || "";
const STEAM_API_URL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  realname?: string;
}

/**
 * Verify Steam OpenID response
 * Re-sends the parameters to Steam with mode=check_authentication
 */
async function verifySteamOpenID(params: URLSearchParams): Promise<boolean> {
  const verifyParams = new URLSearchParams();

  // Copy all openid.* parameters
  for (const [key, value] of params.entries()) {
    if (key.startsWith("openid.")) {
      verifyParams.set(key, value);
    }
  }

  // Change mode to check_authentication
  verifyParams.set("openid.mode", "check_authentication");

  // Send verification request to Steam
  const response = await fetch(STEAM_OPENID_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: verifyParams.toString(),
  });

  const text = await response.text();

  // Steam returns "is_valid:true" or "is_valid:false"
  return text.includes("is_valid:true");
}

/**
 * Extract Steam ID from claimed_id
 * Format: https://steamcommunity.com/openid/id/<STEAM_ID_64>
 */
function extractSteamID(claimedId: string): string | null {
  const match = claimedId.match(/\/id\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Get Steam player info from Steam Web API
 */
async function getSteamPlayerInfo(steamId: string): Promise<SteamPlayerSummary | null> {
  if (!STEAM_API_KEY) {
    console.warn("[steam-callback] STEAM_API_KEY not configured, skipping player info fetch");
    return null;
  }

  const url = new URL(STEAM_API_URL);
  url.searchParams.set("key", STEAM_API_KEY);
  url.searchParams.set("steamids", steamId);

  const response = await fetch(url.toString());
  const data = await response.json();

  const players = data?.response?.players;
  return players && players.length > 0 ? players[0] : null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const params = url.searchParams;

    // Get return_to URL (where to redirect after success)
    const returnTo = params.get("return_to") || `${FRONTEND_URL}/dashboard`;

    // Extract OpenID mode
    const mode = params.get("openid.mode");

    // Handle user cancellation
    if (mode === "cancel") {
      console.log("[steam-callback] User cancelled Steam login");
      return redirectWithError(returnTo, "Steam authentication was cancelled");
    }

    // Verify this is an authentication response
    if (mode !== "id_res") {
      console.error("[steam-callback] Invalid OpenID mode:", mode);
      return redirectWithError(returnTo, "Invalid Steam authentication response");
    }

    // Verify the response with Steam
    console.log("[steam-callback] Verifying Steam OpenID response...");
    const isValid = await verifySteamOpenID(params);

    if (!isValid) {
      console.error("[steam-callback] Steam OpenID verification failed");
      return redirectWithError(returnTo, "Steam authentication verification failed");
    }

    // Extract Steam ID from claimed_id
    const claimedId = params.get("openid.claimed_id");
    if (!claimedId) {
      console.error("[steam-callback] Missing claimed_id");
      return redirectWithError(returnTo, "Invalid Steam response: missing claimed_id");
    }

    const steamId = extractSteamID(claimedId);
    if (!steamId) {
      console.error("[steam-callback] Failed to extract Steam ID from:", claimedId);
      return redirectWithError(returnTo, "Invalid Steam ID format");
    }

    console.log("[steam-callback] Steam authentication successful for Steam ID:", steamId);

    // Get Steam player info from Steam Web API (optional but recommended)
    const playerInfo = await getSteamPlayerInfo(steamId);

    // Initialize Supabase Admin Client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create or get user in Supabase Auth
    // Use Steam ID as the email (since Steam doesn't provide email)
    const email = `${steamId}@steam.local`;
    const password = crypto.randomUUID(); // Random password (user won't use it)

    console.log("[steam-callback] Creating/getting Supabase user for email:", email);

    // Try to get existing user first
    let userId: string | null = null;
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    if (existingUser) {
      console.log("[steam-callback] Found existing user:", existingUser.id);
      userId = existingUser.id;

      // Update user metadata with latest Steam info
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          steam_id: steamId,
          steam_name: playerInfo?.personaname || `Steam User ${steamId.slice(-4)}`,
          avatar_url: playerInfo?.avatarfull,
          provider: 'steam'
        }
      });
    } else {
      // Create new user
      console.log("[steam-callback] Creating new user");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          steam_id: steamId,
          steam_name: playerInfo?.personaname || `Steam User ${steamId.slice(-4)}`,
          avatar_url: playerInfo?.avatarfull,
          provider: 'steam'
        }
      });

      if (createError) {
        console.error("[steam-callback] Error creating user:", createError);
        return redirectWithError(returnTo, "Failed to create user account");
      }

      if (!newUser.user) {
        console.error("[steam-callback] No user returned from createUser");
        return redirectWithError(returnTo, "Failed to create user account");
      }

      userId = newUser.user.id;
      console.log("[steam-callback] Created new user:", userId);
    }

    // Generate an email OTP for auto-login
    console.log("[steam-callback] Generating email OTP for auto-login...");

    const { data: otpData, error: otpError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });

    if (otpError || !otpData) {
      console.error("[steam-callback] Error generating OTP:", otpError);
      return redirectWithError(returnTo, "Failed to generate login token");
    }

    // Extract the hash token from the magic link properties
    // The hashed_token is what we need for verification
    const hashedToken = otpData.properties?.hashed_token;

    if (!hashedToken) {
      console.error("[steam-callback] No hashed token in response");
      return redirectWithError(returnTo, "Failed to extract login token");
    }

    console.log("[steam-callback] OTP generated successfully, redirecting to frontend");

    // Redirect to frontend with OTP token that it can verify
    return redirectWithOTP(returnTo, email, hashedToken, steamId, playerInfo?.personaname || "");
  } catch (error) {
    console.error("[steam-callback] Unexpected error:", error);
    const returnTo = `${FRONTEND_URL}/dashboard`;
    return redirectWithError(returnTo, "An unexpected error occurred during Steam authentication");
  }
});

function redirectWithError(returnTo: string, message: string): Response {
  const url = new URL(returnTo);
  url.searchParams.set("steam_error", message);

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}

function redirectWithSuccess(returnTo: string, steamId: string, steamName: string): Response {
  const url = new URL(returnTo);
  url.searchParams.set("steam_success", "true");
  url.searchParams.set("steam_id", steamId);
  if (steamName) {
    url.searchParams.set("steam_name", steamName);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}

function redirectWithSession(
  returnTo: string,
  accessToken: string,
  refreshToken: string,
  steamId: string,
  steamName: string
): Response {
  const url = new URL(returnTo);
  url.searchParams.set("steam_success", "true");
  url.searchParams.set("steam_id", steamId);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("refresh_token", refreshToken);
  if (steamName) {
    url.searchParams.set("steam_name", steamName);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}

function redirectWithOTP(
  returnTo: string,
  email: string,
  tokenHash: string,
  steamId: string,
  steamName: string
): Response {
  const url = new URL(returnTo);
  url.searchParams.set("steam_success", "true");
  url.searchParams.set("steam_id", steamId);
  url.searchParams.set("email", email);
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", "magiclink");
  if (steamName) {
    url.searchParams.set("steam_name", steamName);
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
    },
  });
}
