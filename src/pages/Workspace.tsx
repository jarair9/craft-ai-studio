import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft, Send, Bot, User, Loader2, Code2, Eye, Zap,
  FileCode, Terminal, Sparkles, RotateCcw,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MSG: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hey! I'm your AI agent. Describe what you'd like to build and I'll generate the code, iterate on it, and help you ship. What are we building today?",
  timestamp: new Date(),
};

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    // Simulated agent response — replace with real AI call
    setTimeout(() => {
      const agentMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Got it! I'll work on that. Here's my plan:\n\n1. **Analyze** your request\n2. **Generate** the component structure\n3. **Implement** the code with best practices\n4. **Review** and iterate\n\nLet me start building this for you...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsThinking(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Workspace top bar */}
      <div className="h-12 border-b border-border/50 flex items-center px-4 gap-3 shrink-0 bg-background/80 backdrop-blur-xl">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <span className="font-mono text-sm font-medium truncate max-w-[200px]">
            {project?.name || "Loading..."}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {project?.status === "active" && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Active
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main workspace */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Chat panel */}
        <ResizablePanel defaultSize={38} minSize={28} maxSize={55}>
          <div className="h-full flex flex-col">
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Agent</span>
              {isThinking && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                  <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                </span>
              )}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1">
              <div ref={scrollRef} className="p-4 space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === "assistant"
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-secondary border border-border"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-card border border-border"
                          : "bg-primary/10 border border-primary/20"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {isThinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="relative rounded-xl border border-border bg-card focus-within:border-primary/30 focus-within:glow-border-active transition-all">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe what to build or change..."
                  className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 text-sm"
                  rows={1}
                />
                <Button
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                  disabled={!input.trim() || isThinking}
                  onClick={handleSend}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview / Code panel */}
        <ResizablePanel defaultSize={62} minSize={40}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="border-b border-border/50 px-4">
              <TabsList className="h-10 bg-transparent p-0 gap-1">
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg text-xs gap-1.5 px-3"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg text-xs gap-1.5 px-3"
                >
                  <Code2 className="h-3.5 w-3.5" /> Code
                </TabsTrigger>
                <TabsTrigger
                  value="console"
                  className="data-[state=active]:bg-secondary data-[state=active]:shadow-none rounded-lg text-xs gap-1.5 px-3"
                >
                  <Terminal className="h-3.5 w-3.5" /> Console
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 m-0">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-3">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-secondary/50 border border-border flex items-center justify-center">
                    <Eye className="h-7 w-7 opacity-30" />
                  </div>
                  <p className="text-sm">Live preview will appear here</p>
                  <p className="text-xs text-muted-foreground/60">Describe your app in the chat to start building</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0">
              <div className="h-full bg-muted/30 p-4 font-mono text-xs">
                <div className="flex items-center gap-2 mb-4">
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">src/App.tsx</span>
                </div>
                <pre className="text-muted-foreground/70 leading-relaxed">
{`// Generated code will appear here
// Start by describing your app in the chat

import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="console" className="flex-1 m-0">
              <div className="h-full bg-muted/30 p-4 font-mono text-xs text-muted-foreground/60">
                <p>{'>'} Ready. Waiting for agent actions...</p>
              </div>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Workspace;
