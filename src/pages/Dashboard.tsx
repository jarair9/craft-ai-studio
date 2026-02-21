import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, GitBranch, Trash2, Loader2, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: newProjectName, description: newProjectDesc, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewProjectName("");
      setNewProjectDesc("");
      setDialogOpen(false);
      navigate(`/workspace/${data.id}`);
    },
    onError: () => toast({ title: "Failed to create project", variant: "destructive" }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast({ title: "Project deleted" });
    },
  });

  const filtered = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight">
              <span className="gradient-text">Forge</span>
              <span className="text-muted-foreground font-mono text-xs ml-1">AI</span>
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground text-xs">
            Sign out
          </Button>
        </div>
      </nav>

      <div className="container py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">Build, iterate, and ship with AI</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                />
                <Button
                  className="w-full"
                  disabled={!newProjectName.trim() || createProject.isPending}
                  onClick={() => createProject.mutate()}
                >
                  {createProject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create & Open"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !filtered?.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-muted-foreground"
          >
            <Zap className="h-10 w-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm">No projects yet. Create one to get started.</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ x: 2 }}
                  onClick={() => navigate(`/workspace/${project.id}`)}
                  className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-surface-hover hover:border-primary/20 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm font-medium text-foreground truncate">
                      {project.name}
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(project.updated_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" />
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject.mutate(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
