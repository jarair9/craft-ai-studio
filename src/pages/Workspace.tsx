import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Zap, Settings, Eye, Code2, Terminal as TerminalIcon, Play, Square,
  Share2, ChevronDown,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { FileExplorer, buildDefaultTree } from "@/components/workspace/FileExplorer";
import { CodeViewer } from "@/components/workspace/CodeViewer";
import { TerminalPanel } from "@/components/workspace/TerminalPanel";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { ApiKeySettings } from "@/components/workspace/ApiKeySettings";
import { useAIChat } from "@/hooks/useAIChat";
import { useSandbox } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

type RightView = "preview" | "code";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rightView, setRightView] = useState<RightView>("preview");
  const [showSettings, setShowSettings] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

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
  const defaultTree = useMemo(() => buildDefaultTree(), []);
  const fileTree = sandbox.files.length > 0 ? sandbox.files : defaultTree;
  const didInit = useRef(false);

  // Wire up AI file writes → sandbox + local state
  const handleAIFileWrite = useCallback(
    (filePath: string, content: string) => {
      // Save to local file contents for immediate code viewer display
      setFileContents((prev) => ({ ...prev, [filePath]: content }));
      // Also write to sandbox if active
      if (sandbox.sandboxId) {
        sandbox.writeFile(filePath, content);
      }
    },
    [sandbox.sandboxId, sandbox.writeFile]
  );

  useEffect(() => {
    chat.setOnFileWrite(() => handleAIFileWrite);
  }, [handleAIFileWrite]);

  // Auto-start sandbox + send initial prompt from project description
  useEffect(() => {
    if (didInit.current || !project) return;
    didInit.current = true;

    // Auto-create sandbox
    sandbox.createSandbox().catch(() => {});

    // Send the project description as the first chat message
    if (project.description && !chat.initialPromptSent) {
      chat.setInitialPromptSent(true);
      chat.sendMessage(project.description);
    }
  }, [project]);

  const handleFileClick = async (path: string) => {
    setSelectedFilePath(path);
    setRightView("code");

    if (sandbox.sandboxId) {
      const content = await sandbox.readFile(path);
      if (content) {
        setFileContents((prev) => ({ ...prev, [path]: content }));
      }
    } else if (!fileContents[path]) {
      const fileName = path.split("/").pop() || "";
      setFileContents((prev) => ({
        ...prev,
        [path]: `// ${fileName}\n// File content will appear here when sandbox is active\n`,
      }));
    }
  };

  const currentContent = selectedFilePath ? fileContents[selectedFilePath] ?? null : null;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))]">
      {/* ── Top bar ── */}
      <header className="h-11 border-b border-border/40 flex items-center px-3 shrink-0 bg-[hsl(var(--sidebar-background))]">
        {/* Left: logo + project name */}
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

        {/* Center: view toggle pills */}
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
            onClick={() => setShowTerminal(!showTerminal)}
            className={cn(
              "p-1.5 rounded-md transition-all",
              showTerminal ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            title="Terminal"
          >
            <TerminalIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2">
          {sandbox.sandboxId ? (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 text-destructive hover:text-destructive" onClick={sandbox.killSandbox}>
              <Square className="h-3 w-3" /> Stop
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5" onClick={sandbox.createSandbox} disabled={sandbox.isCreating}>
              <Play className="h-3 w-3" /> {sandbox.isCreating ? "Starting..." : "Run"}
            </Button>
          )}
          <Button variant="default" size="sm" className="h-7 text-[11px] gap-1.5 font-medium">
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </header>

      {/* ── Main content ── */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* LEFT: Chat panel (always visible) */}
        <ResizablePanel defaultSize={30} minSize={22} maxSize={45}>
          <ChatPanel
            messages={chat.messages}
            isStreaming={chat.isStreaming}
            provider={chat.provider}
            model={chat.model}
            onProviderChange={chat.setProvider}
            onModelChange={chat.setModel}
            onSend={chat.sendMessage}
          />
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />

        {/* RIGHT: Preview / Code+Files / Terminal */}
        <ResizablePanel defaultSize={70} minSize={45}>
          {rightView === "preview" ? (
            /* Preview mode — full right panel */
            <div className="h-full flex flex-col">
              <div className="flex-1">
                <PreviewPanel
                  sandboxUrl={sandbox.sandboxUrl}
                  isCreating={sandbox.isCreating}
                  onCreateSandbox={sandbox.createSandbox}
                />
              </div>
              {showTerminal && (
                <div className="h-[180px] shrink-0 border-t border-border/30">
                  <TerminalPanel
                    lines={sandbox.terminalLines}
                    onCommand={sandbox.execCommand}
                    isDisabled={!sandbox.sandboxId}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Code mode — file list + editor + terminal */
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <ResizablePanelGroup direction="horizontal">
                  {/* File list */}
                  <ResizablePanel defaultSize={28} minSize={18} maxSize={40}>
                    <FileExplorer
                      files={fileTree as any}
                      selectedPath={selectedFilePath}
                      onFileClick={handleFileClick}
                      projectName={project?.name}
                    />
                  </ResizablePanel>

                  <ResizableHandle className="w-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />

                  {/* Code editor */}
                  <ResizablePanel defaultSize={72} minSize={40}>
                    <CodeViewer
                      filePath={selectedFilePath}
                      content={currentContent}
                    />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>

              {/* Terminal at bottom */}
              {showTerminal && (
                <div className="h-[180px] shrink-0 border-t border-border/30">
                  <TerminalPanel
                    lines={sandbox.terminalLines}
                    onCommand={sandbox.execCommand}
                    isDisabled={!sandbox.sandboxId}
                  />
                </div>
              )}
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Settings modal */}
      <ApiKeySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onKeysUpdate={chat.setUserApiKeys}
      />
    </div>
  );
};

export default Workspace;
