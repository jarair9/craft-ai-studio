import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_PROVIDERS } from "@/hooks/useAIChat";

interface ModelSelectorProps {
  provider: string;
  model: string;
  onProviderChange: (v: string) => void;
  onModelChange: (v: string) => void;
}

export function ModelSelector({ provider, model, onProviderChange, onModelChange }: ModelSelectorProps) {
  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="flex items-center gap-1.5">
      <Select value={provider} onValueChange={(v) => {
        onProviderChange(v);
        const p = AI_PROVIDERS.find((x) => x.id === v);
        if (p) onModelChange(p.models[0].id);
      }}>
        <SelectTrigger className="h-7 text-[11px] w-auto min-w-[100px] border-border/50 bg-secondary/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDERS.map((p) => (
            <SelectItem key={p.id} value={p.id} className="text-xs">
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={model} onValueChange={onModelChange}>
        <SelectTrigger className="h-7 text-[11px] w-auto min-w-[110px] border-border/50 bg-secondary/50">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currentProvider?.models.map((m) => (
            <SelectItem key={m.id} value={m.id} className="text-xs">
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
