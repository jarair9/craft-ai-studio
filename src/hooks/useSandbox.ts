import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SandboxFile {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: SandboxFile[];
}

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error";
  content: string;
  timestamp: Date;
}

export function useSandbox(projectId: string | undefined) {
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<SandboxFile[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const addTerminalLine = useCallback((type: TerminalLine["type"], content: string) => {
    setTerminalLines((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, content, timestamp: new Date() },
    ]);
  }, []);

  const callSandbox = useCallback(async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke("sandbox", { body });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const isSandboxAlive = useCallback(async (id: string): Promise<boolean> => {
    try {
      const check = await callSandbox({ action: "exec", sandboxId: id, cmd: "echo alive" });
      return check?.stdout?.includes("alive") ?? false;
    } catch {
      return false;
    }
  }, [callSandbox]);

  // ── Keepalive: ping sandbox every 3 min to prevent expiry ──────────────
  useEffect(() => {
    if (!sandboxId) return;
    const interval = setInterval(async () => {
      try {
        await callSandbox({ action: "exec", sandboxId, cmd: "echo ping" });
      } catch {
        // Sandbox died — clear state so UI shows reconnect
        setSandboxId(null);
        setSandboxUrl(null);
        setBootError("Sandbox expired. Please restart.");
      }
    }, 3 * 60 * 1000); // every 3 minutes

    return () => clearInterval(interval);
  }, [sandboxId, callSandbox]);

  const createSandbox = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    setBootError(null);

    // ── Try to resume existing sandbox first ──────────────────────────────
    if (projectId) {
      try {
        const { data: project } = await supabase
          .from("projects")
          .select("sandbox_id, sandbox_url")
          .eq("id", projectId)
          .single();

        if (project?.sandbox_id) {
          addTerminalLine("output", `Checking existing sandbox ${project.sandbox_id}...`);
          const alive = await isSandboxAlive(project.sandbox_id);

          if (alive) {
            addTerminalLine("output", "✓ Resumed existing sandbox.");
            setSandboxId(project.sandbox_id);
            setSandboxUrl(`${project.sandbox_url}?t=${Date.now()}`);
            setIsCreating(false);
            return project.sandbox_id;
          } else {
            addTerminalLine("output", "Sandbox expired — creating a new one...");
            // Clear stale IDs from DB
            await supabase
              .from("projects")
              .update({ sandbox_id: null, sandbox_url: null } as any)
              .eq("id", projectId);
          }
        }
      } catch (_) {
        // If check fails, fall through to create new sandbox
      }
    }

    addTerminalLine("output", "Creating sandbox...");

    try {
      const data = await callSandbox({ action: "create" });
      const id = data.sandboxID || data.sandboxId || data.id;
      setSandboxId(id);

      const previewUrl = `https://3000-${id}.e2b.dev`;

      if (projectId) {
        await supabase
          .from("projects")
          .update({ sandbox_id: id, sandbox_url: previewUrl } as any)
          .eq("id", projectId);
      }

      addTerminalLine("output", `Sandbox created: ${id}`);

      // ── Bootstrap ──────────────────────────────────────────────────────────
      addTerminalLine("output", "Preparing environment...");

      try {
        const packageJson = {
          name: "aura-app",
          private: true,
          version: "0.0.0",
          type: "module",
          scripts: { dev: "vite" },
          dependencies: {
            react: "^18.3.1",
            "react-dom": "^18.3.1",
            "lucide-react": "^0.460.0",
            "clsx": "^2.1.1",
            "class-variance-authority": "^0.7.1",
            "tailwind-merge": "^2.5.4",
          },
          devDependencies: {
            vite: "^6.0.0",
            "@vitejs/plugin-react": "^4.3.4",
            "@tailwindcss/vite": "^4.0.0",
            typescript: "^5.7.0",
            tailwindcss: "^4.0.0",
          },
        };

        // 1. Setup filesystem
        await callSandbox({ action: "exec", sandboxId: id, cmd: "mkdir -p /home/user/app/src" });

        // 2. Write all project files
        const filesToWrite = [
          {
            path: "/home/user/app/package.json",
            content: JSON.stringify(packageJson, null, 2),
          },
          {
            path: "/home/user/app/vite.config.ts",
            content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: { overlay: false },
  },
});`,
          },
          {
            path: "/home/user/app/index.html",
            content: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><title>Aura App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
          },
          {
            path: "/home/user/app/src/main.tsx",
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);`,
          },
          {
            path: "/home/user/app/src/index.css",
            content: `@import "tailwindcss";`,
          },
          {
            path: "/home/user/app/src/App.tsx",
            content: `import React from 'react';
export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 font-sans">
      <h1 className="text-4xl font-bold mb-4">AURA Sandbox Ready</h1>
      <p className="text-zinc-400">The AI is now generating your project...</p>
    </div>
  );
}`,
          },
          {
            path: "/home/user/app/tsconfig.json",
            content: JSON.stringify(
              {
                compilerOptions: {
                  target: "ESNext",
                  useDefineForClassFields: true,
                  lib: ["DOM", "DOM.Iterable", "ESNext"],
                  allowJs: false,
                  skipLibCheck: true,
                  esModuleInterop: false,
                  allowSyntheticDefaultImports: true,
                  strict: true,
                  forceConsistentCasingInFileNames: true,
                  module: "ESNext",
                  moduleResolution: "Node",
                  resolveJsonModule: true,
                  isolatedModules: true,
                  noEmit: true,
                  jsx: "react-jsx",
                },
                include: ["src"],
              },
              null,
              2
            ),
          },
        ];

        for (const f of filesToWrite) {
          await callSandbox({ action: "writeFile", sandboxId: id, path: f.path, content: f.content });
        }

        // 3. Install dependencies
        addTerminalLine("output", "Installing core engine...");
        await callSandbox({
          action: "exec",
          sandboxId: id,
          cmd: "cd /home/user/app && npm install --no-package-lock --no-audit --no-fund --prefer-offline",
          timeout: 180,
        });

        // 4. Start Vite in background (vite.config.ts already sets host/port)
        addTerminalLine("output", "Igniting dev server...");
        await callSandbox({
          action: "exec",
          sandboxId: id,
          // Redirect output to log file so we can tail it on failure
          cmd: "cd /home/user/app && nohup npx vite > /home/user/app/server.log 2>&1 &",
          background: true,
        });

        // 5. ── FIX: Use curl inside the sandbox to check if port 3000 is up ──
        //    This replaces the broken `checkPort` action entirely.
        let isReady = false;
        const maxAttempts = 30; // 30 × 2s = 60s max wait

        for (let i = 0; i < maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, 2000));

          try {
            const check = await callSandbox({
              action: "exec",
              sandboxId: id,
              // curl returns HTTP status code; 200 or 304 means Vite is up
              cmd: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`,
            });

            const status = (check?.stdout ?? "").trim();
            addTerminalLine("output", `Port check ${i + 1}/${maxAttempts} → HTTP ${status || "?"}`);

            if (status === "200" || status === "304" || status === "101") {
              addTerminalLine("output", "✓ Port 3000 is live!");
              isReady = true;
              break;
            }
          } catch (_) {
            // exec call itself failed — keep retrying
          }
        }

        if (isReady) {
          // Cache-bust the iframe URL so React re-renders the preview
          setSandboxUrl(`${previewUrl}?t=${Date.now()}`);
          addTerminalLine("output", "✓ Sandbox ignition complete.");
        } else {
          // Tail the Vite log to surface the real error
          try {
            const logs = await callSandbox({
              action: "exec",
              sandboxId: id,
              cmd: "tail -n 30 /home/user/app/server.log 2>/dev/null || echo 'No log file found'",
            });
            const logText = logs?.stdout || logs?.stderr || "No output";
            addTerminalLine("error", `Vite log:\n${logText}`);
            console.error("[useSandbox] Vite server.log:", logText);
          } catch (_) { }

          throw new Error("Port 3000 timeout — Vite took too long to start. Check terminal logs.");
        }
      } catch (bootstrapErr: any) {
        setBootError(bootstrapErr.message);
        addTerminalLine("error", `Ignition failed: ${bootstrapErr.message}`);
        console.error("[useSandbox] Bootstrap error:", bootstrapErr);
      }

      return id;
    } catch (e: any) {
      addTerminalLine("error", `Failed to create sandbox: ${e.message}`);
      setBootError(e.message);
      throw e;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, callSandbox, isCreating, addTerminalLine, isSandboxAlive]);

  const listFiles = useCallback(
    async (sbId?: string, dirPath = "/home/user") => {
      const id = sbId || sandboxId;
      if (!id) return;
      try {
        const data = await callSandbox({ action: "listFiles", sandboxId: id, path: dirPath });
        const items: SandboxFile[] = (data || []).map((f: any) => ({
          name: f.name,
          path: f.path || `${dirPath}/${f.name}`,
          type: f.type === "dir" || f.isDir ? "dir" : "file",
        }));
        setFiles(items);
        return items;
      } catch (e: any) {
        addTerminalLine("error", `ls failed: ${e.message}`);
        return [];
      }
    },
    [sandboxId, callSandbox, addTerminalLine]
  );

  const readFile = useCallback(
    async (filePath: string) => {
      if (!sandboxId) return;
      try {
        const data = await callSandbox({ action: "readFile", sandboxId, path: filePath });
        setSelectedFile({ path: filePath, content: data.content || "" });
        return data.content;
      } catch (e: any) {
        addTerminalLine("error", `cat ${filePath}: ${e.message}`);
      }
    },
    [sandboxId, callSandbox, addTerminalLine]
  );

  const writeFile = useCallback(
    async (filePath: string, content: string) => {
      if (!sandboxId) return;
      try {
        await callSandbox({ action: "writeFile", sandboxId, path: filePath, content });
        addTerminalLine("output", `Wrote ${filePath}`);
      } catch (e: any) {
        addTerminalLine("error", `Write failed: ${e.message}`);
      }
    },
    [sandboxId, callSandbox, addTerminalLine]
  );

  const execCommand = useCallback(
    async (cmd: string) => {
      if (!sandboxId) return;
      addTerminalLine("input", `$ ${cmd}`);
      try {
        const data = await callSandbox({ action: "exec", sandboxId, cmd });
        if (data.stdout) addTerminalLine("output", data.stdout);
        if (data.stderr) addTerminalLine("error", data.stderr);
        return data;
      } catch (e: any) {
        addTerminalLine("error", e.message);
      }
    },
    [sandboxId, callSandbox, addTerminalLine]
  );

  const killSandbox = useCallback(async () => {
    if (!sandboxId) return;
    try {
      await callSandbox({ action: "kill", sandboxId });
      setSandboxId(null);
      setSandboxUrl(null);
      addTerminalLine("output", "Sandbox terminated.");
    } catch (e: any) {
      addTerminalLine("error", `Kill failed: ${e.message}`);
    }
  }, [sandboxId, callSandbox, addTerminalLine]);

  return {
    sandboxId,
    sandboxUrl,
    files,
    selectedFile,
    terminalLines,
    isCreating,
    bootError,
    createSandbox,
    listFiles,
    readFile,
    writeFile,
    execCommand,
    killSandbox,
    setSelectedFile,
  };
}