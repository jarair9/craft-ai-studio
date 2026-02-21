import { useState } from "react";
import { ArrowRight, Command } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PromptInput = () => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!value.trim() || isLoading) return;

    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name: value.trim().slice(0, 60), description: value.trim(), user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      navigate(`/workspace/${data.id}`);
    } catch {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div
      className={`relative rounded-xl border transition-all duration-300 ${
        isFocused ? "glow-border-active border-primary/30" : "glow-border border-border"
      }`}
    >
      <div className="flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the app you want to build..."
          className="flex-1 bg-transparent px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2 pr-3">
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs border border-border">
            <Command className="h-3 w-3" />
            Enter
          </kbd>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
