import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { origin, destination, travelDates, durationDays, budgetPerDay, companions, interests, mode, previousItinerary, userRequest } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = `You are Atlas, an intelligent AI travel planner. Generate highly personalized, realistic travel itineraries.
Always respond with valid JSON only, no markdown, no extra text.`;

    let userPrompt = "";

    if (mode === "generate") {
      userPrompt = `Generate a detailed ${durationDays}-day travel itinerary from ${origin} to ${destination}.
Travel details:
- Travel dates: ${travelDates || "flexible"}
- Budget per day: ₹${budgetPerDay || 2000} INR
- Travelling with: ${companions || "Solo"}
- Interests: ${(interests || []).join(", ")}

Return this exact JSON structure:
{
  "title": "Trip title",
  "destination": "${destination}",
  "totalEstimatedCost": 0,
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "theme": "Theme for the day",
      "activities": [
        {
          "time": "9:00 AM",
          "name": "Activity name",
          "description": "Short 1-2 sentence description",
          "estimatedCost": 500,
          "category": "sightseeing|food|adventure|culture|transport|accommodation",
          "duration": "2 hours",
          "tips": "One practical tip"
        }
      ]
    }
  ]
}

Make ${durationDays} days. Estimate costs in INR. Keep budget realistic at ₹${budgetPerDay}/day. Focus on ${(interests || []).join(", ")} activities.`;
    } else if (mode === "modify") {
      userPrompt = `Here is the current itinerary:
${JSON.stringify(previousItinerary)}

User request: "${userRequest}"

Modify the itinerary according to the user's request and return the complete updated itinerary in the same JSON format. Return only valid JSON.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let itinerary;
    try {
      // Strip markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      itinerary = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse itinerary JSON:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    return new Response(JSON.stringify({ itinerary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-itinerary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
