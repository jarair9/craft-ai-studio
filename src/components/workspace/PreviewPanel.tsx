import { useEffect, useRef } from "react";
import { Loader2, Monitor } from "lucide-react";

interface PreviewPanelProps {
  isBooting: boolean;
  isReady: boolean;
  onContainerReady: (el: HTMLElement) => void;
}

export function PreviewPanel({ isBooting, isReady, onContainerReady }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const didBoot = useRef(false);

  useEffect(() => {
    if (containerRef.current && !didBoot.current) {
      didBoot.current = true;
      onContainerReady(containerRef.current);
    }
  }, [onContainerReady]);

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))] relative">
      {/* Preview URL bar — always rendered, visibility toggled */}
      <div
        className="h-9 flex items-center gap-2 px-3 border-b border-border/30 bg-[hsl(var(--sidebar-background))] shrink-0"
        style={{ display: isReady ? "flex" : "none" }}
      >
        <Monitor className="h-3.5 w-3.5 text-muted-foreground/40" />
        <div className="flex-1 h-6 rounded-md bg-secondary/50 border border-border/30 flex items-center px-2.5">
          <span className="text-[11px] text-muted-foreground/50 font-mono">localhost:3000</span>
        </div>
      </div>

      {/* StackBlitz container — aggressively hide all branding */}
      <div
        ref={containerRef}
        className="flex-1 w-full stackblitz-embed"
      />

      {/* Loading overlay — always rendered, visibility toggled */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--background))] z-10"
        style={{ display: isReady ? "none" : "flex" }}
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto">
              <Monitor className="h-8 w-8 text-muted-foreground/20" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/60">
              {isBooting ? "Setting up environment" : "Preview"}
            </p>
            <p className="text-xs text-muted-foreground/40">
              {isBooting
                ? "Installing dependencies and starting dev server..."
                : "Your app preview will appear here"}
            </p>
          </div>
          {isBooting && (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary/60" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
