import { useState } from "react";
import {
  ChevronRight,
  File,
  Folder,
  Search,
  FolderOpen,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { buildTreeFromPaths, type FileTreeNode } from "@/lib/actionParser";

interface FileExplorerProps {
  filePaths: string[];
  selectedPath: string | null;
  onFileClick: (path: string) => void;
  projectName?: string;
}

function FileItem({
  node,
  depth,
  selectedPath,
  onFileClick,
  defaultExpanded = false,
}: {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onFileClick: (path: string) => void;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isDir = node.type === "dir";
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      onFileClick(node.path);
    }
  };

  // Color-code by file extension
  const ext = node.name.split(".").pop()?.toLowerCase();
  const iconColor =
    ext === "tsx" || ext === "jsx"
      ? "text-blue-400/70"
      : ext === "ts" || ext === "js"
        ? "text-yellow-400/70"
        : ext === "css"
          ? "text-purple-400/70"
          : ext === "json"
            ? "text-green-400/70"
            : "text-muted-foreground/50";

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-1.5 py-[5px] text-[13px] transition-colors cursor-pointer",
          "hover:bg-secondary/50",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${depth * 16 + 16}px`, paddingRight: 12 }}
      >
        {isDir ? (
          <>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform",
                expanded && "rotate-90"
              )}
            />
            {expanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-amber-400/70" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-amber-400/70" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className={cn("h-4 w-4 shrink-0", iconColor)} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isDir &&
        expanded &&
        node.children?.map((child) => (
          <FileItem
            key={child.path}
            node={child}
            depth={depth + 1}
            selectedPath={selectedPath}
            onFileClick={onFileClick}
            defaultExpanded={child.name === "src"}
          />
        ))}
    </>
  );
}

export function FileExplorer({ filePaths, selectedPath, onFileClick, projectName }: FileExplorerProps) {
  const [activeTab, setActiveTab] = useState<"files" | "search">("files");
  const [searchQuery, setSearchQuery] = useState("");

  const tree = buildTreeFromPaths(filePaths);

  // Flatten for search
  const flatFiles = filePaths.map((p) => ({
    name: p.split("/").pop() || p,
    path: p,
  }));

  const filteredFiles = searchQuery
    ? flatFiles.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.path.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-border/20">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border/30 flex items-center gap-2">
        <Folder className="h-4 w-4 text-amber-400/70" />
        <span className="text-[12px] font-medium text-foreground/70 uppercase tracking-wider">
          {projectName || "Explorer"}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/30">
          {filePaths.length} files
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border/30">
        <button
          onClick={() => setActiveTab("files")}
          className={cn(
            "flex-1 py-2 text-[12px] font-medium text-center transition-colors border-b-2",
            activeTab === "files"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={cn(
            "flex-1 py-2 text-[12px] font-medium text-center transition-colors border-b-2",
            activeTab === "search"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Search
        </button>
      </div>

      {activeTab === "search" && (
        <div className="px-3 py-2 border-b border-border/20">
          <div className="flex items-center gap-2 bg-secondary/40 rounded-md px-2.5 py-1.5 border border-border/30">
            <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="flex-1 bg-transparent outline-none text-[12px] text-foreground placeholder:text-muted-foreground/40"
              autoFocus
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="py-1">
          {activeTab === "files" ? (
            tree.length > 0 ? (
              tree.map((f) => (
                <FileItem
                  key={f.path}
                  node={f}
                  depth={0}
                  selectedPath={selectedPath}
                  onFileClick={onFileClick}
                  defaultExpanded={f.name === "src"}
                />
              ))
            ) : (
              <div className="text-center py-12 space-y-2">
                <File className="h-8 w-8 mx-auto text-muted-foreground/20" />
                <p className="text-[12px] text-muted-foreground/40">
                  No files yet
                </p>
                <p className="text-[11px] text-muted-foreground/30">
                  Ask the AI to build something
                </p>
              </div>
            )
          ) : searchQuery ? (
            filteredFiles.length > 0 ? (
              filteredFiles.map((f) => (
                <button
                  key={f.path}
                  onClick={() => onFileClick(f.path)}
                  className={cn(
                    "w-full flex items-center gap-2 px-4 py-[5px] text-[13px] hover:bg-secondary/50 transition-colors",
                    selectedPath === f.path && "bg-primary/10 text-primary"
                  )}
                >
                  <File className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                  <span className="truncate">{f.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/30 truncate max-w-[120px]">
                    {f.path}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-[12px] text-muted-foreground/40 text-center py-6">No matches</p>
            )
          ) : (
            <p className="text-[12px] text-muted-foreground/40 text-center py-6">Type to search…</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
