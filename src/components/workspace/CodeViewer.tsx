import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeViewerProps {
  filePath: string | null;
  content: string | null;
  openTabs?: string[];
  onTabClick?: (path: string) => void;
  onTabClose?: (path: string) => void;
}

const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(
  ({ filePath, content, openTabs = [], onTabClick, onTabClose }, ref) => {
    if (!filePath || content === null) {
      return (
        <div ref={ref} className="h-full flex items-center justify-center bg-[hsl(var(--background))]">
          <div className="text-center space-y-3 opacity-40">
            <FileCode className="h-12 w-12 mx-auto" />
            <p className="text-xs text-muted-foreground">Select a file to view</p>
          </div>
        </div>
      );
    }

    const lines = content.split("\n");
    const fileName = filePath.split("/").pop() || filePath;

    return (
      <div ref={ref} className="h-full flex flex-col bg-[hsl(var(--background))]">
        {/* Editor tabs */}
        <div className="flex items-center border-b border-border/40 bg-[hsl(var(--sidebar-background))] overflow-x-auto">
          {(openTabs.length > 0 ? openTabs : [filePath]).map((tab) => {
            const tabName = tab.split("/").pop() || tab;
            const isActive = tab === filePath;
            return (
              <button
                key={tab}
                onClick={() => onTabClick?.(tab)}
                className={cn(
                  "group flex items-center gap-1.5 px-3 py-1.5 text-[12px] border-r border-border/30 transition-colors min-w-0 shrink-0",
                  isActive
                    ? "bg-[hsl(var(--background))] text-foreground border-t-2 border-t-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--secondary)/0.3)]"
                )}
              >
                <FileCode className="h-3 w-3 shrink-0 text-blue-400" />
                <span className="truncate">{tabName}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose?.(tab);
                  }}
                  className="ml-1 h-4 w-4 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-secondary transition-all"
                >
                  <X className="h-3 w-3" />
                </span>
              </button>
            );
          })}
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-1 border-b border-border/20 bg-[hsl(var(--background))]">
          <span className="text-[11px] font-mono text-muted-foreground/60">
            {filePath.replace(/^\//, "")}
          </span>
        </div>

        {/* Code area */}
        <ScrollArea className="flex-1">
          <div className="font-mono text-[12.5px] leading-[20px]">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-[hsl(var(--secondary)/0.2)] group">
                <span className="w-[52px] text-right pr-4 text-muted-foreground/30 select-none shrink-0 group-hover:text-muted-foreground/50">
                  {i + 1}
                </span>
                <pre className="pl-2 pr-6 whitespace-pre overflow-x-auto">
                  <code className="text-foreground/90">{line || " "}</code>
                </pre>
              </div>
            ))}
            {/* Bottom padding */}
            <div className="h-16" />
          </div>
        </ScrollArea>

        {/* Status bar */}
        <div className="h-6 border-t border-border/30 bg-[hsl(var(--sidebar-background))] flex items-center px-3 justify-between text-[10px] text-muted-foreground/50">
          <div className="flex items-center gap-3">
            <span>Ln {lines.length}, Col 1</span>
            <span>Spaces: 2</span>
          </div>
          <div className="flex items-center gap-3">
            <span>UTF-8</span>
            <span>{fileName.split(".").pop()?.toUpperCase()}</span>
          </div>
        </div>
      </div>
    );
  }
);

CodeViewer.displayName = "CodeViewer";

export { CodeViewer };
