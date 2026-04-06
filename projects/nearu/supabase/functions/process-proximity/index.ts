// Supabase Edge Function: process-proximity
// Detects mutual proximity and sends push notifications to both parties
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

    const { eventId, detectorParticipantId, detectedBeaconMinor } = await req.json();

    // Resolve beacon minor -> participant
    const { data: beacon } = await supabase
      .from("beacons")
      .select("id")
      .eq("minor_id", detectedBeaconMinor)
      .eq("event_id", eventId)
      .single();

    if (!beacon) {
      return new Response(JSON.stringify({ mutual: false, notified: false, reason: "beacon not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: eventParticipant } = await supabase
      .from("event_participants")
      .select("participant_id")
      .eq("beacon_id", beacon.id)
      .eq("event_id", eventId)
      .single();

    if (!eventParticipant) {
      return new Response(JSON.stringify({ mutual: false, notified: false, reason: "participant not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const detectedParticipantId = eventParticipant.participant_id;

    // Check reverse detection within 60s
    const sixtySecondsAgo = new Date(Date.now() - 60000).toISOString();

    const { data: detectorEP } = await supabase
      .from("event_participants")
      .select("beacons!inner(minor_id)")
      .eq("participant_id", detectorParticipantId)
      .eq("event_id", eventId)
      .single();

    if (!detectorEP) {
      return new Response(JSON.stringify({ mutual: false, notified: false, reason: "detector beacon not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // deno-lint-ignore no-explicit-any
    const detectorMinor = (detectorEP as any).beacons.minor_id;

    const { data: reverseDetection } = await supabase
      .from("proximity_events")
      .select("id")
      .eq("event_id", eventId)
      .eq("detector_participant_id", detectedParticipantId)
      .eq("detected_beacon_minor", detectorMinor)
      .gte("detected_at", sixtySecondsAgo)
      .limit(1);

    const isMutual = reverseDetection && reverseDetection.length > 0;

    if (!isMutual) {
      return new Response(JSON.stringify({ mutual: false, notified: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Anti-spam: check if notified in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();
    const { data: recentNotification } = await supabase
      .from("notifications")
      .select("id")
      .eq("participant_id", detectorParticipantId)
      .gte("created_at", fiveMinutesAgo)
      .limit(1);

    if (recentNotification && recentNotification.length > 0) {
      return new Response(JSON.stringify({ mutual: true, notified: false, reason: "recently notified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch participant data for notification content
    const { data: participants } = await supabase
      .from("participants")
      .select("id, full_name, company, role")
      .in("id", [detectorParticipantId, detectedParticipantId]);

    const detector = participants?.find((p) => p.id === detectorParticipantId);
    const detected = participants?.find((p) => p.id === detectedParticipantId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const sendPush = async (participantId: string, otherName: string, otherCompany: string) => {
      await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantId,
          title: "Someone nearby!",
          body: `${otherName} from ${otherCompany} is near you`,
        }),
      });
    };

    if (detector && detected) {
      await Promise.all([
        sendPush(detectorParticipantId, detected.full_name, detected.company ?? ""),
        sendPush(detectedParticipantId, detector.full_name, detector.company ?? ""),
      ]);
    }

    return new Response(JSON.stringify({ mutual: true, notified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
