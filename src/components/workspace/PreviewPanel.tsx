import { Eye, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  sandboxUrl: string | null;
  isCreating: boolean;
  onCreateSandbox: () => void;
}

export function PreviewPanel({ sandboxUrl, isCreating, onCreateSandbox }: PreviewPanelProps) {
  if (!sandboxUrl) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 mx-auto rounded-xl bg-secondary/50 border border-border flex items-center justify-center">
            {isCreating ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Eye className="h-6 w-6 opacity-30" />
            )}
          </div>
          <p className="text-sm font-medium">
            {isCreating ? "Starting sandbox..." : "No sandbox running"}
          </p>
          <p className="text-xs text-muted-foreground/60 max-w-[200px]">
            {isCreating
              ? "Setting up your development environment"
              : "Create a sandbox to see live preview"}
          </p>
          {!isCreating && (
            <Button size="sm" onClick={onCreateSandbox} className="mt-2">
              Start Sandbox
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-1.5 border-b border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-mono truncate max-w-[70%]">
          {sandboxUrl}
        </span>
        <a href={sandboxUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <ExternalLink className="h-3 w-3" />
          </Button>
        </a>
      </div>
      <iframe
        src={sandboxUrl}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Sandbox Preview"
      />
    </div>
  );
}
