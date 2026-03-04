import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  ChevronDown,
  ChevronRight,
  Package,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { parseAgentContent, type ActionSegment } from "@/lib/actionParser";
import { cn } from "@/lib/utils";

interface AgentMessageProps {
  content: string;
  isStreaming?: boolean;
}

function FileActionCard({ segment }: { segment: ActionSegment }) {
  const [expanded, setExpanded] = useState(false);
  const fileName = segment.filePath?.split("/").pop() || "";
  const lineCount = segment.content.split("\n").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-primary/15 bg-primary/[0.03] overflow-hidden my-2"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/[0.05] transition-colors"
      >
        <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <FileCode className="h-3 w-3 text-primary" />
        </div>
        <span className="text-[12px] font-mono text-foreground/80 truncate flex-1 text-left">
          {segment.filePath}
        </span>
        <span className="text-[10px] text-muted-foreground/40">{lineCount} lines</span>
        <div className="h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Check className="h-2.5 w-2.5 text-emerald-500" />
        </div>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="border-t border-primary/10 bg-secondary/30 max-h-[300px] overflow-auto">
              <pre className="p-3 text-[11px] leading-[18px] font-mono text-foreground/70">
                <code>{segment.content}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DepsActionCard({ segment }: { segment: ActionSegment }) {
  const deps = segment.content.split("\n").filter(Boolean);
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-amber-500/15 bg-amber-500/[0.03] px-3 py-2 my-2"
    >
      <div className="flex items-center gap-2 mb-1.5">
        <Package className="h-3.5 w-3.5 text-amber-500/70" />
        <span className="text-[12px] font-medium text-amber-500/80">
          Installing dependencies
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {deps.map((dep) => (
          <span
            key={dep}
            className="text-[11px] font-mono bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-md"
          >
            {dep}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function AgentMessage({ content, isStreaming }: AgentMessageProps) {
  const segments = parseAgentContent(content);

  return (
    <div className="space-y-1">
      {segments.map((seg, i) => {
        if (seg.type === "file") {
          return <FileActionCard key={`file-${i}`} segment={seg} />;
        }
        if (seg.type === "deps") {
          return <DepsActionCard key={`deps-${i}`} segment={seg} />;
        }
        // Text segment — render as markdown
        return (
          <div
            key={`text-${i}`}
            className={cn(
              "prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed",
              "[&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2",
              "[&>pre]:bg-secondary/60 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:text-[12px] [&>pre]:border [&>pre]:border-border/30"
            )}
          >
            <ReactMarkdown>{seg.content}</ReactMarkdown>
          </div>
        );
      })}
      {isStreaming && (
        <span className="inline-block h-3 w-[2px] bg-primary animate-pulse ml-0.5" />
      )}
    </div>
  );
}
