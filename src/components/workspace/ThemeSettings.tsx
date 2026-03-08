import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Share2, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";

export interface DesignTokens {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
    spacingUnit: string;
}

const DEFAULT_TOKENS: DesignTokens = {
    primaryColor: "#3b82f6",
    secondaryColor: "#1e293b",
    accentColor: "#f59e0b",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
    spacingUnit: "1rem",
};

interface ThemeSettingsProps {
    onUpdate: (tokens: DesignTokens) => void;
    initialTokens?: DesignTokens;
}

export function ThemeSettings({ onUpdate, initialTokens }: ThemeSettingsProps) {
    const [tokens, setTokens] = useState<DesignTokens>(initialTokens || DEFAULT_TOKENS);

    const handleSave = () => {
        onUpdate(tokens);
        toast.success("Design rules updated! AI will now follow these colors & styles.");
    };

    const handleReset = () => {
        setTokens(DEFAULT_TOKENS);
        onUpdate(DEFAULT_TOKENS);
    };

    return (
        <div className="space-y-6 p-4 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold tracking-tight">Design System Rules</h2>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={handleReset} title="Reset to default">
                        <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Save Rules
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Primary Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={tokens.primaryColor}
                            onChange={(e) => setTokens(p => ({ ...p, primaryColor: e.target.value }))}
                            className="w-10 h-9 p-1 bg-transparent border-none"
                        />
                        <Input
                            value={tokens.primaryColor}
                            onChange={(e) => setTokens(p => ({ ...p, primaryColor: e.target.value }))}
                            className="flex-1 text-xs font-mono h-9"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Secondary Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={tokens.secondaryColor}
                            onChange={(e) => setTokens(p => ({ ...p, secondaryColor: e.target.value }))}
                            className="w-10 h-9 p-1 bg-transparent border-none"
                        />
                        <Input
                            value={tokens.secondaryColor}
                            onChange={(e) => setTokens(p => ({ ...p, secondaryColor: e.target.value }))}
                            className="flex-1 text-xs font-mono h-9"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Accent Color</Label>
                    <div className="flex gap-2">
                        <Input
                            type="color"
                            value={tokens.accentColor}
                            onChange={(e) => setTokens(p => ({ ...p, accentColor: e.target.value }))}
                            className="w-10 h-9 p-1 bg-transparent border-none"
                        />
                        <Input
                            value={tokens.accentColor}
                            onChange={(e) => setTokens(p => ({ ...p, accentColor: e.target.value }))}
                            className="flex-1 text-xs font-mono h-9"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-medium">Border Radius</Label>
                    <Input
                        value={tokens.borderRadius}
                        onChange={(e) => setTokens(p => ({ ...p, borderRadius: e.target.value }))}
                        placeholder="e.g. 0.5rem"
                        className="text-xs h-9"
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs font-medium">Font Family</Label>
                    <Input
                        value={tokens.fontFamily}
                        onChange={(e) => setTokens(p => ({ ...p, fontFamily: e.target.value }))}
                        placeholder="e.g. Inter, sans-serif"
                        className="text-xs h-9"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                    Tip: AURA will automatically incorporate these values into Tailwind configurations and styles for all new components it builds.
                </p>
            </div>
        </div>
    );
}
