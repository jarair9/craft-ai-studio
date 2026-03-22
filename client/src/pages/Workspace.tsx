import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Code2, 
  Eye, 
  ChevronDown,
  ChevronRight,
  Folder,
  File,
  Settings,
  Save,
  Download,
  History,
  Play,
  Menu,
  X,
  CheckCircle2,
  Circle,
  Copy
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
  expanded?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

const defaultFileStructure: FileItem[] = [
  {
    name: 'server',
    path: 'server',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'index.ts',
        path: 'server/index.ts',
        type: 'file',
        content: `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\n// Mock Data\nconst MOVIES = [\n  { id: 1, title: 'Stranger Things', category: 'Sci-Fi' },\n  { id: 2, title: 'The Crown', category: 'Drama' },\n  { id: 3, title: 'Inception', category: 'Thriller' }\n];\n\n// API Routes\napp.get('/api/movies', (req, res) => {\n  res.json(MOVIES);\n});\n\napp.listen(3001, () => console.log('Netflix Clone API running'));`
      }
    ]
  },
  {
    name: 'src',
    path: 'src',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'App.tsx',
        path: 'src/App.tsx',
        type: 'file',
        content: `import React from 'react';\nimport Navbar from './components/Navbar';\nimport Home from './pages/Home';\n\nexport default function App() {\n  return (\n    <>\n      <Navbar />\n      <Home />\n    </>\n  );\n}`
      },
      {
        name: 'components',
        path: 'src/components',
        type: 'folder',
        children: [
          {
            name: 'MovieCard.tsx',
            path: 'src/components/MovieCard.tsx',
            type: 'file',
            content: `import React from 'react';\n\ninterface Movie {\n  id: number;\n  title: string;\n  category: string;\n}\n\nexport default function MovieCard({ movie }: { movie: Movie }) {\n  return (\n    <div className="movie-card">\n      <h3>{movie.title}</h3>\n      <p>{movie.category}</p>\n    </div>\n  );\n}`
          }
        ]
      },
      {
        name: 'index.css',
        path: 'src/index.css',
        type: 'file',
        content: `* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: 'Inter', sans-serif;\n  background-color: #0f0f0f;\n  color: #ffffff;\n}\n\n.movie-card {\n  background: #1a1a1a;\n  padding: 1rem;\n  border-radius: 8px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}`
      }
    ]
  }
];

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Define the Data Model (Movies, Categories, User Lists)',
    description: 'Create database schema',
    completed: false
  },
  {
    id: '2',
    title: 'Setup Backend: Express server with SQLite',
    description: 'Backend setup',
    completed: false
  },
  {
    id: '3',
    title: 'Setup Frontend Architecture: Navbar, Animations',
    description: 'Frontend setup',
    completed: false
  },
  {
    id: '4',
    title: 'Implement UI: Netflix-style design',
    description: 'UI implementation',
    completed: false
  }
];

export default function Workspace() {
  const [files, setFiles] = useState<FileItem[]>(defaultFileStructure);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeFile, setActiveFile] = useState<FileItem | null>(defaultFileStructure[1]?.children?.[0] || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanel, setRightPanel] = useState<'code' | 'preview'>('code');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFolder = (path: string) => {
    const updateFiles = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.path === path && item.type === 'folder') {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return { ...item, children: updateFiles(item.children) };
        }
        return item;
      });
    };
    setFiles(updateFiles(files));
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file') {
      setActiveFile(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I'll help you build this Netflix clone. Analyzing your requirements and generating the code structure. The architecture includes:\n\n1. Backend: Express.js with SQLite database\n2. Frontend: React with Framer Motion animations\n3. UI: Netflix-style dark theme with scroll effects\n\nGenerated code is ready in the editor.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map(item => (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-muted rounded transition-colors ${
            activeFile?.path === item.path ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder(item.path);
            } else {
              handleFileClick(item);
            }
          }}
        >
          {item.type === 'folder' ? (
            <>
              {item.expanded ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
              <Folder className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </>
          ) : (
            <>
              <File className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-sm">{item.name}</span>
            </>
          )}
        </div>
        {item.type === 'folder' && item.expanded && item.children && (
          renderFileTree(item.children, level + 1)
        )}
      </div>
    ));
  };

  const copyCode = () => {
    if (activeFile?.content) {
      navigator.clipboard.writeText(activeFile.content);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="border-b border-border bg-background/95 backdrop-blur h-12 flex items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="gap-2"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>

        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Auto-Route</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <span>Gemini 3 Flash</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Save className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant={rightPanel === 'code' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRightPanel('code')}
            className="gap-2"
          >
            <Code2 className="w-4 h-4" />
            Code
          </Button>
          <Button
            variant={rightPanel === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setRightPanel('preview')}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tasks & Plan */}
        {sidebarOpen && (
          <div className="w-80 border-r border-border bg-muted/30 flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <span>📋 Plan</span>
                <span className="text-xs text-muted-foreground ml-auto">0/4</span>
              </h2>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="space-y-2">
                    <div
                      className="flex items-start gap-3 cursor-pointer group"
                      onClick={() => toggleTask(task.id)}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="border-t border-border p-4 bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Describe what you want to build..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="sm"
                  className="gap-2"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Middle - File Explorer & Chat */}
        <div className="w-64 border-r border-border bg-background flex flex-col">
          {/* File Explorer Header */}
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">FILES</span>
              <span className="text-xs text-muted-foreground">4</span>
            </div>
            <span className="text-xs text-muted-foreground truncate">{activeFile?.name}</span>
          </div>

          {/* File Tree */}
          <ScrollArea className="flex-1">
            <div className="p-2">{renderFileTree(files)}</div>
          </ScrollArea>

          {/* Chat Messages */}
          <div className="border-t border-border p-3 flex-1 min-h-0 flex flex-col">
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`text-xs p-2 rounded ${
                      msg.role === 'user'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="line-clamp-3">{msg.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right - Code Editor or Preview */}
        <div className="flex-1 flex flex-col bg-background">
          {rightPanel === 'code' ? (
            <>
              {activeFile && (
                <div className="border-b border-border p-2 bg-muted/30 flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">{activeFile.path}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={copyCode} className="gap-1">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
              <ScrollArea className="flex-1">
                <pre className="p-4 font-mono text-sm text-muted-foreground overflow-auto bg-background whitespace-pre-wrap break-words">
                  <code>{activeFile?.content || '// Select a file'}</code>
                </pre>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border p-3 bg-muted/30">
                <p className="text-sm font-semibold">Live Preview</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-8">
                  <Card className="p-6 border-2 border-dashed border-border">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Netflix Clone Preview</h3>
                      <p className="text-sm text-muted-foreground">
                        Building a high-fidelity Netflix clone requires a robust architecture: a sleek, high-performance React frontend with Framer Motion for that signature "hover-scale" effect, and an Express backend to handle user profiles and movie metadata.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Architecture Overview:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Backend: Metadata API with SQLite</li>
                          <li>Frontend: React with Framer Motion animations</li>
                          <li>UI: Netflix-style dark theme</li>
                          <li>Features: Scroll listener, fade-out hero</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
