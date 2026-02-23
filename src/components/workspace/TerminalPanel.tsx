import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Zap, ChevronDown } from "lucide-react";
import type { TerminalLine } from "@/hooks/useSandbox";

type TermTab = "agent" | "terminal";

interface TerminalPanelProps {
  lines: TerminalLine[];
  onCommand: (cmd: string) => void;
  isDisabled?: boolean;
}

export function TerminalPanel({ lines, onCommand, isDisabled }: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<TermTab>("terminal");
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const handleSubmit = () => {
    if (!input.trim() || isDisabled) return;
    setHistory((prev) => [input, ...prev]);
    setHistoryIdx(-1);
    onCommand(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const next = historyIdx + 1;
        setHistoryIdx(next);
        setInput(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const next = historyIdx - 1;
        setHistoryIdx(next);
        setInput(history[next]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))] font-mono text-[12px]">
      {/* Tab bar — like Bolt's "Bolt | Publish Output | Terminal" */}
      <div className="flex items-center border-b border-border/30 bg-[hsl(var(--sidebar-background))] px-2">
        <button
          onClick={() => setActiveTab("agent")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors",
            activeTab === "agent"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-3 w-3" /> Agent
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors",
            activeTab === "terminal"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Terminal
        </button>

        {/* Collapse arrow on the right */}
        <div className="ml-auto">
          <ChevronDown className="h-4 w-4 text-muted-foreground/40" />
        </div>
      </div>

      {/* Terminal content */}
      <div
        className="flex-1 min-h-0"
        onClick={() => inputRef.current?.focus()}
      >
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-3 space-y-0.5">
            {activeTab === "agent" ? (
              <p className="text-muted-foreground/40">Agent output will appear here...</p>
            ) : (
              <>
                {lines.length === 0 && !isDisabled && (
                  <p className="text-muted-foreground/40">
                    <span className="text-emerald-400">➜</span> Ready
                  </p>
                )}
                {isDisabled && lines.length === 0 && (
                  <p className="text-muted-foreground/30">Start a sandbox to use the terminal</p>
                )}
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className={cn(
                      "whitespace-pre-wrap break-all leading-5",
                      line.type === "input" && "text-primary/80",
                      line.type === "output" && "text-foreground/70",
                      line.type === "error" && "text-destructive/80"
                    )}
                  >
                    {line.content}
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">➜</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isDisabled}
                    className="flex-1 bg-transparent outline-none text-foreground/90 caret-primary"
                    autoFocus
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
