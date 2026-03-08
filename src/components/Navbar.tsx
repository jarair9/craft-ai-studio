import { motion } from "framer-motion";
import { Zap, Github, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter">
            <span className="text-foreground">AURA</span>
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
          {user ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {(user.user_metadata?.full_name || user.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-medium"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
