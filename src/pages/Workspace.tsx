import { useState, useMemo } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Zap, Settings, Eye, Code2, Terminal, Play, Square,
  Files, MessageSquare, Monitor,
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

type ActivityTab = "files" | "chat";
type MainTab = "code" | "preview";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activityTab, setActivityTab] = useState<ActivityTab>("files");
  const [mainTab, setMainTab] = useState<MainTab>("code");
  const [showSettings, setShowSettings] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
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

  // Use sandbox files if available, otherwise show default project tree
  const fileTree = sandbox.files.length > 0 ? sandbox.files : defaultTree;

  const handleFileClick = async (path: string) => {
    setSelectedFilePath(path);
    setMainTab("code");

    // Add tab if not open
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [...prev, path]);
    }

    // Try to read from sandbox if active, otherwise show placeholder
    if (sandbox.sandboxId) {
      const content = await sandbox.readFile(path);
      if (content) {
        setFileContents((prev) => ({ ...prev, [path]: content }));
      }
    } else if (!fileContents[path]) {
      // Show a placeholder for demo
      const fileName = path.split("/").pop() || "";
      setFileContents((prev) => ({
        ...prev,
        [path]: `// ${fileName}\n// File content will appear here when sandbox is active\n`,
      }));
    }
  };

  const handleTabClick = (path: string) => {
    setSelectedFilePath(path);
  };

  const handleTabClose = (path: string) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== path);
      if (selectedFilePath === path) {
        setSelectedFilePath(next.length > 0 ? next[next.length - 1] : null);
      }
      return next;
    });
  };

  const currentContent = selectedFilePath ? fileContents[selectedFilePath] ?? null : null;

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))]">
      {/* ── Title bar ── */}
      <div className="h-10 border-b border-border/40 flex items-center px-3 gap-2 shrink-0 bg-[hsl(var(--sidebar-background))]">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <span className="font-mono text-xs font-medium truncate max-w-[200px]">
            {project?.name || "Loading..."}
          </span>
        </div>

        {/* Center: main tab switcher */}
        <div className="ml-auto flex items-center gap-0.5 bg-secondary/40 rounded-lg p-0.5">
          <button
            onClick={() => setMainTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all",
              mainTab === "code"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Code2 className="h-3 w-3" /> Code
          </button>
          <button
            onClick={() => setMainTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all",
              mainTab === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Monitor className="h-3 w-3" /> Preview
          </button>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex items-center gap-1">
          {sandbox.sandboxId ? (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-destructive hover:text-destructive" onClick={sandbox.killSandbox}>
              <Square className="h-3 w-3" /> Stop
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1" onClick={sandbox.createSandbox} disabled={sandbox.isCreating}>
              <Play className="h-3 w-3" /> {sandbox.isCreating ? "Starting..." : "Run"}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal className={cn("h-3.5 w-3.5", showTerminal && "text-primary")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(true)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex min-h-0">
        {/* Activity bar (narrow icon strip) */}
        <div className="w-12 shrink-0 bg-[hsl(var(--sidebar-background))] border-r border-border/30 flex flex-col items-center pt-2 gap-1">
          <button
            onClick={() => setActivityTab("files")}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
              activityTab === "files"
                ? "text-foreground bg-secondary/50 border-l-2 border-l-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
            title="Explorer"
          >
            <Files className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActivityTab("chat")}
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
              activityTab === "chat"
                ? "text-foreground bg-secondary/50 border-l-2 border-l-primary"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            )}
            title="AI Chat"
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar + main content */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar panel (file explorer or chat) */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
            {activityTab === "files" ? (
              <FileExplorer
                files={fileTree as any}
                selectedPath={selectedFilePath}
                onFileClick={handleFileClick}
                projectName={project?.name}
              />
            ) : (
              <ChatPanel
                messages={chat.messages}
                isStreaming={chat.isStreaming}
                provider={chat.provider}
                model={chat.model}
                onProviderChange={chat.setProvider}
                onModelChange={chat.setModel}
                onSend={chat.sendMessage}
              />
            )}
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border/30 hover:bg-primary/30 transition-colors" />

          {/* Main content panel */}
          <ResizablePanel defaultSize={80} minSize={50}>
            <ResizablePanelGroup direction="vertical">
              {/* Editor / Preview */}
              <ResizablePanel defaultSize={showTerminal ? 75 : 100} minSize={30}>
                {mainTab === "code" ? (
                  <CodeViewer
                    filePath={selectedFilePath}
                    content={currentContent}
                    openTabs={openTabs}
                    onTabClick={handleTabClick}
                    onTabClose={handleTabClose}
                  />
                ) : (
                  <PreviewPanel
                    sandboxUrl={sandbox.sandboxUrl}
                    isCreating={sandbox.isCreating}
                    onCreateSandbox={sandbox.createSandbox}
                  />
                )}
              </ResizablePanel>

              {/* Terminal */}
              {showTerminal && (
                <>
                  <ResizableHandle className="h-px bg-border/30 hover:bg-primary/30 transition-colors" />
                  <ResizablePanel defaultSize={25} minSize={10} maxSize={50}>
                    <TerminalPanel
                      lines={sandbox.terminalLines}
                      onCommand={sandbox.execCommand}
                      isDisabled={!sandbox.sandboxId}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
