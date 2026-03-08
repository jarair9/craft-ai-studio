import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 border border-primary/20">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-semibold">
              <span className="gradient-text">Forge</span>
              <span className="text-muted-foreground font-mono text-xs ml-1">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">Status</a>
            <a href="#" className="hover:text-foreground transition-colors cursor-pointer">GitHub</a>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 AURA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
