# Craft AI Studio

**AI-Powered Full-Stack Development Platform**

Build extraordinary applications with intelligent agents that think like senior developers. Craft AI Studio combines multi-agent orchestration, powerful development tools, and a professional UI to revolutionize how you build software.

## 🎯 Overview

Craft AI Studio is a next-generation development platform that leverages multiple specialized AI agents working in concert to deliver production-ready full-stack applications. Unlike traditional AI coding assistants, this system features agents that understand architecture, security, performance, and best practices at a senior developer level.

## ✨ Key Features

### Multi-Agent Architecture
- **20+ Specialized Agents**: Frontend, backend, database, DevOps, security, QA, and more
- **Automatic Agent Selection**: The system intelligently chooses the right agents for your task
- **Transparent Coordination**: See which agents are working on your project and their recommendations
- **Senior Developer Thinking**: Agents analyze code with architectural awareness and strategic insights

### Powerful Development Tools
- **Code Analysis**: Complexity assessment, maintainability scoring, pattern recognition
- **Security Auditing**: Vulnerability scanning, compliance checking, security best practices
- **Performance Profiling**: Bundle analysis, load time optimization, memory usage tracking
- **Test Generation**: Automatic unit, integration, and E2E test creation
- **Documentation Generation**: API docs, architecture guides, setup instructions
- **Refactoring Proposals**: Safe refactoring with risk assessment and benefits analysis
- **Accessibility Auditing**: WCAG compliance checking, accessibility improvements
- **Type Safety Analysis**: TypeScript coverage and type safety verification

### Quality Gates
All agent outputs pass through comprehensive quality gates:
- Code quality and style compliance
- Security vulnerability scanning
- Performance impact analysis
- Test coverage requirements (minimum 80%)
- Documentation completeness
- WCAG 2.1 AA accessibility compliance
- Senior developer code review

### Professional UI
- **Lovable-Inspired Design**: Modern gradient aesthetic with smooth interactions
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop
- **Dark Mode Support**: Comfortable viewing in any lighting condition
- **Accessibility First**: WCAG 2.1 AA compliant with keyboard navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jarair9/craft-ai-studio.git
cd craft-ai-studio

# Install dependencies
npm install
# or
pnpm install
# or
bun install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
craft-ai-studio/
├── .agent/                    # AI agent configurations and skills
│   ├── agents/               # Agent definitions (20+ specialists)
│   ├── skills/               # Domain-specific knowledge modules
│   ├── workflows/            # Slash command procedures
│   └── scripts/              # Validation and verification tools
├── client/
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   │   ├── agent-tools.ts      # Agent tool definitions
│   │   │   └── agent-orchestrator.ts # Multi-agent coordination
│   │   ├── App.tsx          # Main application component
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles and design tokens
│   ├── index.html           # HTML template
│   └── public/              # Static assets
├── AI_AGENT_ARCHITECTURE.md # Detailed agent system documentation
├── DESIGN_SYSTEM.md         # UI/UX design guidelines
└── package.json             # Project dependencies
```

## 🤖 Agent System

### Available Agents

The system includes 20+ specialized agents:

**Core Agents**
- **Full-Stack Architect**: System design and architecture patterns
- **Senior Code Reviewer**: Code quality and best practices enforcement
- **Backend Specialist**: Server-side logic and APIs
- **Frontend Specialist**: UI/UX implementation
- **Database Architect**: Schema design and optimization
- **DevOps Engineer**: Deployment and infrastructure
- **Security Auditor**: Security analysis and vulnerability assessment
- **Performance Optimizer**: Profiling and optimization

**Specialized Agents**
- Code Archaeologist: Codebase analysis
- Debugger: Systematic debugging
- Test Engineer: Test strategy and automation
- Documentation Writer: Technical documentation
- QA Automation Engineer: Test automation
- Product Manager: Requirements and planning
- And more...

### Using Agents

Agents are automatically selected based on your task. Simply describe what you need:

```
"Build a REST API with JWT authentication"
→ Backend Specialist + Security Auditor + Database Architect

"Fix the dark mode button"
→ Frontend Specialist + Senior Code Reviewer

"Optimize database queries"
→ Database Architect + Performance Optimizer
```

## 🛠️ Development Tools

### Code Analysis
```typescript
import { analyzeCode } from '@/lib/agent-tools';

const result = await analyzeCode(codeString);
// Returns: complexity, maintainability, security issues, performance suggestions
```

### Security Auditing
```typescript
import { auditSecurity } from '@/lib/agent-tools';

const audit = await auditSecurity(codebase);
// Returns: vulnerabilities, compliance score, recommendations
```

### Performance Profiling
```typescript
import { profilePerformance } from '@/lib/agent-tools';

const profile = await profilePerformance(appPath);
// Returns: metrics, bottlenecks, optimization suggestions
```

### Test Generation
```typescript
import { generateTests } from '@/lib/agent-tools';

const tests = await generateTests(code, 'unit');
// Returns: generated test code with coverage analysis
```

## 🎨 Design System

The UI follows a **Modern Gradient Minimalism** aesthetic with:

- **Primary Gradient**: Blue (#0066FF) → Pink (#FF1493) → Orange (#FF6B35)
- **Typography**: Sora (display) + Inter (body)
- **Spacing**: 4px grid system
- **Radius**: 8-16px rounded corners
- **Shadows**: Subtle to large depth levels
- **Animations**: Smooth 200-300ms transitions

See `DESIGN_SYSTEM.md` for complete design specifications.

## 📊 Architecture

### Multi-Agent Orchestration

```
User Request
    ↓
Domain Analysis
    ↓
Agent Selection
    ↓
Parallel Execution
    ├─ Agent 1 (Analysis)
    ├─ Agent 2 (Design)
    └─ Agent 3 (Implementation)
    ↓
Result Synthesis
    ↓
Quality Gates
    ├─ Security Check
    ├─ Performance Check
    ├─ Test Coverage
    └─ Code Review
    ↓
Delivery to User
```

### Quality Gates

Every agent output passes through:
1. **Code Quality Gate**: ESLint, TypeScript, formatting
2. **Security Gate**: OWASP scanning, dependency audit
3. **Performance Gate**: Lighthouse, bundle analysis
4. **Test Coverage Gate**: Minimum 80% coverage
5. **Documentation Gate**: All APIs documented
6. **Accessibility Gate**: WCAG 2.1 AA compliance
7. **Review Gate**: Senior dev approval

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# API Configuration
VITE_APP_TITLE=Craft AI Studio
VITE_APP_ID=craft-ai-studio
VITE_FRONTEND_FORGE_API_URL=https://api.example.com
VITE_FRONTEND_FORGE_API_KEY=your-api-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## 📚 Documentation

- **[AI Agent Architecture](./AI_AGENT_ARCHITECTURE.md)**: Detailed agent system documentation
- **[Design System](./DESIGN_SYSTEM.md)**: UI/UX guidelines and specifications
- **[Agent Workflows](./.agent/ARCHITECTURE.md)**: Agent coordination patterns
- **[API Documentation](./API.md)**: API endpoints and usage

## 🧪 Testing

```bash
# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## 🏗️ Building

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📦 Dependencies

### Core
- **React 19**: Modern UI library
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: Component library

### Agent System
- **ag-kit**: Multi-agent framework
- **Zod**: Schema validation
- **Framer Motion**: Animations

### Development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Testing framework
- **Playwright**: E2E testing

## 🔒 Security

- All agent operations are logged and auditable
- No direct access to production systems
- All changes require review and approval
- Comprehensive security scanning
- OWASP compliance checking
- Dependency vulnerability scanning

## 🚀 Deployment

### Manus Platform
The project is optimized for deployment on Manus:

```bash
# Create checkpoint
npm run checkpoint

# Publish to Manus
# Use the Manus UI to publish
```

### Custom Deployment
For other platforms, build and deploy the `dist/` directory:

```bash
npm run build
# Deploy dist/ directory to your hosting
```

## 📈 Performance

- **Bundle Size**: ~150KB (gzipped)
- **Load Time**: <2.5s on 4G
- **Lighthouse Score**: 90+
- **Core Web Vitals**: All green

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation
- Review agent logs for debugging

## 🎓 Learning Resources

- **[Getting Started Guide](./docs/getting-started.md)**
- **[Agent Development Guide](./docs/agent-development.md)**
- **[Tool Integration Guide](./docs/tool-integration.md)**
- **[Best Practices](./docs/best-practices.md)**

## 🔮 Roadmap

- [ ] Advanced reasoning with chain-of-thought prompting
- [ ] Self-healing capabilities for automatic bug fixing
- [ ] Predictive analysis for issue prevention
- [ ] Knowledge graph for component relationships
- [ ] Custom agent training on project patterns
- [ ] Multi-language support (Go, Rust, Python, etc.)
- [ ] Real-time collaboration features
- [ ] Advanced analytics and insights

## 📞 Contact

- **Website**: https://craft-ai-studio.dev
- **Email**: hello@craft-ai-studio.dev
- **Twitter**: @craftaistudio
- **Discord**: [Join Community](https://discord.gg/craftaistudio)

---

**Built with ❤️ by the Craft AI Studio team**

*Empowering developers with intelligent agents that think like senior developers.*
