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
      className="h-full flex flex-col bg-muted/20 font-mono text-xs"
      onClick={() => inputRef.current?.focus()}
    >
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-3 space-y-0.5">
          {lines.length === 0 && (
            <p className="text-muted-foreground/50">Terminal ready. Type a command...</p>
          )}
          {lines.map((line) => (
            <div
              key={line.id}
              className={cn(
                "whitespace-pre-wrap break-all",
                line.type === "input" && "text-primary",
                line.type === "output" && "text-foreground/80",
                line.type === "error" && "text-destructive"
              )}
            >
              {line.content}
            </div>
          ))}
          {/* Input line */}
          <div className="flex items-center gap-1 text-primary">
            <span>$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              className="flex-1 bg-transparent outline-none text-foreground caret-primary"
              placeholder={isDisabled ? "Create a sandbox first..." : ""}
              autoFocus
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
