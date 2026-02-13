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

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get the current user from the request (if authenticated)
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let userId: string | null = null;

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;
      }
    }

    // Update or create user with Steam ID
    if (userId) {
      // User is authenticated - link Steam ID to existing profile
      const { error: updateError } = await supabase
        .from("users")
        .update({
          steam_id: steamId,
          username: playerInfo?.personaname || undefined,
          avatar_url: playerInfo?.avatarfull || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        console.error("[steam-callback] Error linking Steam ID:", updateError);
        return redirectWithError(returnTo, "Failed to link Steam account");
      }

      console.log(`[steam-callback] Linked Steam ID ${steamId} to user ${userId}`);
    } else {
      // User not authenticated - this should trigger signup/login flow
      // For now, we'll just store the Steam ID and redirect
      // In production, you'd create a session or trigger email verification
      console.log("[steam-callback] User not authenticated, Steam ID:", steamId);

      // Check if user with this Steam ID already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("steam_id", steamId)
        .maybeSingle();

      if (existingUser) {
        // User exists, they should log in first
        return redirectWithError(
          returnTo,
          "A user with this Steam account already exists. Please log in first."
        );
      }

      // New user - redirect to signup with Steam ID in query params
      const signupUrl = new URL(`${FRONTEND_URL}/signup`);
      signupUrl.searchParams.set("steam_id", steamId);
      if (playerInfo) {
        signupUrl.searchParams.set("steam_name", playerInfo.personaname);
        signupUrl.searchParams.set("avatar", playerInfo.avatarfull);
      }

      return new Response(null, {
        status: 302,
        headers: {
          Location: signupUrl.toString(),
        },
      });
    }

    // Redirect to success page
    return redirectWithSuccess(returnTo, steamId, playerInfo?.personaname || "");
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
