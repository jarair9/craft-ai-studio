import { motion } from "framer-motion";
import { Zap, Github, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="gradient-text">Forge</span>
            <span className="text-muted-foreground font-mono text-sm ml-1">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Docs</a>
          <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Templates</a>
          <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Pricing</a>
          <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Changelog</a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer">
            <Github className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground cursor-pointer">
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-medium">
            Sign In
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
