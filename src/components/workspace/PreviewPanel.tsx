import { useEffect, useRef } from "react";
import { Loader2, Zap } from "lucide-react";

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
      {/* StackBlitz container */}
      <div
        ref={containerRef}
        className="flex-1 w-full [&>iframe]:!border-0"
        style={{ display: isReady || isBooting ? "block" : "block" }}
      />

      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--background))] z-10">
          <div className="text-center space-y-4">
            <Zap className="h-16 w-16 text-muted-foreground/15 mx-auto" />
            <p className="text-sm text-muted-foreground/40">
              {isBooting ? "Setting up environment..." : "Your preview will appear here"}
            </p>
            {isBooting && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground/50">Installing dependencies...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
