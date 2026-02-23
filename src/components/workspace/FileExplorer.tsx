import { useState, useMemo } from "react";
import {
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  Image,
  Settings,
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

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "ts":
    case "tsx":
      return <FileCode className="h-3.5 w-3.5 shrink-0 text-blue-400" />;
    case "js":
    case "jsx":
      return <FileCode className="h-3.5 w-3.5 shrink-0 text-yellow-400" />;
    case "css":
      return <FileCode className="h-3.5 w-3.5 shrink-0 text-pink-400" />;
    case "json":
      return <FileJson className="h-3.5 w-3.5 shrink-0 text-amber-400" />;
    case "md":
      return <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
    case "svg":
    case "png":
    case "jpg":
    case "ico":
      return <Image className="h-3.5 w-3.5 shrink-0 text-emerald-400" />;
    case "toml":
    case "yml":
    case "yaml":
      return <Settings className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
    default:
      return <File className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />;
  }
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
          "w-full flex items-center gap-1.5 py-[3px] text-[12px] leading-5 transition-colors cursor-pointer select-none",
          "hover:bg-[hsl(var(--secondary)/0.6)]",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: `${depth * 14 + 12}px`, paddingRight: 8 }}
      >
        {isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
            )}
            {expanded ? (
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            ) : (
              <Folder className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            {getFileIcon(node.name)}
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
      name: "public",
      path: "/public",
      type: "dir",
      children: [
        { name: "favicon.ico", path: "/public/favicon.ico", type: "file" },
        { name: "placeholder.svg", path: "/public/placeholder.svg", type: "file" },
        { name: "robots.txt", path: "/public/robots.txt", type: "file" },
      ],
    },
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
            {
              name: "ui",
              path: "/src/components/ui",
              type: "dir",
              children: [
                { name: "button.tsx", path: "/src/components/ui/button.tsx", type: "file" },
                { name: "card.tsx", path: "/src/components/ui/card.tsx", type: "file" },
                { name: "dialog.tsx", path: "/src/components/ui/dialog.tsx", type: "file" },
                { name: "input.tsx", path: "/src/components/ui/input.tsx", type: "file" },
                { name: "tabs.tsx", path: "/src/components/ui/tabs.tsx", type: "file" },
              ],
            },
            {
              name: "workspace",
              path: "/src/components/workspace",
              type: "dir",
              children: [
                { name: "ChatPanel.tsx", path: "/src/components/workspace/ChatPanel.tsx", type: "file" },
                { name: "CodeViewer.tsx", path: "/src/components/workspace/CodeViewer.tsx", type: "file" },
                { name: "FileExplorer.tsx", path: "/src/components/workspace/FileExplorer.tsx", type: "file" },
                { name: "PreviewPanel.tsx", path: "/src/components/workspace/PreviewPanel.tsx", type: "file" },
                { name: "TerminalPanel.tsx", path: "/src/components/workspace/TerminalPanel.tsx", type: "file" },
              ],
            },
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
    { name: "index.html", path: "/index.html", type: "file" },
    { name: "package.json", path: "/package.json", type: "file" },
    { name: "tailwind.config.ts", path: "/tailwind.config.ts", type: "file" },
    { name: "tsconfig.json", path: "/tsconfig.json", type: "file" },
    { name: "vite.config.ts", path: "/vite.config.ts", type: "file" },
  ];
}

export function FileExplorer({ files, selectedPath, onFileClick, projectName }: FileExplorerProps) {
  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] select-none">
      {/* Section header */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
          {projectName || "Explorer"}
        </span>
      </div>

      {/* File tree */}
      <ScrollArea className="flex-1">
        <div className="pb-4">
          {files.map((f) => (
            <FileItem
              key={f.path}
              node={f}
              depth={0}
              selectedPath={selectedPath}
              onFileClick={onFileClick}
              defaultExpanded={f.name === "src"}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
