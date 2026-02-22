import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Zap, Settings, Eye, Code2, Terminal, FolderTree, Play, Square,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ChatPanel } from "@/components/workspace/ChatPanel";
import { FileExplorer } from "@/components/workspace/FileExplorer";
import { CodeViewer } from "@/components/workspace/CodeViewer";
import { TerminalPanel } from "@/components/workspace/TerminalPanel";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";
import { ApiKeySettings } from "@/components/workspace/ApiKeySettings";
import { useAIChat } from "@/hooks/useAIChat";
import { useSandbox } from "@/hooks/useSandbox";

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("preview");
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useState(true);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-11 border-b border-border/50 flex items-center px-3 gap-2 shrink-0 bg-background/80 backdrop-blur-xl">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <span className="font-mono text-xs font-medium truncate max-w-[180px]">
            {project?.name || "Loading..."}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1">
          {sandbox.sandboxId ? (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-destructive" onClick={sandbox.killSandbox}>
              <Square className="h-3 w-3" /> Stop
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={sandbox.createSandbox} disabled={sandbox.isCreating}>
              <Play className="h-3 w-3" /> {sandbox.isCreating ? "Starting..." : "Start Sandbox"}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(true)}>
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main workspace */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Chat panel */}
        <ResizablePanel defaultSize={32} minSize={24} maxSize={50}>
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

        <ResizableHandle withHandle />

        {/* Right: Files + Code/Preview/Terminal */}
        <ResizablePanel defaultSize={68} minSize={40}>
          <ResizablePanelGroup direction="horizontal">
            {/* File explorer */}
            {showFiles && (
              <>
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                  <FileExplorer
                    files={sandbox.files}
                    selectedPath={sandbox.selectedFile?.path || null}
                    onFileClick={(path) => sandbox.readFile(path)}
                    onRefresh={() => sandbox.listFiles()}
                  />
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            {/* Main content area */}
            <ResizablePanel defaultSize={showFiles ? 78 : 100}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="border-b border-border/50 px-3 flex items-center">
                  <TabsList className="h-9 bg-transparent p-0 gap-0.5">
                    <TabsTrigger value="preview" className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-md text-[11px] gap-1 px-2.5 h-7">
                      <Eye className="h-3 w-3" /> Preview
                    </TabsTrigger>
                    <TabsTrigger value="code" className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-md text-[11px] gap-1 px-2.5 h-7">
                      <Code2 className="h-3 w-3" /> Code
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-md text-[11px] gap-1 px-2.5 h-7">
                      <Terminal className="h-3 w-3" /> Terminal
                    </TabsTrigger>
                  </TabsList>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => setShowFiles(!showFiles)}
                  >
                    <FolderTree className="h-3 w-3" />
                  </Button>
                </div>

                <TabsContent value="preview" className="flex-1 m-0">
                  <PreviewPanel
                    sandboxUrl={sandbox.sandboxUrl}
                    isCreating={sandbox.isCreating}
                    onCreateSandbox={sandbox.createSandbox}
                  />
                </TabsContent>

                <TabsContent value="code" className="flex-1 m-0">
                  <CodeViewer
                    filePath={sandbox.selectedFile?.path || null}
                    content={sandbox.selectedFile?.content || null}
                  />
                </TabsContent>

                <TabsContent value="terminal" className="flex-1 m-0">
                  <TerminalPanel
                    lines={sandbox.terminalLines}
                    onCommand={sandbox.execCommand}
                    isDisabled={!sandbox.sandboxId}
                  />
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
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
