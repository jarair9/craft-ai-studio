import { useState } from "react";
import { ArrowRight, Command } from "lucide-react";

const PromptInput = () => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

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
          placeholder="Describe the app you want to build..."
          className="flex-1 bg-transparent px-5 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
        />
        <div className="flex items-center gap-2 pr-3">
          <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-muted-foreground text-xs border border-border">
            <Command className="h-3 w-3" />
            Enter
          </kbd>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptInput;
