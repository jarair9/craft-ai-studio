import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, Shield, Layers, Code2, Rocket, Users } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setPrompt('');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Craft AI Studio</span>
          </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#agents" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Agents
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
            </div>
            <a href="/workspace">
              <Button variant="default" size="sm">
                Get Started
              </Button>
            </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-hero opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Full-Stack Development</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Build Something
              <span className="block gradient-text mt-2">Extraordinary</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Craft AI Studio empowers you with intelligent agents that think like senior developers. Build, optimize, and deploy full-stack applications with unprecedented speed and quality.
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/workspace">
                <Button size="lg" className="gap-2">
                  Start Building <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Button size="lg" variant="outline">
                View Documentation
              </Button>
            </div>

            {/* Prompt Input */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="relative">
                <div className="absolute inset-0 gradient-hero rounded-2xl opacity-20 blur-xl" />
                <div className="relative bg-white rounded-2xl p-1 border border-border shadow-lg">
                  <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl">
                    <Input
                      placeholder="Ask me to build a landing page for my..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="flex-1 border-0 bg-transparent placeholder:text-muted-foreground focus:outline-none"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading || !prompt.trim()}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build professional applications with AI-powered assistance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Layers,
                title: 'Multi-Agent System',
                description: 'Specialized AI agents for frontend, backend, DevOps, security, and more working in harmony'
              },
              {
                icon: Shield,
                title: 'Senior Developer Thinking',
                description: 'Agents analyze code with architectural awareness, security mindset, and performance optimization'
              },
              {
                icon: Zap,
                title: 'Powerful Tools',
                description: 'Code analysis, security audits, performance profiling, test generation, and documentation'
              },
              {
                icon: Code2,
                title: 'Full-Stack Capabilities',
                description: 'Build complete applications from database design to UI implementation with quality gates'
              },
              {
                icon: Rocket,
                title: 'Production Ready',
                description: 'Automated testing, security scanning, accessibility checks, and deployment optimization'
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description: 'Agents coordinate seamlessly, providing transparent decision-making and explanations'
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-6 rounded-lg border border-border hover:border-primary/50 transition-colors bg-card hover:shadow-lg">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents" className="py-20 md:py-28 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Your AI Agents</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A team of specialized agents, each bringing expertise in their domain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Full-Stack Architect', role: 'System Design' },
              { name: 'Senior Code Reviewer', role: 'Quality Assurance' },
              { name: 'Backend Specialist', role: 'Server Logic' },
              { name: 'Frontend Specialist', role: 'UI/UX' },
              { name: 'Security Auditor', role: 'Security' },
              { name: 'Database Architect', role: 'Data Design' },
              { name: 'DevOps Engineer', role: 'Deployment' },
              { name: 'Performance Optimizer', role: 'Optimization' }
            ].map((agent, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg gradient-hero mb-3" />
                <h4 className="font-semibold text-sm mb-1">{agent.name}</h4>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start building your next project with Craft AI Studio today. Experience the future of full-stack development.
            </p>
            <a href="/workspace">
              <Button size="lg" className="gap-2">
                Get Started Now <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2026 Craft AI Studio. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
