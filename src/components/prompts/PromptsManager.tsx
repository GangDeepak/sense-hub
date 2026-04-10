import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Terminal, Plus, Trash2, Pencil, Check, X,
  Save, Loader2, Copy, Sparkles, FileCode, ChevronRight, AlertCircle, RefreshCw,
  ChevronDown
} from "lucide-react";
import { Prompt, fetchPrompts, updatePrompt, deletePrompt, createPrompt } from "./types";
import { SplitPanelWrapper, FieldBlock } from "../grounding/SplitDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

const normalizeName = (name: string) => {
  if (!name) return "Untitled Prompt";
  return name
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
};

const FilterDropdown = ({ label, items, activeValue, onSelect, onClear }: {
  label: string;
  items: { value: string; count: number }[];
  activeValue: string | null;
  onSelect: (v: string) => void;
  onClear: () => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 h-[28px] rounded-full border transition-all duration-300",
          activeValue
            ? "text-primary bg-primary/10 border-primary/40 shadow-sm"
            : "text-muted-foreground bg-card/50 border-border hover:border-muted-foreground/50 hover:text-foreground"
        )}
      >
        <span>{label}</span>
        {activeValue && <span className="text-[9px] px-1 py-0.5 rounded-full bg-primary/10 truncate max-w-[80px]">{activeValue}</span>}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-[calc(100%+5px)] right-0 min-w-[160px] bg-card border border-border rounded-xl p-1.5 z-50 shadow-xl max-h-[250px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => { onSelect(item.value); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[10px] font-mono transition-colors hover:bg-secondary",
                  activeValue === item.value ? "text-primary bg-primary/5" : "text-muted-foreground"
                )}
              >
                <span className="truncate">{item.value}</span>
                <span className="text-[9px] opacity-40 ml-2">{item.count}</span>
              </button>
            ))}
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => { onClear(); setOpen(false); }}
              className="w-full text-left px-2.5 py-1.5 text-[9px] font-mono text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3 h-3" /> Clear filter
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const PromptsManager = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeNameFilter, setActiveNameFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrompts();
      setPrompts(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load prompts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  const uniqueNames = useMemo(() => {
    const names = [...new Set(prompts.map(p => p.name))].sort();
    return names.map(n => ({ value: n, count: prompts.filter(p => p.name === n).length }));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const q = search.toLowerCase();
      const pName = p.name || "";
      const pPrompt = p.system_prompt || "";
      const pEngine = p.engine_type || "";

      const matchesSearch = pName.toLowerCase().includes(q) ||
        pPrompt.toLowerCase().includes(q) ||
        pEngine.toLowerCase().includes(q);

      const matchesName = !activeNameFilter || p.name === activeNameFilter;

      return matchesSearch && matchesName;
    });
  }, [prompts, search, activeNameFilter]);

  const selectedPrompt = useMemo(() =>
    prompts.find(p => p._id === selectedId) || null
    , [prompts, selectedId]);

  const handleSelect = (p: Prompt) => {
    setSelectedId(p._id);
  };

  const listPane = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border bg-card/50 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Prompt Templates</h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">System Instructions</p>
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                  {filteredPrompts.length}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={loadPrompts}>
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by name, content..."
              className="pl-9 h-8 bg-secondary/30 border-border/60 focus:bg-background transition-all rounded-lg text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterDropdown
            label="Name"
            items={uniqueNames}
            activeValue={activeNameFilter}
            onSelect={setActiveNameFilter}
            onClear={() => setActiveNameFilter(null)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {loading && prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs font-mono">Fetching prompts...</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
            <div className="p-3 bg-secondary rounded-full mb-3">
              <FileCode className="w-5 h-5 opacity-40" />
            </div>
            <p className="text-xs font-medium">No prompts found</p>
          </div>
        ) : (
          filteredPrompts.map((p) => (
            <button
              key={p._id}
              onClick={() => handleSelect(p)}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all duration-200 group relative overflow-hidden",
                selectedId === p._id
                  ? "bg-primary/5 border-primary/30 shadow-sm"
                  : "bg-card border-border/40 hover:border-primary/20 hover:bg-primary/[0.02]"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={cn(
                  "text-[10px] font-mono px-2 py-0.5 rounded-md border",
                  selectedId === p._id ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary text-muted-foreground border-border"
                )}>
                  {p.engine_type || "No Engine"}
                </span>
                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-all duration-300",
                  selectedId === p._id ? "text-primary translate-x-0" : "text-muted-foreground/30 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 opacity-0"
                )} />
              </div>
              <h3 className="text-xs font-semibold text-foreground mb-1 pr-6 truncate">{normalizeName(p.name)}</h3>
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                {p.system_prompt}
              </p>

              {selectedId === p._id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  const detailPanel = selectedPrompt ? {
    header: (
      <div className="flex items-center justify-between w-full px-4 py-3 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 truncate pr-4">
              {selectedPrompt.name}
              <Badge variant="outline" className="text-[9px] h-4 font-mono font-medium py-0 px-1 border-primary/20 bg-primary/5 text-primary flex-shrink-0">
                {selectedPrompt.version || "v?.?.?"}
              </Badge>
            </h2>
            <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">ID: {selectedPrompt._id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-secondary transition-all group"
            onClick={() => setSelectedId(null)}
          >
            <X className="w-4 h-4 text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    ),
    body: (
      <div className="space-y-6 pt-4">
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Model Name</span>
              <code className="text-xs text-primary font-mono">{selectedPrompt.model_name || "Unspecified"}</code>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Max Tokens</span>
              <span className="text-xs text-foreground font-mono">{selectedPrompt.max_tokens || 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Tenant ID</span>
              <span className="text-xs text-foreground font-mono truncate block" title={selectedPrompt.tenant_id}>
                {selectedPrompt.tenant_id?.slice(0, 8) || "N/A"}...
              </span>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">App ID</span>
              <span className="text-xs text-foreground font-mono">{selectedPrompt.app_id || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">System Prompt (Read Only)</span>
              <Button variant="ghost" className="h-6 px-2 text-[9px] gap-1" onClick={() => {
                navigator.clipboard.writeText(selectedPrompt.system_prompt);
                toast({ title: "Copied", description: "Prompt copied to clipboard" });
              }}>
                <Copy className="w-2.5 h-2.5" /> Copy
              </Button>
            </div>
            <div className="rounded-2xl border border-border bg-black/5 overflow-hidden">
              <div className="bg-muted/50 px-3 py-1.5 border-b border-border flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">prompt_template.txt</span>
              </div>
              <pre className="p-4 text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto custom-scrollbar text-foreground/90">
                {selectedPrompt.system_prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>
    )
  } : null;

  if (error && prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Failed to fetch prompt templates. Make sure the backend is reachable via the BASE_URL.
        </p>
        <Button onClick={loadPrompts} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <SplitPanelWrapper
      listPane={listPane}
      detail={detailPanel}
    />
  );
};

export default PromptsManager;
