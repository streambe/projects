// Supabase Edge Function: send-push
// Sends push notification to a participant via FCM (iOS/Android/Web)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { participantId, title, body, data } = await req.json();

    const { data: tokens, error: tokensError } = await supabase
      .from("device_tokens")
      .select("token, platform")
      .eq("participant_id", participantId);

    if (tokensError) throw tokensError;
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, failed: 0, message: "No device tokens found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY") ?? "";
    let sent = 0;
    let failed = 0;

    for (const { token } of tokens) {
      try {
        const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            Authorization: `key=${FCM_SERVER_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: token,
            notification: { title, body },
            data: data ?? {},
          }),
        });

        if (fcmResponse.ok) {
          sent++;
        } else {
          console.error(`FCM failed for token ${token}:`, await fcmResponse.text());
          failed++;
        }
      } catch (e) {
        console.error(`Error sending to ${token}:`, e);
        failed++;
      }
    }

    await supabase.from("notifications").insert({
      participant_id: participantId,
      title,
      body,
      data: data ?? {},
      sent_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
