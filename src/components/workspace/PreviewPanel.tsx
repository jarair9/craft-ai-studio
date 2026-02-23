import { Eye, Loader2, HelpCircle, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
interface PreviewPanelProps {
  sandboxUrl: string | null;
  isCreating: boolean;
  onCreateSandbox: () => void;
}

export function PreviewPanel({ sandboxUrl, isCreating, onCreateSandbox }: PreviewPanelProps) {
  if (!sandboxUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[hsl(var(--background))] relative">
        {/* Centered placeholder */}
        <div className="text-center space-y-4">
          {/* Large logo-ish icon */}
          <div className="mx-auto">
            <Zap className="h-16 w-16 text-muted-foreground/15" />
          </div>
          <p className="text-sm text-muted-foreground/40">
            {isCreating ? "Starting sandbox..." : "Your preview will appear here"}
          </p>
          {isCreating && (
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          )}
          {!isCreating && (
            <Button size="sm" variant="outline" onClick={onCreateSandbox} className="mt-2">
              Start Sandbox
            </Button>
          )}
        </div>

        {/* Bottom links like Bolt */}
        <div className="absolute bottom-4 flex items-center gap-5 text-[12px]">
          <a href="#" className="flex items-center gap-1.5 text-primary/70 hover:text-primary transition-colors">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center
          </a>
          <a href="#" className="flex items-center gap-1.5 text-primary/70 hover:text-primary transition-colors">
            <Users className="h-3.5 w-3.5" /> Community
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--background))]">
      <iframe
        src={sandboxUrl}
        className="flex-1 w-full border-0 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Sandbox Preview"
      />
    </div>
  );
}

