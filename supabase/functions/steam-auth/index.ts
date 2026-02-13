// supabase/functions/steam-auth/index.ts
// Edge Function to initiate Steam OpenID authentication
// Deploy: supabase functions deploy steam-auth
//
// Steam uses OpenID 2.0, not OAuth2. This function generates the Steam login URL.
// Reference: https://steamcommunity.com/dev

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";
const CALLBACK_URL = Deno.env.get("STEAM_CALLBACK_URL") || `${FRONTEND_URL}/auth/steam/callback`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Optional: Get return_to URL from query params (where to redirect after auth)
    const returnTo = url.searchParams.get("return_to") || `${FRONTEND_URL}/dashboard`;

    // Build Steam OpenID authentication URL
    // Steam OpenID 2.0 spec: https://openid.net/specs/openid-authentication-2_0.html
    const authUrl = new URL(STEAM_OPENID_URL);

    // Required OpenID 2.0 parameters
    authUrl.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    authUrl.searchParams.set("openid.mode", "checkid_setup");
    authUrl.searchParams.set("openid.return_to", CALLBACK_URL);
    authUrl.searchParams.set("openid.realm", new URL(CALLBACK_URL).origin);
    authUrl.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
    authUrl.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");

    // Store return_to in the callback URL as a query param
    const callbackWithReturn = new URL(CALLBACK_URL);
    callbackWithReturn.searchParams.set("return_to", returnTo);
    authUrl.searchParams.set("openid.return_to", callbackWithReturn.toString());

    console.log("[steam-auth] Generated Steam login URL");

    return new Response(
      JSON.stringify({
        success: true,
        auth_url: authUrl.toString(),
        callback_url: CALLBACK_URL,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[steam-auth] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
