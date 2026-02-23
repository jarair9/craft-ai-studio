import { Eye, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PreviewPanelProps {
  sandboxUrl: string | null;
  isCreating: boolean;
  onCreateSandbox: () => void;
}

export function PreviewPanel({ sandboxUrl, isCreating, onCreateSandbox }: PreviewPanelProps) {
  const [iframeKey, setIframeKey] = useState(0);

  if (!sandboxUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-secondary/40 border border-border/50 flex items-center justify-center">
            {isCreating ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <Eye className="h-7 w-7 text-muted-foreground/30" />
            )}
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground/80">
              {isCreating ? "Starting sandbox..." : "No live preview"}
            </p>
            <p className="text-[11px] text-muted-foreground/50 max-w-[220px] mx-auto leading-relaxed">
              {isCreating
                ? "Setting up your dev environment"
                : "Start a sandbox to see your app running live"}
            </p>
          </div>
          {!isCreating && (
            <Button size="sm" onClick={onCreateSandbox} className="mt-1">
              Start Sandbox
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      {/* URL bar */}
      <div className="h-9 px-3 border-b border-border/40 bg-[hsl(var(--sidebar-background))] flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIframeKey((k) => k + 1)}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
        <div className="flex-1 bg-[hsl(var(--secondary)/0.5)] rounded-md px-3 py-1 text-[11px] font-mono text-muted-foreground truncate">
          {sandboxUrl}
        </div>
        <a href={sandboxUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
      <iframe
        key={iframeKey}
        src={sandboxUrl}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Sandbox Preview"
      />
    </div>
  );
}
