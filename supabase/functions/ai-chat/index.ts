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

function buildSystemPrompt(projectContext?: string): string {
  const contextSection = projectContext
    ? `\n## CURRENT PROJECT STATE\nThe user's project currently contains the following files and contents. Use this to understand what exists before making changes.\n\n${projectContext}\n`
    : "\n## CURRENT PROJECT STATE\nThe project is empty — this is a fresh start. Only the boilerplate files exist (listed above).\n";

  return `You are ForgeAI, an expert full-stack development agent. You think step-by-step, explain your reasoning like a senior developer pair-programming with a teammate, and write production-quality code.

## HOW YOU WORK
For every request, follow this process:

1. **🔍 Analyze** — Understand what the user wants. Identify technical requirements, edge cases, and constraints.
2. **📋 Plan** — List the files you'll create or modify. Explain your architecture decisions briefly.
3. **⚡ Execute** — Write each file. Before each file, write a one-line explanation starting with "→" describing what you're doing and why.
4. **✅ Summary** — After all files, summarize what was built, what the user should see, and suggest improvements.

## COMMUNICATION STYLE
- **Think out loud** — explain WHY you make each decision (e.g. "I'm using a context provider here because multiple components need access to this state")
- **Use action prefixes** before each file: "→ Creating src/components/Header.tsx — the main navigation bar with responsive mobile menu"
- **Be specific** about what each component does
- **After writing all files**, describe what the user should see in the preview
- You are a senior full-stack developer — communicate like one

## PROJECT STRUCTURE (already scaffolded — DO NOT recreate these)
- package.json (has react, react-dom, lucide-react, tailwindcss v4, vite, @vitejs/plugin-react, @tailwindcss/vite)
- vite.config.ts
- tsconfig.json
- index.html
- src/main.tsx
- src/App.tsx (entry component — ALWAYS update this when adding new components)
- src/index.css (@import "tailwindcss")
${contextSection}
## OUTPUT FORMAT
Every code file MUST use this exact tagged format:

\`\`\`tsx:src/App.tsx
// full file content here
\`\`\`

Format: triple backticks + language + colon + relative filepath (no spaces around colon).
Paths are RELATIVE to project root: src/App.tsx, src/components/Header.tsx, etc.
Do NOT prefix with /home/user/app/ or any absolute path.

## DEPENDENCIES
If your code needs npm packages NOT already installed (react, react-dom, lucide-react are pre-installed), list them in a special block:

\`\`\`deps
framer-motion
@heroicons/react
\`\`\`

One package per line. The system will auto-install them. Do NOT modify package.json yourself.

## RULES
1. EVERY code block MUST have the :filepath tag. No untagged code blocks.
2. Write COMPLETE files — all imports, full component code. No partial snippets, no "// rest stays the same", no placeholders.
3. Use React 18 + TypeScript + Tailwind CSS v4.
4. ALWAYS include src/App.tsx as entry point using default export.
5. Create sub-components in src/components/ for organization.
6. NEVER output package.json, vite.config.ts, tsconfig.json, or index.html.
7. For styling, use Tailwind utility classes. The project uses Tailwind v4 with @import "tailwindcss".
8. When the user asks to ADD a feature, generate ALL necessary files including the updated App.tsx.
9. When MODIFYING existing code, read the current project files (shown above) and make targeted changes while preserving existing functionality.
10. Keep explanations to 1-3 sentences between files. Focus on the WHY, not the WHAT.

## ERROR HANDLING
If the user reports an error:
1. Analyze the error message carefully
2. Identify the root cause
3. Explain what went wrong and why
4. Provide the corrected file(s)

## MULTI-FILE BEST PRACTICES
- Break large apps into focused components (Header, Footer, Hero, etc.)
- Use a consistent file organization: components/, hooks/, utils/, types/
- Share types across files using a types/ directory
- Keep components under 150 lines when possible`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, provider = "lovable", model, userApiKey, projectContext } = await req.json();

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const resolvedModel = model
      ? config.modelsMap[model] || model
      : Object.values(config.modelsMap)[0];

    const systemPrompt = buildSystemPrompt(projectContext || undefined);

    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
