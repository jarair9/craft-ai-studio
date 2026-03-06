import { useEffect, useRef } from "react";
import { Loader2, Monitor, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreviewPanelProps {
  isBooting: boolean;
  isReady: boolean;
  bootError?: string | null;
  previewUrl?: string | null;
  onBoot: () => void;
  onRetry?: () => void;
}

export function PreviewPanel({ isBooting, isReady, bootError, previewUrl, onBoot, onRetry }: PreviewPanelProps) {
  const didBoot = useRef(false);

  useEffect(() => {
    if (!didBoot.current) {
      didBoot.current = true;
      onBoot();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))] relative">
      {/* Preview URL bar */}
      <div
        className="h-9 flex items-center gap-2 px-3 border-b border-border/30 bg-[hsl(var(--sidebar-background))] shrink-0"
        style={{ display: isReady && previewUrl ? "flex" : "none" }}
      >
        <Monitor className="h-3.5 w-3.5 text-muted-foreground/40" />
        <div className="flex-1 h-6 rounded-md bg-secondary/50 border border-border/30 flex items-center px-2.5">
          <span className="text-[11px] text-muted-foreground/50 font-mono">localhost:5173</span>
        </div>
      </div>

      {/* Preview iframe */}
      {isReady && previewUrl && (
        <iframe
          src={previewUrl}
          className="flex-1 w-full border-0"
          title="App Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        />
      )}

      {/* Loading overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--background))] z-10"
        style={{ display: isReady && previewUrl ? "none" : "flex" }}
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
              <Monitor className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/60">
              {bootError ? "Failed to start" : isBooting ? "Setting up environment" : "Preview"}
            </p>
            <p className="text-xs text-muted-foreground/40">
              {bootError
                ? bootError
                : isBooting
                ? "Installing dependencies and starting dev server..."
                : "Your app preview will appear here"}
            </p>
          </div>
          {isBooting && (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
            </div>
          )}
          {bootError && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-2">
              <RotateCcw className="h-3.5 w-3.5" /> Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
