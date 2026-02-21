import { motion } from "framer-motion";
import { Bot, Layers, Zap, Shield, GitBranch, Sparkles } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Agentic Execution",
    description: "AI agents plan, code, and iterate autonomously. Describe your goal and watch the agent break it into tasks and execute.",
  },
  {
    icon: Layers,
    title: "Full-Stack Generation",
    description: "Frontend, backend, database, and auth — generated together in a single coherent architecture.",
  },
  {
    icon: Zap,
    title: "Live Preview",
    description: "See changes instantly in a live preview pane. Every code update renders in real-time as the agent works.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "Row-level security, environment secrets, and auth baked in from the start. No security afterthoughts.",
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Every agent action is a discrete commit. Roll back, branch, or fork at any point in the build history.",
  },
  {
    icon: Sparkles,
    title: "Smart Iteration",
    description: "The agent remembers context across messages. Refine, extend, or pivot — without re-explaining your project.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 border-t border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 text-xs text-muted-foreground mb-6">
            <Zap className="h-3 w-3 text-primary" /> How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Agents that <span className="gradient-text">build for you</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Not just code completion — fully autonomous agents that understand architecture, security, and UX.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-6 rounded-xl border border-border bg-card hover:bg-surface-hover hover:border-primary/20 transition-all duration-300"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
