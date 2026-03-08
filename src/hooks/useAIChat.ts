import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DesignTokens } from "@/components/workspace/ThemeSettings";

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
    id: "cerebras",
    name: "Cerebras",
    models: [
      { id: "gpt-oss-120b", name: "GPT-OSS 120B" },
      { id: "llama-3.3-70b", name: "Llama 3.3 70B" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    models: [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o-mini" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
    ],
  },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const WELCOME_MSG: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "System initialized. I am AURA, your professional development agent. I can utilize advanced models including Claude 3.5 Sonnet and GPT-4o, execute terminal commands, and perform deep project analysis to accelerate your development workflow. How can I assist you today?",
  timestamp: new Date(),
};

export interface ParsedFile {
  path: string;
  content: string;
}

/** Parse ```lang:filepath code blocks from AI output */
export function parseFileBlocks(content: string): ParsedFile[] {
  const files: ParsedFile[] = [];
  const regex = /```[\w]*:([\w/.@\-]+)\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    let filePath = match[1].trim();
    const fileContent = match[2];
    filePath = filePath.replace(/^\/?(home\/user\/app\/)?/, "");
    if (filePath && fileContent) {
      files.push({ path: filePath, content: fileContent });
    }
  }
  return files;
}

/** Parse ```deps blocks for npm dependencies */
export function parseDepsBlock(content: string): string[] {
  const deps: string[] = [];
  const regex = /```deps\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const lines = match[1].split("\n").map((l) => l.trim()).filter(Boolean);
    deps.push(...lines);
  }
  return deps;
}

/** Parse ```shell:command tags */
export function parseShellCommands(content: string): string[] {
  const cmds: string[] = [];
  const regex = /```shell:([^\n]+)\s*\n?([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    cmds.push(match[1].trim());
  }
  return cmds;
}

/** Parse ```read:filepath tags */
export function parseReadFiles(content: string): string[] {
  const paths: string[] = [];
  const regex = /```read:([^\n]+)\s*\n?([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1].trim());
  }
  return paths;
}

export function parseReadAction(content: string): string[] {
  const readRegex = /```read:([^\n]+)/g;
  return [...content.matchAll(readRegex)].map((m) => m[1].trim());
}

export function parseShellAction(content: string): string[] {
  const shellRegex = /```shell:([^\n]+)/g;
  return [...content.matchAll(shellRegex)].map((m) => m[1].trim());
}

export function parseSearchAction(content: string): string[] {
  const searchRegex = /```search:([^\n]+)/g;
  return [...content.matchAll(searchRegex)].map((m) => m[1].trim());
}

/** Build project context string for AI */
function buildProjectContext(fileContents: Record<string, string>): string {
  const paths = Object.keys(fileContents);
  if (paths.length === 0) return "";

  let ctx = "Files:\n";
  for (const p of paths.sort()) {
    ctx += `- ${p}\n`;
  }

  // Include contents of key files (keep total under ~4000 chars)
  const keyFiles = paths.filter(
    (p) =>
      p.endsWith("App.tsx") ||
      p.endsWith("index.css") ||
      p.endsWith("main.tsx")
  );

  let charBudget = 4000;
  for (const p of keyFiles) {
    const content = fileContents[p];
    if (content && charBudget > 0) {
      const snippet = content.slice(0, charBudget);
      ctx += `\n--- ${p} ---\n${snippet}\n`;
      charBudget -= snippet.length;
    }
  }

  return ctx;
}

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [provider, setProvider] = useState("cerebras");
  const [model, setModel] = useState("gpt-oss-120b");
  const [userApiKeys, setUserApiKeys] = useState<Record<string, string>>({});
  const [initialPromptSent, setInitialPromptSent] = useState(false);
  const [designTokens, setDesignTokens] = useState<DesignTokens | null>(null);

  const fileWriteRef = useRef<((files: ParsedFile[], deps: string[]) => void) | null>(null);
  const sandboxRef = useRef<any>(null); // To allow hook to call sandbox directly
  const fileContentsRef = useRef<Record<string, string>>({});

  /** Update the current project files (for context) */
  const updateProjectFiles = useCallback((files: Record<string, string>) => {
    fileContentsRef.current = files;
  }, []);

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
        const allMsgs = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const projectContext = buildProjectContext(fileContentsRef.current);

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
            projectContext,
            designRules: designTokens ? JSON.stringify(designTokens, null, 2) : undefined,
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

        // After streaming, parse actions and dispatch
        const parsedFiles = parseFileBlocks(assistantContent);
        const parsedDeps = parseDepsBlock(assistantContent);
        const parsedShell = parseShellAction(assistantContent);
        const parsedRead = parseReadAction(assistantContent);
        const parsedSearch = parseSearchAction(assistantContent);

        if (fileWriteRef.current) {
          if (parsedFiles.length > 0 || parsedDeps.length > 0) {
            fileWriteRef.current(parsedFiles, parsedDeps);
          }

          // Handle shell commands
          if (parsedShell.length > 0 && sandboxRef.current) {
            for (const cmd of parsedShell) {
              const res = await sandboxRef.current.execCommand(cmd);
              const output = `Command "${cmd}" finished.\nSTDOUT:\n${res?.stdout || "none"}\nSTDERR:\n${res?.stderr || "none"}`;
              sendMessage(`[SYSTEM ACTION] ${output}`);
            }
          }

          // Handle read files
          if (parsedRead.length > 0 && sandboxRef.current) {
            for (const path of parsedRead) {
              const content = await sandboxRef.current.readFile(`/home/user/app/${path.replace(/^\//, "")}`);
              const output = content ? `File "${path}" content:\n\`\`\`\n${content}\n\`\`\`` : `Error: Could not read file "${path}"`;
              sendMessage(`[SYSTEM ACTION] ${output}`);
            }
          }

          // Handle search
          if (parsedSearch.length > 0) {
            for (const query of parsedSearch) {
              try {
                const response = await supabase.functions.invoke("web-search", {
                  body: {
                    query,
                    userApiKey: userApiKeys.tavily
                  },
                });
                const data = response.data;
                const results = data.results?.map((r: any) => `- [${r.title}](${r.url}): ${r.content}`).join("\n") || "No results found.";
                const answer = data.answer ? `\nSummary: ${data.answer}\n` : "";
                const output = `Search results for "${query}":\n${answer}${results}`;
                sendMessage(`[SYSTEM ACTION] ${output}`);
              } catch (err: any) {
                sendMessage(`[SYSTEM ACTION] Error during search for "${query}": ${err.message}`);
              }
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
    initialPromptSent,
    setInitialPromptSent,
    designTokens,
    setDesignTokens,
    fileWriteRef,
    sandboxRef,
    updateProjectFiles,
  };
}
