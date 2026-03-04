import { useState, useEffect, useRef, useCallback } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Zap, Settings, Eye, Code2, Share2,
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
import { useStackBlitz } from "@/hooks/useStackBlitz";
import { cn } from "@/lib/utils";

type RightView = "preview" | "code";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rightView, setRightView] = useState<RightView>("preview");
  const [showSettings, setShowSettings] = useState(false);
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
  const stackblitz = useStackBlitz();
  const didInit = useRef(false);

  // Keep AI chat aware of current project files
  useEffect(() => {
    chat.updateProjectFiles(fileContents);
  }, [fileContents, chat.updateProjectFiles]);

  // Wire up AI file writes → StackBlitz + local state
  useEffect(() => {
    chat.fileWriteRef.current = async (files: ParsedFile[], deps: string[]) => {
      setBuildComplete(false);

      // Install dependencies first
      if (deps.length > 0 && stackblitz.isReady) {
        setWritingFiles(["📦 Installing " + deps.join(", ") + "..."]);
        await stackblitz.installDeps(deps);
        await new Promise((r) => setTimeout(r, 500));
      }

      // Show writing indicators and update local state
      for (const f of files) {
        setWritingFiles((prev) => {
          const filtered = prev.filter((p) => !p.startsWith("📦"));
          return [...filtered, `→ Writing ${f.path}`];
        });
        setFileContents((prev) => ({ ...prev, [f.path]: f.content }));
        await new Promise((r) => setTimeout(r, 200));
      }

      // Write all files to StackBlitz
      if (stackblitz.isReady && files.length > 0) {
        await stackblitz.writeFiles(files.map((f) => ({ path: f.path, content: f.content })));
      }

      // Auto-select first file and switch to code view
      if (files.length > 0) {
        setSelectedFilePath(files[0].path);
      }

      // Clear indicators
      setTimeout(() => {
        setWritingFiles([]);
        setBuildComplete(true);
        setTimeout(() => setBuildComplete(false), 4000);
      }, 400);
    };
  }, [stackblitz.isReady, stackblitz.writeFiles, stackblitz.installDeps]);

  // Send initial prompt from project description
  useEffect(() => {
    if (didInit.current || !project) return;
    didInit.current = true;

    if (project.description && !chat.initialPromptSent) {
      chat.setInitialPromptSent(true);
      chat.sendMessage(project.description);
    }
  }, [project]);

  const handleContainerReady = useCallback(
    (el: HTMLElement) => {
      stackblitz.boot(el);
    },
    [stackblitz.boot]
  );

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
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-all"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="default" size="sm" className="h-7 text-[11px] gap-1.5 font-medium">
            <Share2 className="h-3 w-3" /> Share
          </Button>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel defaultSize={30} minSize={22} maxSize={45}>
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

        <ResizablePanel defaultSize={70} minSize={45}>
          <div className="h-full relative overflow-hidden">
            {/* Preview — always mounted */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-200",
                rightView === "preview" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <PreviewPanel
                isBooting={stackblitz.isBooting}
                isReady={stackblitz.isReady}
                onContainerReady={handleContainerReady}
              />
            </div>

            {/* Code view */}
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-200",
                rightView === "code" ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              )}
            >
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={28} minSize={18} maxSize={40}>
                  <FileExplorer
                    filePaths={filePaths}
                    selectedPath={selectedFilePath}
                    onFileClick={handleFileClick}
                    projectName={project?.name}
                  />
                </ResizablePanel>
                <ResizableHandle className="w-[1px] bg-border/30 hover:bg-primary/40 transition-colors" />
                <ResizablePanel defaultSize={72} minSize={40}>
                  <CodeViewer
                    filePath={selectedFilePath}
                    content={currentContent}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
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
