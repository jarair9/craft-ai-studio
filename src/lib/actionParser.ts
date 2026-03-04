/**
 * Parses AI agent output into structured segments:
 * - text: Markdown explanations, reasoning, plans
 * - file: Tagged code blocks (```tsx:src/App.tsx)
 * - deps: Dependency install blocks (```deps)
 */

export interface ActionSegment {
  type: "text" | "file" | "deps";
  content: string;
  filePath?: string;
  language?: string;
}

export function parseAgentContent(content: string): ActionSegment[] {
  const segments: ActionSegment[] = [];
  // Match complete code blocks: ```lang:path\n...\n``` and ```deps\n...\n```
  const blockRegex = /```([\w]*)(?::([\w/.\-@]+))?\s*\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    // Text before this block
    const textBefore = content.slice(lastIndex, match.index).trim();
    if (textBefore) {
      segments.push({ type: "text", content: textBefore });
    }

    const lang = match[1];
    const filePath = match[2];
    const codeContent = match[3];

    if (lang === "deps") {
      segments.push({ type: "deps", content: codeContent.trim() });
    } else if (filePath) {
      // Tagged file block
      const cleanPath = filePath.replace(/^\/?(home\/user\/app\/)?/, "");
      segments.push({
        type: "file",
        content: codeContent,
        filePath: cleanPath,
        language: lang || "tsx",
      });
    } else {
      // Regular code block — keep as text (markdown will render it)
      segments.push({ type: "text", content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last block
  const remaining = content.slice(lastIndex).trim();
  if (remaining) {
    segments.push({ type: "text", content: remaining });
  }

  return segments;
}

/** Extract all file paths from parsed segments */
export function extractFilePaths(segments: ActionSegment[]): string[] {
  return segments
    .filter((s) => s.type === "file" && s.filePath)
    .map((s) => s.filePath!);
}

/** Build a file tree structure from flat file paths */
export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: FileTreeNode[];
}

export function buildTreeFromPaths(paths: string[]): FileTreeNode[] {
  const root: Record<string, any> = {};

  for (const p of paths) {
    const clean = p.replace(/^\//, "");
    const parts = clean.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = i === parts.length - 1 ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    }
  }

  function buildNodes(obj: Record<string, any>, prefix: string): FileTreeNode[] {
    const dirs: FileTreeNode[] = [];
    const files: FileTreeNode[] = [];

    for (const key of Object.keys(obj).sort()) {
      const fullPath = prefix ? `${prefix}/${key}` : key;
      if (obj[key] === null) {
        files.push({ name: key, path: fullPath, type: "file" });
      } else {
        dirs.push({
          name: key,
          path: fullPath,
          type: "dir",
          children: buildNodes(obj[key], fullPath),
        });
      }
    }

    return [...dirs, ...files];
  }

  return buildNodes(root, "");
}
