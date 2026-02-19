import { motion } from "framer-motion";
import { Clock, GitBranch, ExternalLink } from "lucide-react";

const projects = [
  { name: "acme-dashboard", time: "2 hours ago", fragments: 12 },
  { name: "portfolio-v3", time: "Yesterday", fragments: 8 },
  { name: "ai-chat-app", time: "3 days ago", fragments: 24 },
  { name: "e-commerce-store", time: "1 week ago", fragments: 16 },
];

const RecentProjects = () => {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Recent projects</h2>
          <p className="text-muted-foreground">Pick up where you left off</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {projects.map((project, i) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              className="group p-5 rounded-xl border border-border bg-card hover:bg-surface-hover hover:border-primary/20 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono text-sm font-medium text-foreground">{project.name}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {project.time}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {project.fragments} fragments
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
