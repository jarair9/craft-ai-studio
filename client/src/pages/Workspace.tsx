import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Code2, 
  Eye, 
  Settings, 
  Plus,
  Zap,
  Shield,
  Layers,
  Copy,
  Download
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'agent';
  agent?: string;
  content: string;
  timestamp: Date;
  code?: string;
}

export default function Workspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanel, setRightPanel] = useState<'code' | 'preview'>('code');
  const [generatedCode, setGeneratedCode] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: 'full-stack', name: 'Full-Stack Architect', icon: Layers, color: 'bg-blue-500' },
    { id: 'backend', name: 'Backend Specialist', icon: Code2, color: 'bg-purple-500' },
    { id: 'frontend', name: 'Frontend Specialist', icon: Eye, color: 'bg-pink-500' },
    { id: 'security', name: 'Security Auditor', icon: Shield, color: 'bg-red-500' },
    { id: 'performance', name: 'Performance Optimizer', icon: Zap, color: 'bg-yellow-500' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate agent response
    setTimeout(() => {
      const generatedResponse = `I'll help you with: "${input}"

Based on your request, I'm analyzing the requirements and proposing a solution:

1. **Architecture Analysis**: Your request requires a modular, scalable approach
2. **Technology Stack**: React 19 + TypeScript + Tailwind CSS
3. **Implementation Plan**: 
   - Create component structure
   - Set up state management
   - Implement styling
   - Add error handling
4. **Quality Assurance**: 
   - Type safety checks
   - Performance optimization
   - Accessibility compliance

Generated code preview is ready for your review.`;

      const codeResponse = `import React, { useState } from 'react';

export default function Component() {
  const [state, setState] = useState(null);

  const handleAction = async () => {
    try {
      // Implementation logic
      setState('success');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-6 rounded-lg border border-border">
      <h2 className="text-lg font-semibold mb-4">Component</h2>
      <button 
        onClick={handleAction}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
      >
        Execute
      </button>
    </div>
  );
}`;

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        agent: 'Full-Stack Architect',
        content: generatedResponse,
        code: codeResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setGeneratedCode(codeResponse);
      setIsLoading(false);
    }, 1500);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedCode));
    element.setAttribute('download', 'generated-code.tsx');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Craft AI Studio Workspace</h1>
              <p className="text-xs text-muted-foreground">Build with AI agents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat */}
        <div className="w-96 border-r border-border bg-background flex flex-col">
          {/* Chat Messages */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground">Start by asking the AI agents to build something</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground border border-border'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <p className="text-xs font-semibold mb-2 opacity-75">{msg.agent}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-50 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Agent Selector */}
          <div className="border-t border-border p-3 bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Select Agent</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {agents.map(agent => {
                const Icon = agent.icon;
                return (
                  <Button
                    key={agent.id}
                    variant="outline"
                    size="sm"
                    className="gap-1 flex-shrink-0"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="text-xs">{agent.name.split(' ')[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Chat Input */}
          <div className="border-t border-border p-4 bg-background">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Ask me to build..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Side - Code/Preview Toggle */}
        <div className="flex-1 flex flex-col">
          {/* Toggle Buttons */}
          <div className="border-b border-border p-3 flex gap-2 bg-muted/30">
            <Button
              variant={rightPanel === 'code' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRightPanel('code')}
              className="gap-2"
            >
              <Code2 className="w-4 h-4" />
              Code
            </Button>
            <Button
              variant={rightPanel === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRightPanel('preview')}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
          </div>

          {/* Code Panel */}
          {rightPanel === 'code' && (
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
                <p className="font-mono text-sm text-muted-foreground">generated-code.tsx</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadCode}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                {generatedCode ? (
                  <pre className="p-4 font-mono text-sm text-muted-foreground overflow-auto">
                    <code>{generatedCode}</code>
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <div>
                      <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-sm text-muted-foreground">Generated code will appear here</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Preview Panel */}
          {rightPanel === 'preview' && (
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border p-3 bg-muted/30">
                <p className="font-mono text-sm text-muted-foreground">Live Preview</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-8">
                  {generatedCode ? (
                    <Card className="p-6 border-2 border-dashed border-border">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Component Preview</h3>
                        <p className="text-sm text-muted-foreground">
                          This is a preview of the generated component. The actual component would render here.
                        </p>
                        <div className="p-4 rounded-lg bg-muted/50 border border-border">
                          <p className="text-sm font-mono text-muted-foreground">
                            &lt;Component /&gt;
                          </p>
                        </div>
                        <div className="pt-4 border-t border-border">
                          <h4 className="text-sm font-semibold mb-2">Generated Code:</h4>
                          <pre className="p-3 bg-background rounded text-xs font-mono overflow-auto max-h-48 border border-border">
                            <code>{generatedCode.substring(0, 400)}...</code>
                          </pre>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-sm text-muted-foreground">Preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
