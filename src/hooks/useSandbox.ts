import { useState, useCallback } from "react";
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

  const createSandbox = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    addTerminalLine("output", "Creating sandbox...");
    try {
      const data = await callSandbox({ action: "create" });
      const id = data.sandboxID || data.sandboxId || data.id;
      setSandboxId(id);

      const previewPort = 3000;
      const url = `https://${previewPort}-${id}.e2b.dev`;
      setSandboxUrl(url);

      if (projectId) {
        await supabase
          .from("projects")
          .update({ sandbox_id: id, sandbox_url: url } as any)
          .eq("id", projectId);
      }

      addTerminalLine("output", `Sandbox created: ${id}`);

      // Bootstrap a Vite + React project and start the dev server
      addTerminalLine("output", "Bootstrapping Vite + React project...");
      try {
        await callSandbox({
          action: "exec",
          sandboxId: id,
          cmd: "cd /home/user && npm create vite@latest app -- --template react-ts -y",
          timeout: 60,
        });
        addTerminalLine("output", "Installing dependencies...");
        await callSandbox({
          action: "exec",
          sandboxId: id,
          cmd: "cd /home/user/app && npm install",
          timeout: 120,
        });
        addTerminalLine("output", "Starting dev server on port 3000...");
        // Start vite dev server in background (--host so it's accessible, --port 3000)
        await callSandbox({
          action: "exec",
          sandboxId: id,
          cmd: "cd /home/user/app && npx vite --host 0.0.0.0 --port 3000 &",
          timeout: 10,
        });
        addTerminalLine("output", "✓ Dev server starting on port 3000");
      } catch (bootstrapErr: any) {
        addTerminalLine("error", `Bootstrap warning: ${bootstrapErr.message}`);
      }

      return id;
    } catch (e: any) {
      addTerminalLine("error", `Failed to create sandbox: ${e.message}`);
      throw e;
    } finally {
      setIsCreating(false);
    }
  }, [projectId, callSandbox, isCreating, addTerminalLine]);

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
    createSandbox,
    listFiles,
    readFile,
    writeFile,
    execCommand,
    killSandbox,
    setSelectedFile,
  };
}
