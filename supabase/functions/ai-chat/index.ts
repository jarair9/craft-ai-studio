

const aiChatCorsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROVIDER_CONFIGS: Record<string, { url: string; modelsMap: Record<string, string> }> = {
  cerebras: {
    url: "https://api.cerebras.ai/v1/chat/completions",
    modelsMap: {
      "gpt-oss-120b": "gpt-oss-120b",
      "llama-3.3-70b": "llama-3.3-70b",
    },
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    modelsMap: {
      "gpt-4o": "gpt-4o",
      "gpt-4o-mini": "gpt-4o-mini",
    },
  },
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    modelsMap: {
      "claude-3-5-sonnet-20241022": "claude-3-5-sonnet-20241022",
      "claude-3-5-haiku-20241022": "claude-3-5-haiku-20241022",
    },
  },
  gemini: {
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    modelsMap: {
      "gemini-1.5-pro": "gemini-1.5-pro",
      "gemini-1.5-flash": "gemini-1.5-flash",
    },
  },
  groq: {
    url: "https://api.groq.com/openai/v1/chat/completions",
    modelsMap: {
      "llama-3.3-70b-versatile": "llama-3.3-70b-versatile",
      "mixtral-8x7b-32768": "mixtral-8x7b-32768",
    },
  },
};

function buildSystemPrompt(projectContext?: string, designRules?: string): string {
  const contextSection = projectContext
    ? `\n## CURRENT PROJECT STATE\nThe user's project currently contains the following files and contents. Use this to understand what exists before making changes.\n\n${projectContext}\n`
    : "\n## CURRENT PROJECT STATE\nThe project is empty — this is a fresh start. Only the boilerplate files exist (listed above).\n";

  const designSection = designRules
    ? `\n## DESIGN SYSTEM RULES\nYou MUST strictly adhere to these design tokens for all new components and styles:\n${designRules}\nUse these as Tailwind utility base values or CSS variables where appropriate.\n`
    : "";

  return `You are AURA, a professional full-stack development agent. You prioritize technical precision, concise communication, and production-quality output.

## HOW YOU WORK
For every request, follow this process:

1. **Analyze** — Deconstruct user requirements. Identify technical constraints and architecture patterns.
2. **Plan** — List planned file modifications. Explain high-level architectural decisions.
3. **Execute** — Implement the solution. Prepend each file block with a clear "→" prefix describing the specific file's purpose.
4. **Summary** — Provide a brief technical summary and suggest relevant optimizations.

## AUTONOMOUS CAPABILITIES
You can interact with the sandbox to gather context or verify your environment. Use these tags:

- **Read File**: For internal file analysis.
  \`\`\`read:path/to/file.tsx
  \`\`\`
- **Run Command**: To execute shell commands.
  \`\`\`shell:npm test
  \`\`\`
- **Search Web**: To research real-time information or documentation.
  \`\`\`search:your search query
  \`\`\`

The system will provide output in the subsequent message. Use these capabilities to ensure code correctness and environment stability.

## COMMUNICATION STYLE
- **Professional Tone** — Maintain a formal, senior-developer persona. Avoid conversational fluff.
- **NO EMOJIS** — Do not use any emojis in your response. Emojis feel unprofessional in a development context.
- **Direct Output** — Focus on the technical implementation.
- Use the "→" prefix before each file: "→ Creating src/components/Header.tsx — implementing responsive navigation."
- After the implementation, describe the expected result in the preview panel.

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
Always declare ALL npm dependencies used in generated code.
Common ones: lucide-react, clsx, tailwind-merge, framer-motion, date-fns.
Never import a package without listing it in the deps array.

## RULES
1. EVERY code block MUST have the :filepath tag. No untagged code blocks.
2. Write COMPLETE files — all imports, full component code. No partial snippets, no "// rest stays the same", no placeholders.
3. Use React 18 + TypeScript + Tailwind CSS v4.
4. ALWAYS include src/App.tsx as entry point using default export.
5. Create sub-components in src/components/ for organization.
6. NEVER output package.json, vite.config.ts, tsconfig.json, or index.html.
7. For styling, use Tailwind utility classes. The project uses Tailwind v4 with @import "tailwindcss" in src/index.css (already created).
8. **DESIGN FIDELITY**: If the user asks for a specific 'clone' (e.g. Netflix, Airbnb), you MUST use their exact color schemes, dark modes, and layouts. For Netflix, use a black background ('bg-black') and red accents.
9. When the user asks to ADD a feature, generate ALL necessary files including the updated App.tsx.
10. When MODIFYING existing code, read the current project files (shown above) and make targeted changes while preserving existing functionality.
11. Keep explanations to 1-3 sentences between files. Focus on the WHY, not the WHAT.

## ERROR HANDLING
If the user reports an error:
1. Analyze the error message carefully
2. Identify the root cause
3. Explain what went wrong and why
4. Provide the corrected file(s)

## MULTI-FILE BEST PRACTICES
- Break large apps into focused components (Header, Footer, Hero, etc.)
- Use a consistent file organization: components/, hooks/, utils/, types/
- Keep components under 150 lines when possible
${designSection}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: aiChatCorsHeaders });
  }

  try {
    const { messages, provider = "cerebras", model, userApiKey, projectContext, designRules } = await req.json();

    const config = PROVIDER_CONFIGS[provider];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown provider: ${provider}` }), {
        status: 400,
        headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" },
      });
    }

    let apiKey = userApiKey || "";

    if (!apiKey) {
      if (provider === "cerebras") {
        apiKey = Deno.env.get("CEREBRAS_API_KEY") || "";
      } else if (provider === "openai") {
        apiKey = Deno.env.get("OPENAI_API_KEY") || "";
      } else if (provider === "anthropic") {
        apiKey = Deno.env.get("ANTHROPIC_API_KEY") || "";
      } else if (provider === "gemini") {
        apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY") || "";
      } else if (provider === "groq") {
        apiKey = Deno.env.get("GROQ_API_KEY") || "";
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `API key required for ${provider}. Add it in Settings or ENVIRONMENT.` }),
        { status: 401, headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resolvedModel = model
      ? config.modelsMap[model] || model
      : Object.values(config.modelsMap)[0];

    const systemPrompt = buildSystemPrompt(projectContext || undefined, designRules);

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
          headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: `AI provider error: ${response.status}` }), {
        status: 500,
        headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...aiChatCorsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...aiChatCorsHeaders, "Content-Type": "application/json" } }
    );
  }
});
