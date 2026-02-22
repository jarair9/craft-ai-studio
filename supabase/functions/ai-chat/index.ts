import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROVIDER_CONFIGS: Record<string, { url: string; modelsMap: Record<string, string> }> = {
  lovable: {
    url: "https://ai.gateway.lovable.dev/v1/chat/completions",
    modelsMap: {
      "gemini-flash": "google/gemini-3-flash-preview",
      "gemini-pro": "google/gemini-2.5-pro",
      "gpt-5": "openai/gpt-5",
      "gpt-5-mini": "openai/gpt-5-mini",
    },
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    modelsMap: {
      "llama-70b": "llama-3.3-70b-versatile",
      "llama-8b": "llama-3.1-8b-instant",
      "mixtral": "mixtral-8x7b-32768",
      "gemma2": "gemma2-9b-it",
    },
  },
  mistral: {
    url: "https://api.mistral.ai/v1/chat/completions",
    modelsMap: {
      "mistral-large": "mistral-large-latest",
      "mistral-medium": "mistral-medium-latest",
      "codestral": "codestral-latest",
      "mistral-small": "mistral-small-latest",
    },
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    modelsMap: {
      "claude-sonnet": "anthropic/claude-sonnet-4",
      "deepseek-v3": "deepseek/deepseek-chat-v3-0324",
      "gpt-5": "openai/gpt-5",
      "gemini-pro": "google/gemini-2.5-pro",
    },
  },
};

const SYSTEM_PROMPT = `You are ForgeAI, an expert full-stack coding assistant. You help users build web applications by generating clean, production-ready code.

When asked to build something:
1. Analyze the request carefully
2. Generate complete, working code with proper imports
3. Use React, TypeScript, and Tailwind CSS
4. Follow best practices for component structure
5. Include helpful comments

When generating code, wrap it in proper code blocks with the filename as a comment at the top.
Always respond with well-structured markdown.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider = "lovable", model, userApiKey } = await req.json();

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine API key
    let apiKey: string;
    if (provider === "lovable") {
      apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
      if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
    } else {
      apiKey = userApiKey || "";
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: `API key required for ${provider}. Add it in Settings.` }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Resolve model name
    const resolvedModel = model
      ? config.modelsMap[model] || model
      : Object.values(config.modelsMap)[0];

    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: `AI provider error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
