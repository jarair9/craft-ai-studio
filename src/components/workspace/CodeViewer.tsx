import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode } from "lucide-react";

interface CodeViewerProps {
  filePath: string | null;
  content: string | null;
}

const CodeViewer = forwardRef<HTMLDivElement, CodeViewerProps>(
  ({ filePath, content }, ref) => {
    if (!filePath || content === null) {
      return (
        <div ref={ref} className="h-full flex items-center justify-center bg-[hsl(var(--background))]">
          <div className="text-center space-y-3 opacity-30">
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
        {/* File tab bar */}
        <div className="h-9 flex items-center border-b border-border/30 bg-[hsl(var(--sidebar-background))]">
          <div className="flex items-center gap-2 px-4 h-full border-b-2 border-b-primary">
            <FileCode className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span className="text-[12px] text-foreground">{fileName}</span>
          </div>
        </div>

        {/* Code lines */}
        <ScrollArea className="flex-1">
          <div className="font-mono text-[13px] leading-[22px] py-1">
            {lines.map((line, i) => (
              <div key={i} className="flex hover:bg-secondary/20 group">
                <span className="w-[56px] text-right pr-5 text-muted-foreground/25 select-none shrink-0 group-hover:text-muted-foreground/40">
                  {i + 1}
                </span>
                <pre className="pr-6 whitespace-pre overflow-x-auto">
                  <code className="text-foreground/85">{line || " "}</code>
                </pre>
              </div>
            ))}
            <div className="h-12" />
          </div>
        </ScrollArea>
      </div>
    );
  }
);

CodeViewer.displayName = "CodeViewer";

export { CodeViewer };
