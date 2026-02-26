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

const SYSTEM_PROMPT = `You are ForgeAI, an expert full-stack coding assistant that writes code FILES — not code snippets in chat.

CRITICAL: You MUST output every piece of code using this EXACT tagged format so the system writes them to the sandbox filesystem automatically:

\`\`\`tsx:src/App.tsx
import React from 'react';
export default function App() { return <div>Hello</div>; }
\`\`\`

Format: triple backticks + language + colon + filepath (no spaces around colon).

RULES:
1. NEVER output bare/untagged code blocks. Every code block MUST have the :filepath tag.
2. Write COMPLETE files with all imports — no partial snippets.
3. Keep text explanations to 1-2 sentences MAX between files. The user sees files in their editor, not in chat.
4. Use React 18, TypeScript, Tailwind CSS. All files go under /home/user/app/src/.
5. Always start with src/App.tsx and src/main.tsx as entry points.
6. Use default exports for page/app components.
7. Do NOT output configuration files like tailwind.config.js, vite.config.ts, package.json etc — the project scaffold already exists.`;

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
