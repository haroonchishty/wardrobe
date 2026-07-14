export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Route: POST /api/run-vton
    if (url.pathname === "/api/run-vton" && request.method === "POST") {
      try {
        const { garm_img, human_img, garment_des } = await request.json();

        if (!garm_img || !human_img) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: garm_img, human_img" }),
            { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const token = env.REPLICATE_API_TOKEN;
        if (!token) {
          return new Response(
            JSON.stringify({ error: "REPLICATE_API_TOKEN not configured" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const input = {
          garm_img,
          human_img,
          garment_des: garment_des || ""
        };

        // Call Replicate API
        const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            version: "0513734a452173b8173e907e3a59d19a36266e55b48528559432bd21c7d7e985",
            input
          })
        });

        if (!replicateResponse.ok) {
          const error = await replicateResponse.text();
          console.error("Replicate error:", error);
          return new Response(
            JSON.stringify({ error: `Replicate API error: ${replicateResponse.status}` }),
            { status: replicateResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        const prediction = await replicateResponse.json();
        const predictionId = prediction.id;

        // Poll for completion
        let completed = false;
        let output = null;
        let attempts = 0;
        const maxAttempts = 300; // ~10 minutes with 2s intervals

        while (!completed && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: { "Authorization": `Token ${token}` }
          });

          const status = await statusResponse.json();
          if (status.status === "succeeded") {
            output = status.output;
            completed = true;
          } else if (status.status === "failed") {
            return new Response(
              JSON.stringify({ error: status.error || "Prediction failed" }),
              { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
          }
          attempts++;
        }

        if (!completed) {
          return new Response(
            JSON.stringify({ error: "Prediction timeout" }),
            { status: 504, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Extract URL from output
        let url = null;
        if (typeof output === "string") {
          url = output;
        } else if (Array.isArray(output) && output.length > 0) {
          url = typeof output[0] === "string" ? output[0] : output[0]?.url;
        } else if (output?.url) {
          url = output.url;
        }

        return new Response(
          JSON.stringify({ output, url }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } catch (error) {
        console.error("Error:", error);
        return new Response(
          JSON.stringify({ error: error.message || "Internal server error" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // 404
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};
