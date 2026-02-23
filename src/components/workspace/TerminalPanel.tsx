import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { TerminalLine } from "@/hooks/useSandbox";

interface TerminalPanelProps {
  lines: TerminalLine[];
  onCommand: (cmd: string) => void;
  isDisabled?: boolean;
}

export function TerminalPanel({ lines, onCommand, isDisabled }: TerminalPanelProps) {
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
    <div
      className="h-full flex flex-col bg-[hsl(var(--background))] font-mono text-[12px]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal header */}
      <div className="h-8 px-3 border-b border-border/30 bg-[hsl(var(--sidebar-background))] flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-[10px] text-muted-foreground/50 ml-2">Terminal</span>
      </div>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-0.5">
          {lines.length === 0 && !isDisabled && (
            <p className="text-muted-foreground/40">Ready</p>
          )}
          {isDisabled && lines.length === 0 && (
            <p className="text-muted-foreground/30">Start a sandbox to use the terminal</p>
          )}
          {lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                "whitespace-pre-wrap break-all leading-5",
                line.type === "input" && "text-primary/90",
                line.type === "output" && "text-foreground/70",
                line.type === "error" && "text-destructive/80"
              )}
            >
              {line.content}
            </div>
          ))}
          {/* Prompt */}
          <div className="flex items-center gap-1.5 text-primary/80">
            <span className="text-emerald-400/70">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              className="flex-1 bg-transparent outline-none text-foreground/90 caret-primary placeholder:text-muted-foreground/25"
              placeholder={isDisabled ? "" : ""}
              autoFocus
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
