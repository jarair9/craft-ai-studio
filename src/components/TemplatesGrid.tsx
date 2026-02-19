import { motion } from "framer-motion";
import { Layout, BarChart3, ShoppingBag, FileText, Cpu, Globe } from "lucide-react";

const templates = [
  { name: "SaaS Dashboard", description: "Analytics & user management", icon: BarChart3 },
  { name: "Landing Page", description: "Hero, pricing & CTA sections", icon: Layout },
  { name: "Marketplace", description: "Product listings & checkout", icon: ShoppingBag },
  { name: "Blog Platform", description: "Posts, comments & categories", icon: FileText },
  { name: "AI Tool", description: "Chat interface & model routing", icon: Cpu },
  { name: "Portfolio", description: "Projects, about & contact", icon: Globe },
];

const TemplatesGrid = () => {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Start from a template</h2>
          <p className="text-muted-foreground">Or describe your own idea above</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {templates.map((template, i) => (
            <motion.button
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-surface-hover hover:border-primary/20 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary border border-border group-hover:border-primary/20 group-hover:bg-primary/10 transition-colors">
                <template.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <div className="font-medium text-sm text-foreground">{template.name}</div>
                <div className="text-xs text-muted-foreground">{template.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TemplatesGrid;
