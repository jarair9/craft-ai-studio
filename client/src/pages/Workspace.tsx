import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Code2, 
  Eye, 
  FileText, 
  Settings, 
  Plus, 
  Trash2,
  ChevronRight,
  Zap,
  Shield,
  Layers,
  Play,
  Copy,
  Download
} from 'lucide-react';
import useAgentOrchestration from '@/hooks/useAgentOrchestration';

interface Message {
  id: string;
  role: 'user' | 'agent';
  agent?: string;
  content: string;
  timestamp: Date;
  code?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  files: { name: string; content: string }[];
}

export default function Workspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'My First Project',
      description: 'A React dashboard application',
      files: [
        { name: 'App.tsx', content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}' },
        { name: 'package.json', content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}' }
      ]
    }
  ]);
  const [activeProject, setActiveProject] = useState(projects[0]);
  const [activeFile, setActiveFile] = useState(projects[0].files[0]);
  const [generatedCode, setGeneratedCode] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { executeTask, suggestAgents } = useAgentOrchestration();

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
      const selectedAgentNames = agents
        .filter(a => selectedAgents.includes(a.id))
        .map(a => a.name);

      const agentName = selectedAgentNames[0] || 'Full-Stack Architect';
      
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
        agent: agentName,
        content: generatedResponse,
        code: codeResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
      setGeneratedCode(codeResponse);
      setIsLoading(false);
    }, 1500);
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
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
              <h1 className="font-semibold">{activeProject.name}</h1>
              <p className="text-xs text-muted-foreground">{activeProject.description}</p>
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
        {/* Left Sidebar - Projects & Files */}
        <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">Projects</h3>
            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => {
                    setActiveProject(project);
                    setActiveFile(project.files[0]);
                  }}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    activeProject.id === project.id
                      ? 'bg-primary/10 border border-primary/50'
                      : 'hover:bg-muted'
                  }`}
                >
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.files.length} files</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-auto">
            <h3 className="font-semibold text-sm mb-3">Files</h3>
            <div className="space-y-1">
              {activeProject.files.map(file => (
                <div
                  key={file.name}
                  onClick={() => setActiveFile(file)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors text-sm flex items-center gap-2 ${
                    activeFile.name === file.name
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Chat & Code Editor */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4 h-12">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="editor">Code Editor</TabsTrigger>
              <TabsTrigger value="agents">Agents</TabsTrigger>
            </TabsList>

            {/* Chat Tab */}
            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center">
                      <div>
                        <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">Start by asking the AI agents to build something</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground border border-border'
                          }`}
                        >
                          {msg.role === 'agent' && (
                            <p className="text-xs font-semibold mb-2 opacity-75">{msg.agent}</p>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          {msg.code && (
                            <div className="mt-2 p-2 bg-background rounded text-xs font-mono overflow-x-auto max-h-32">
                              <code>{msg.code.substring(0, 200)}...</code>
                            </div>
                          )}
                          <p className="text-xs opacity-50 mt-2">{msg.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="border-t border-border p-4 bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Ask me to build something..."
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
            </TabsContent>

            {/* Code Editor Tab */}
            <TabsContent value="editor" className="flex-1 flex flex-col m-0">
              <div className="flex-1 flex flex-col">
                <div className="border-b border-border p-3 flex items-center justify-between bg-muted/30">
                  <p className="font-mono text-sm">{activeFile.name}</p>
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
                  <pre className="p-4 font-mono text-sm text-muted-foreground overflow-auto">
                    <code>{activeFile.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>

            {/* Agents Tab */}
            <TabsContent value="agents" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">Select agents to assist with your task</p>
                  {agents.map(agent => {
                    const Icon = agent.icon;
                    const isSelected = selectedAgents.includes(agent.id);
                    return (
                      <Card
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary/50 bg-primary/5'
                            : 'hover:border-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center text-white`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">Click to select</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Preview */}
        <div className="w-80 border-l border-border bg-muted/30 flex flex-col">
          <div className="border-b border-border p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {generatedCode ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Generated Code</p>
                    <pre className="text-xs font-mono overflow-auto max-h-40 text-muted-foreground">
                      <code>{generatedCode.substring(0, 300)}...</code>
                    </pre>
                  </div>
                  <Button className="w-full gap-2" size="sm">
                    <Play className="w-4 h-4" />
                    Run Code
                  </Button>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <Code2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground">Generated code preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
