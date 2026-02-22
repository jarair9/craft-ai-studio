import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SandboxFile } from "@/hooks/useSandbox";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  files: SandboxFile[];
  selectedPath: string | null;
  onFileClick: (path: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

function FileItem({
  file,
  depth,
  selectedPath,
  onFileClick,
}: {
  file: SandboxFile;
  depth: number;
  selectedPath: string | null;
  onFileClick: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDir = file.type === "dir";
  const isSelected = selectedPath === file.path;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onFileClick(file.path);
    }
  };

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const getFileColor = () => {
    if (isDir) return "text-muted-foreground";
    switch (ext) {
      case "ts":
      case "tsx":
        return "text-blue-400";
      case "js":
      case "jsx":
        return "text-yellow-400";
      case "css":
        return "text-pink-400";
      case "json":
        return "text-green-400";
      case "md":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-1 px-2 py-[3px] text-xs hover:bg-secondary/60 transition-colors rounded-sm",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            )}
          </>
        ) : (
          <>
            <span className="w-3" />
            <File className={cn("h-3.5 w-3.5 shrink-0", getFileColor())} />
          </>
        )}
        <span className={cn("truncate", getFileColor())}>{file.name}</span>
      </button>
      {isDir && expanded && file.children?.map((child) => (
        <FileItem
          key={child.path}
          file={child}
          depth={depth + 1}
          selectedPath={selectedPath}
          onFileClick={onFileClick}
        />
      ))}
    </>
  );
}

export function FileExplorer({ files, selectedPath, onFileClick, onRefresh, isLoading }: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explorer</span>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {files.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 px-3 py-4 text-center">
              No sandbox active. Create one to see files.
            </p>
          ) : (
            files.map((f) => (
              <FileItem
                key={f.path}
                file={f}
                depth={0}
                selectedPath={selectedPath}
                onFileClick={onFileClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
