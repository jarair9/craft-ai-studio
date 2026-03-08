import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ApiKeySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdate: (keys: Record<string, string>) => void;
}

const PROVIDERS = [
  { id: "openai", name: "OpenAI", placeholder: "sk-..." },
  { id: "anthropic", name: "Anthropic", placeholder: "sk-ant-..." },
  { id: "gemini", name: "Google Gemini", placeholder: "AIza..." },
  { id: "groq", name: "Groq", placeholder: "gsk_..." },
  { id: "cerebras", name: "Cerebras", placeholder: "csk_..." },
  { id: "tavily", name: "Tavily Search", placeholder: "tvly-..." },
];

export function ApiKeySettings({ isOpen, onClose, onKeysUpdate }: ApiKeySettingsProps) {
  const { user } = useAuth();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;
    supabase
      .from("user_api_keys")
      .select("provider, api_key")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const loaded: Record<string, string> = {};
        data?.forEach((row: any) => {
          loaded[row.provider] = row.api_key;
        });
        setKeys(loaded);
        onKeysUpdate(loaded);
      });
  }, [user, isOpen]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      for (const p of PROVIDERS) {
        const val = keys[p.id]?.trim();
        if (!val) continue;
        await supabase.from("user_api_keys").upsert(
          { user_id: user.id, provider: p.id, api_key: val },
          { onConflict: "user_id,provider" }
        );
      }
      onKeysUpdate(keys);
      toast.success("API keys saved");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Provider Keys</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Cerebras (built-in) is now the primary AI engine for Craft AI Studio.
        </p>

        <div className="space-y-3">
          {PROVIDERS.map((p) => (
            <div key={p.id} className="space-y-1">
              <Label className="text-xs">{p.name}</Label>
              <div className="relative">
                <Input
                  type={visible[p.id] ? "text" : "password"}
                  value={keys[p.id] || ""}
                  onChange={(e) => setKeys((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  placeholder={p.placeholder}
                  className="pr-8 text-xs font-mono h-8"
                />
                <button
                  type="button"
                  onClick={() => setVisible((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {visible[p.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

