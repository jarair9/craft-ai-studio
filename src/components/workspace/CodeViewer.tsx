import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCode } from "lucide-react";

interface CodeViewerProps {
  filePath: string | null;
  content: string | null;
}

export function CodeViewer({ filePath, content }: CodeViewerProps) {
  if (!filePath || content === null) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <FileCode className="h-10 w-10 mx-auto opacity-20" />
          <p className="text-xs">Select a file to view its code</p>
        </div>
      </div>
    );
  }

  const lines = content.split("\n");
  const ext = filePath.split(".").pop()?.toLowerCase() || "";

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* File tab */}
      <div className="px-3 py-1.5 border-b border-border/50 flex items-center gap-2">
        <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">{filePath}</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-0 font-mono text-xs leading-5">
          {lines.map((line, i) => (
            <div key={i} className="flex hover:bg-secondary/30">
              <span className="w-10 text-right pr-3 text-muted-foreground/40 select-none shrink-0 border-r border-border/30">
                {i + 1}
              </span>
              <pre className="pl-3 pr-4 whitespace-pre-wrap break-all">
                <code>{line || " "}</code>
              </pre>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
