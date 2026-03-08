import { useState, useEffect, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Zap, Settings, Eye, Code2, Share2, Palette, Terminal
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { FileExplorer } from "@/components/workspace/FileExplorer";
import { CodeViewer } from "@/components/workspace/CodeViewer";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { ApiKeySettings } from "@/components/workspace/ApiKeySettings";
import { useAIChat, type ParsedFile } from "@/hooks/useAIChat";
import { useSandbox } from "@/hooks/useSandbox";
import { TerminalPanel } from "@/components/workspace/TerminalPanel";
import { ThemeSettings } from "@/components/workspace/ThemeSettings";
import { cn } from "@/lib/utils";

type RightView = "preview" | "code" | "design";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rightView, setRightView] = useState<RightView>("preview");
  const [showSettings, setShowSettings] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [writingFiles, setWritingFiles] = useState<string[]>([]);
  const [buildComplete, setBuildComplete] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const chat = useAIChat();
  const sandbox = useSandbox(id);
  const sandboxIdRef = useRef(sandbox.sandboxId);

  // Keep ref in sync
  useEffect(() => {
    sandboxIdRef.current = sandbox.sandboxId;
    chat.sandboxRef.current = sandbox;
  }, [sandbox.sandboxId, sandbox]);

  const didInit = useRef(false);

  // Keep AI chat aware of current project files
  useEffect(() => {
    chat.updateProjectFiles(fileContents);
  }, [fileContents, chat.updateProjectFiles]);

  // Wire up AI file writes → E2B sandbox + local state
  useEffect(() => {
    chat.fileWriteRef.current = async (files: ParsedFile[], deps: string[]) => {
      setBuildComplete(false);

      // 1. Wait if sandbox is currently being created (Wait for full boot/URL)
      let activeId = sandboxIdRef.current;
      if (!sandbox.sandboxUrl) {
        setWritingFiles(["⏳ Waiting for ignition..."]);
        // Patience: wait until URL is ready (indicates port check passed)
        for (let i = 0; i < 150; i++) {
          await new Promise(r => setTimeout(r, 500));
          if (sandbox.sandboxUrl) {
            activeId = sandboxIdRef.current;
            break;
          }
        }
      }

      if (!activeId) {
        setWritingFiles(["❌ Sandbox boot timeout."]);
        return;
      }

      // 2. Install dependencies (speedy flags already set)
      if (deps.length > 0) {
        setWritingFiles(["📦 Installing " + deps.join(", ") + "..."]);
        await sandbox.execCommand(`cd /home/user/app && npm install ${deps.join(" ")} --no-package-lock --no-audit --no-fund --prefer-offline --legacy-peer-deps`);
      }

      // 3. Write all files
      for (const f of files) {
        setWritingFiles((prev) => [...prev, `→ Writing ${f.path}`]);

        // Update local editor state
        setFileContents((prev) => ({ ...prev, [f.path]: f.content }));

        // Update E2B sandbox (absolute path)
        const fullPath = `/home/user/app/${f.path.replace(/^\//, "")}`;
        await sandbox.writeFile(fullPath, f.content);

        await new Promise((r) => setTimeout(r, 100));
      }

      // 4. Update UI
      if (files.length > 0) {
        setSelectedFilePath(files[0].path);
      }

      setWritingFiles([]);
      setBuildComplete(true);
      setTimeout(() => setBuildComplete(false), 3000);
    };
  }, [sandbox.writeFile, sandbox.execCommand]);

  // Send initial prompt from project description
  useEffect(() => {
    if (didInit.current || !project) return;
    didInit.current = true;

    if (project.description && !chat.initialPromptSent) {
      chat.setInitialPromptSent(true);
      chat.sendMessage(project.description);
    }
  }, [project]);

  const handleFileClick = (path: string) => {
    setSelectedFilePath(path);
    setRightView("code");
  };

  const filePaths = Object.keys(fileContents);
  const currentContent = selectedFilePath ? fileContents[selectedFilePath] ?? null : null;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))]">
      {/* Top bar */}
      <header className="h-11 border-b border-border/40 flex items-center px-3 shrink-0 bg-[hsl(var(--sidebar-background))]">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-5 w-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <span className="font-medium text-[13px] truncate max-w-[200px]">
              {project?.name || "Loading..."}
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5 border border-border/30">
          <button
            onClick={() => setRightView("preview")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              rightView === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Preview"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRightView("code")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              rightView === "code" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Code"
          >
            <Code2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setRightView("design")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              rightView === "design" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Design Rules"
          >
            <Palette className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", showTerminal && "bg-secondary")}
            onClick={() => setShowTerminal(!showTerminal)}
            title="Terminal"
          >
            <Terminal className="h-3.5 w-3.5" />
          </Button>
          <Button variant="default" size="sm" className="h-7 text-[11px] gap-1.5 font-medium">
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0" id="main-group">
        <ResizablePanel defaultSize={30} minSize={22} maxSize={45} id="chat-panel" order={1}>
          <ChatPanel
            messages={chat.messages}
            isStreaming={chat.isStreaming}
            provider={chat.provider}
            model={chat.model}
            onProviderChange={chat.setProvider}
            onModelChange={chat.setModel}
            onSend={chat.sendMessage}
            writingFiles={writingFiles}
            buildComplete={buildComplete}
          />
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />

        <ResizablePanel defaultSize={70} minSize={45} id="preview-panel" order={2}>
          <ResizablePanelGroup direction="vertical" id="right-group">
            <ResizablePanel defaultSize={showTerminal ? 70 : 100} id="workspace-view" order={1}>
              <div className="h-full relative overflow-hidden">
                {/* Preview — always mounted */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-200",
                    rightView === "preview" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                >
                  <PreviewPanel
                    isBooting={sandbox.isCreating}
                    isReady={!!sandbox.sandboxUrl}
                    bootError={sandbox.bootError}
                    previewUrl={sandbox.sandboxUrl}
                    onBoot={sandbox.createSandbox}
                    onRetry={sandbox.createSandbox}
                  />
                </div>

                {/* Code view */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-200",
                    rightView === "code" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                >
                  <ResizablePanelGroup direction="horizontal" id="code-group">
                    <ResizablePanel defaultSize={28} minSize={18} maxSize={40} id="file-explorer" order={1}>
                      <FileExplorer
                        filePaths={filePaths}
                        selectedPath={selectedFilePath}
                        onFileClick={handleFileClick}
                        projectName={project?.name}
                      />
                    </ResizablePanel>
                    <ResizableHandle className="w-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />
                    <ResizablePanel defaultSize={72} minSize={40} id="code-viewer" order={2}>
                      <CodeViewer
                        filePath={selectedFilePath}
                        content={currentContent}
                      />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>

                {/* Design Rules view */}
                <div
                  className={cn(
                    "absolute inset-0 transition-opacity duration-200 p-6 overflow-y-auto bg-[hsl(var(--sidebar-background))]",
                    rightView === "design" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                  )}
                >
                  <div className="max-w-xl mx-auto">
                    <ThemeSettings
                      onUpdate={(tokens) => chat.setDesignTokens(tokens)}
                      initialTokens={chat.designTokens || undefined}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {showTerminal && (
              <>
                <ResizableHandle className="h-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />
                <ResizablePanel defaultSize={30} minSize={15} id="terminal-view" order={2}>
                  <div className="h-full bg-[hsl(var(--background))] border-t border-border/10">
                    <TerminalPanel
                      lines={sandbox.terminalLines}
                      onCommand={sandbox.execCommand}
                      isDisabled={!sandbox.sandboxId}
                    />
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      {showSettings && (
        <ApiKeySettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onKeysUpdate={chat.setUserApiKeys}
        />
      )}
    </div>
  );
};

export default Workspace;
