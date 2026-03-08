
const webSearchCorsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: webSearchCorsHeaders });
    }

    try {
        const { query, searchDepth = "advanced", userApiKey } = await req.json();
        if (!query) throw new Error("Search query is required");

        const apiKey = userApiKey || Deno.env.get("TAVILY_API_KEY") || "";
        if (!apiKey) throw new Error("TAVILY_API_KEY is not configured");

        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                search_depth: searchDepth,
                include_answer: true,
                max_results: 5,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Tavily API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...webSearchCorsHeaders, "Content-Type": "application/json" },
        });
    } catch (e) {
        console.error("web-search error:", e);
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { ...webSearchCorsHeaders, "Content-Type": "application/json" } }
        );
    }
});
