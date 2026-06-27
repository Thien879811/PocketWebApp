import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zero-dependency RS256 JWT signer using the Web Crypto API
async function signJwt(payload: any, privateKeyPem: string, clientEmail: string) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s+/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(tokenData)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${tokenData}.${encodedSignature}`;
}

// Exchange the Service Account JWT for a Google OAuth2 Access Token
async function getFcmAccessToken(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const jwt = await signJwt(jwtPayload, serviceAccount.private_key, serviceAccount.client_email);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to exchange JWT for access token: ${response.statusText} - ${errText}`);
  }

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase environment variables.");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const url = new URL(req.url);
    const isCronCheck = url.searchParams.get("check") === "true" || req.method === "GET";

    // ─── A. BACKGROUND SCHEDULER MODE (triggered via Cron) ───
    if (isCronCheck) {
      console.log("Running background scheduler check...");
      
      // Fetch all pending scheduled notifications that are due
      const { data: pendingNotifications, error: fetchError } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .eq("sent", false)
        .lte("scheduled_at", new Date().toISOString());

      if (fetchError) {
        throw new Error(`Failed to fetch pending scheduled notifications: ${fetchError.message}`);
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        return new Response(
          JSON.stringify({ success: true, message: "No pending scheduled notifications to process." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Processing ${pendingNotifications.length} scheduled notifications...`);

      const processPromises = pendingNotifications.map(async (notif) => {
        // Insert into the public.notifications table (which triggers the FCM push trigger)
        const { error: insertError } = await supabase
          .from("notifications")
          .insert({
            user_id: notif.user_id,
            title: notif.title,
            message: notif.message,
            link: "/settings/notifications",
          });

        if (insertError) {
          console.error(`Failed to trigger notification for user ${notif.user_id}:`, insertError.message);
          return;
        }

        // Mark the scheduled notification as sent
        const { error: updateError } = await supabase
          .from("scheduled_notifications")
          .update({ sent: true, updated_at: new Date().toISOString() })
          .eq("id", notif.id);

        if (updateError) {
          console.error(`Failed to mark scheduled notification ${notif.id} as sent:`, updateError.message);
        }
      });

      await Promise.all(processPromises);

      return new Response(
        JSON.stringify({ success: true, processedCount: pendingNotifications.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── B. STANDARD FCM PUSH DISPATCH MODE (triggered via Notifications Table Trigger) ───
    const body = await req.json();
    const notificationRecord = body.record;

    if (!notificationRecord || !notificationRecord.user_id) {
      return new Response(
        JSON.stringify({ error: "Missing notification record or user_id in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { user_id, title, message, link } = notificationRecord;

    // Fetch user's registered FCM tokens
    const { data: fcmTokens, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("user_id", user_id);

    if (tokensError) {
      throw new Error(`Failed to fetch FCM tokens: ${tokensError.message}`);
    }

    if (!fcmTokens || fcmTokens.length === 0) {
      console.log(`No active FCM tokens found for user_id: ${user_id}. Skipping push dispatch.`);
      return new Response(
        JSON.stringify({ success: true, message: "No FCM tokens registered for this user." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Retrieve Firebase Service Account JSON from secret
    const serviceAccountRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountRaw) {
      throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
    }
    const serviceAccount = JSON.parse(serviceAccountRaw);

    // Generate FCM OAuth2 Access Token
    const accessToken = await getFcmAccessToken(serviceAccount);

    // Send push notifications to all registered devices of the user
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`;
    const sendPromises = fcmTokens.map(async (item) => {
      const fcmPayload = {
        message: {
          token: item.token,
          notification: {
            title: title || "PocketFlow",
            body: message || "Bạn có thông báo mới!",
          },
          data: {
            link: link || "/",
          },
        },
      };

      const res = await fetch(fcmEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(fcmPayload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error(`Error sending message to token ${item.token}: ${errText}`);
        
        // delete invalid token from DB if registered token is expired/unregistered
        if (res.status === 400 || res.status === 404) {
          console.log(`Deleting invalid token from database: ${item.token}`);
          await supabase.from("fcm_tokens").delete().eq("token", item.token);
        }
      } else {
        console.log(`FCM push successfully sent to token: ${item.token}`);
      }
    });

    await Promise.all(sendPromises);

    return new Response(
      JSON.stringify({ success: true, sentCount: fcmTokens.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("FCM Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
