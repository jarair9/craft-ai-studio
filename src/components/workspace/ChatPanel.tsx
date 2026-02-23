import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bot, User, Send, Loader2, Plus, Sparkles, Bookmark } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ModelSelector } from "./ModelSelector";
import type { ChatMessage } from "@/hooks/useAIChat";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  provider: string;
  model: string;
  onProviderChange: (v: string) => void;
  onModelChange: (v: string) => void;
  onSend: (msg: string) => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  provider,
  model,
  onProviderChange,
  onModelChange,
  onSend,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-border/20">
      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Sparkles className="h-8 w-8 mx-auto text-primary/30" />
              <p className="text-sm text-muted-foreground/50">How can I help you today?</p>
            </div>
          )}
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "" : ""}`}
            >
              <div
                className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  msg.role === "assistant"
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-secondary border border-border/50"
                }`}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-3 w-3 text-primary" />
                ) : (
                  <User className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [&>pre]:bg-secondary/60 [&>pre]:rounded-lg [&>pre]:p-3 [&>pre]:text-[12px] [&>pre]:border [&>pre]:border-border/30">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-3 w-3 text-primary" />
              </div>
              <div className="flex items-center gap-1 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Version bookmark (like Bolt's "Build complete AI..." card) */}
      {messages.length > 0 && (
        <div className="mx-3 mb-2 rounded-lg bg-secondary/40 border border-border/30 px-3 py-2 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-medium text-foreground/80 flex items-center gap-1.5">
              {messages.filter((m) => m.role === "user").length > 0
                ? messages.filter((m) => m.role === "user")[0].content.slice(0, 40)
                : "Conversation"}
              {messages.filter((m) => m.role === "user")[0]?.content.length > 40 && "..."}
            </p>
            <p className="text-[11px] text-muted-foreground/40">Version 1</p>
          </div>
          <Bookmark className="h-4 w-4 text-muted-foreground/30" />
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-border/20">
        <div className="rounded-xl border border-border/40 bg-card focus-within:border-primary/30 transition-all overflow-hidden">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today? (or /command)"
            className="min-h-[60px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] rounded-none"
            rows={2}
          />
          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/20">
            <div className="flex items-center gap-2">
              <button className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground hover:bg-secondary/50 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
              <ModelSelector
                provider={provider}
                model={model}
                onProviderChange={onProviderChange}
                onModelChange={onModelChange}
              />
            </div>
            <Button
              size="icon"
              className="h-7 w-7 rounded-full"
              disabled={!input.trim() || isStreaming}
              onClick={handleSend}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
