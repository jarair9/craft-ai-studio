import { useState, useCallback } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AIProvider {
  id: string;
  name: string;
  models: { id: string; name: string }[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "lovable",
    name: "ForgeAI (Built-in)",
    models: [
      { id: "gemini-flash", name: "Gemini Flash" },
      { id: "gemini-pro", name: "Gemini Pro" },
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-5-mini", name: "GPT-5 Mini" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    models: [
      { id: "llama-70b", name: "Llama 3.3 70B" },
      { id: "llama-8b", name: "Llama 3.1 8B" },
      { id: "mixtral", name: "Mixtral 8x7B" },
      { id: "gemma2", name: "Gemma2 9B" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral",
    models: [
      { id: "mistral-large", name: "Mistral Large" },
      { id: "codestral", name: "Codestral" },
      { id: "mistral-medium", name: "Mistral Medium" },
      { id: "mistral-small", name: "Mistral Small" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    models: [
      { id: "claude-sonnet", name: "Claude Sonnet 4" },
      { id: "deepseek-v3", name: "DeepSeek V3" },
      { id: "gpt-5", name: "GPT-5" },
      { id: "gemini-pro", name: "Gemini Pro" },
    ],
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hey! I'm your AI coding agent. Describe what you'd like to build and I'll generate the code, set up the sandbox, and help you ship. What are we building today?",
  timestamp: new Date(),
};

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState("lovable");
  const [model, setModel] = useState("gemini-flash");
  const [userApiKeys, setUserApiKeys] = useState<Record<string, string>>({});

  const sendMessage = useCallback(
    async (input: string) => {
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: input,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      let assistantContent = "";
      const upsertAssistant = (chunk: string) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id !== "welcome") {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant" as const,
              content: assistantContent,
              timestamp: new Date(),
            },
          ];
        });
      };

      try {
        const allMsgs = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: allMsgs,
            provider,
            model,
            userApiKey: provider !== "lovable" ? userApiKeys[provider] : undefined,
          }),
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `Error ${resp.status}`);
        }

        if (!resp.body) throw new Error("No response body");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const json = line.slice(6).trim();
            if (json === "[DONE]") break;
            try {
              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) upsertAssistant(content);
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
      } catch (e: any) {
        upsertAssistant(`\n\n⚠️ Error: ${e.message}`);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, provider, model, userApiKeys]
  );

  return {
    messages,
    isStreaming,
    provider,
    model,
    setProvider,
    setModel,
    userApiKeys,
    setUserApiKeys,
    sendMessage,
  };
}
