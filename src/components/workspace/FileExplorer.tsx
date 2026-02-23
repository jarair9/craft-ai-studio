import { useState } from "react";
import {
  ChevronRight,
  File,
  Folder,
  Search,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNode[];
}

interface FileExplorerProps {
  files: TreeNode[];
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
  node: TreeNode;
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
            <Folder className="h-4 w-4 shrink-0 text-muted-foreground/70" />
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" />
            <File className="h-4 w-4 shrink-0 text-muted-foreground/50" />
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

/** Build a default project file tree */
export function buildDefaultTree(): TreeNode[] {
  return [
    {
      name: "src",
      path: "/src",
      type: "dir",
      children: [
        {
          name: "components",
          path: "/src/components",
          type: "dir",
          children: [
            { name: "Navbar.tsx", path: "/src/components/Navbar.tsx", type: "file" },
            { name: "HeroSection.tsx", path: "/src/components/HeroSection.tsx", type: "file" },
            { name: "Footer.tsx", path: "/src/components/Footer.tsx", type: "file" },
            { name: "TemplatesGrid.tsx", path: "/src/components/TemplatesGrid.tsx", type: "file" },
            { name: "FeaturesSection.tsx", path: "/src/components/FeaturesSection.tsx", type: "file" },
            { name: "PricingSection.tsx", path: "/src/components/PricingSection.tsx", type: "file" },
          ],
        },
        {
          name: "hooks",
          path: "/src/hooks",
          type: "dir",
          children: [
            { name: "useAIChat.ts", path: "/src/hooks/useAIChat.ts", type: "file" },
            { name: "useAuth.tsx", path: "/src/hooks/useAuth.tsx", type: "file" },
            { name: "useSandbox.ts", path: "/src/hooks/useSandbox.ts", type: "file" },
          ],
        },
        {
          name: "pages",
          path: "/src/pages",
          type: "dir",
          children: [
            { name: "Index.tsx", path: "/src/pages/Index.tsx", type: "file" },
            { name: "Dashboard.tsx", path: "/src/pages/Dashboard.tsx", type: "file" },
            { name: "Workspace.tsx", path: "/src/pages/Workspace.tsx", type: "file" },
            { name: "Auth.tsx", path: "/src/pages/Auth.tsx", type: "file" },
          ],
        },
        { name: "App.tsx", path: "/src/App.tsx", type: "file" },
        { name: "App.css", path: "/src/App.css", type: "file" },
        { name: "index.css", path: "/src/index.css", type: "file" },
        { name: "main.tsx", path: "/src/main.tsx", type: "file" },
      ],
    },
    {
      name: "supabase",
      path: "/supabase",
      type: "dir",
      children: [
        {
          name: "functions",
          path: "/supabase/functions",
          type: "dir",
          children: [
            { name: "ai-chat", path: "/supabase/functions/ai-chat", type: "dir", children: [
              { name: "index.ts", path: "/supabase/functions/ai-chat/index.ts", type: "file" },
            ]},
            { name: "sandbox", path: "/supabase/functions/sandbox", type: "dir", children: [
              { name: "index.ts", path: "/supabase/functions/sandbox/index.ts", type: "file" },
            ]},
          ],
        },
      ],
    },
    { name: ".env", path: "/.env", type: "file" },
    { name: ".gitignore", path: "/.gitignore", type: "file" },
    { name: "eslint.config.js", path: "/eslint.config.js", type: "file" },
    { name: "index.html", path: "/index.html", type: "file" },
    { name: "package.json", path: "/package.json", type: "file" },
    { name: "postcss.config.js", path: "/postcss.config.js", type: "file" },
    { name: "README.md", path: "/README.md", type: "file" },
    { name: "tailwind.config.ts", path: "/tailwind.config.ts", type: "file" },
    { name: "tsconfig.json", path: "/tsconfig.json", type: "file" },
    { name: "vite.config.ts", path: "/vite.config.ts", type: "file" },
  ];
}

export function FileExplorer({ files, selectedPath, onFileClick, projectName }: FileExplorerProps) {
  const [activeTab, setActiveTab] = useState<"files" | "search">("files");
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten files for search
  const flattenFiles = (nodes: TreeNode[]): TreeNode[] => {
    const result: TreeNode[] = [];
    for (const node of nodes) {
      if (node.type === "file") result.push(node);
      if (node.children) result.push(...flattenFiles(node.children));
    }
    return result;
  };

  const filteredFiles = searchQuery
    ? flattenFiles(files).filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-border/20">
      {/* Tabs: Files | Search */}
      <div className="flex items-center border-b border-border/30">
        <button
          onClick={() => setActiveTab("files")}
          className={cn(
            "flex-1 py-2.5 text-[13px] font-medium text-center transition-colors border-b-2",
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
            "flex-1 py-2.5 text-[13px] font-medium text-center transition-colors border-b-2",
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
            files.map((f) => (
              <FileItem
                key={f.path}
                node={f}
                depth={0}
                selectedPath={selectedPath}
                onFileClick={onFileClick}
                defaultExpanded={f.name === "src"}
              />
            ))
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
