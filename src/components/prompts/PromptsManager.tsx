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
import { useAuth } from "@/contexts/AuthContext";

const normalizeName = (name: string) => {
  if (!name) return "Untitled Prompt";
  return name
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// ── Editable Field Component ──────────────────────────────────────────────────
const EditableField = ({
  fieldKey,
  value,
  editable = false,
  onSave,
  type = "string"
}: {
  fieldKey: string;
  value: any;
  editable?: boolean;
  onSave?: (v: any) => Promise<void>;
  type?: "string" | "number" | "textarea";
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(value);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setVal(value); }, [value]);

  const handleSave = async () => {
    if (val === value) { setIsEditing(false); return; }
    setLoading(true);
    try {
      let finalVal = val;
      if (type === "number") finalVal = Number(val);
      await onSave?.(finalVal);
      setIsEditing(false);
    } catch (e) {
      setVal(value);
    } finally {
      setLoading(false);
    }
  };

  if (!editable) {
    return (
      <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 group relative overflow-hidden">
        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5 tracking-tight group-hover:text-primary transition-colors">{fieldKey.replace(/_/g, " ")}</span>
        <span className="text-xs text-foreground font-mono truncate block break-all">{String(value || "N/A")}</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-3 rounded-xl border transition-all relative group",
      isEditing ? "bg-background border-primary shadow-sm ring-1 ring-primary/20" : "bg-secondary/40 border-border/40 hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between mb-1.5">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight group-hover:text-primary transition-colors">{fieldKey.replace(/_/g, " ")}</span>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all">
            <Pencil className="w-3 h-3 text-primary" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={() => setIsEditing(false)} disabled={loading} className="p-1 hover:bg-secondary rounded transition-shrink">
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <button onClick={handleSave} disabled={loading} className="p-1 hover:bg-primary/20 rounded text-primary transition-shrink">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        type === "textarea" ? (
          <Textarea
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="text-xs font-mono h-32 bg-secondary/20 resize-none custom-scrollbar"
            autoFocus
          />
        ) : (
          <Input
            type={type === "number" ? "number" : "text"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="h-7 text-xs font-mono bg-secondary/20"
            autoFocus
          />
        )
      ) : (
        <div className={cn(
          "text-xs text-foreground font-mono block break-words custom-scrollbar",
          type === "textarea" ? "whitespace-pre-wrap max-h-[800px] overflow-y-auto" : "truncate"
        )}>
          {String(value || "N/A")}
        </div>
      )}
    </div>
  );
};

// ── Insert Panel Content ──────────────────────────────────────────────────────
const InsertPanelContent = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [record, setRecord] = useState({
    tenant_id: "bp-sense",
    app_id: "",
    engine_type: "intent_engine",
    name: "NEW_PROMPT_NAME",
    version: "v1.0.0",
    model_name: "gpt-4o",
    max_tokens: 4000,
    system_prompt: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInsert = async () => {
    setSaving(true); setError(null);
    try {
      if (!record.name || !record.system_prompt) {
        throw new Error("Name and System Prompt are required.");
      }
      await createPrompt(record as any);
      onSuccess();
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between px-1 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Create New Prompt</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Fill in the template details below</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 px-3 text-xs">Cancel</Button>
          <Button
            onClick={handleInsert}
            disabled={saving}
            className="h-8 px-4 text-xs gap-1.5 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save Prompt
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5 text-xs text-destructive animate-in shake-1 duration-300">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <EditableField fieldKey="Name" value={record.name} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, name: v }))} />
        <EditableField fieldKey="Version" value={record.version} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, version: v }))} />
        <EditableField fieldKey="Engine Type" value={record.engine_type} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, engine_type: v }))} />
        <EditableField fieldKey="App ID" value={record.app_id} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, app_id: v }))} />
        <EditableField fieldKey="Model" value={record.model_name} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, model_name: v }))} />
        <EditableField fieldKey="Max Tokens" value={record.max_tokens} type="number" editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, max_tokens: v }))} />
        <div className="col-span-2">
          <EditableField fieldKey="Tenant ID" value={record.tenant_id} editable={true} onSave={async (v) => setRecord(prev => ({ ...prev, tenant_id: v }))} />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-1">System Prompt</span>
        <Textarea
          placeholder="Enter the system instructions here..."
          value={record.system_prompt}
          onChange={(e) => setRecord(prev => ({ ...prev, system_prompt: e.target.value }))}
          className="min-h-[800px] text-xs font-mono bg-secondary/20 border-border focus:bg-background transition-all custom-scrollbar leading-relaxed"
        />
      </div>
    </div>
  );
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
  const [activeEngineFilter, setActiveEngineFilter] = useState<string | null>(null);
  const [activeAppIdFilter, setActiveAppIdFilter] = useState<string | null>(null);
  const [showInsert, setShowInsert] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = !!user?.edit_access;

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

  const uniqueEngines = useMemo(() => {
    const engines = [...new Set(prompts.map(p => String(p.engine_type || "").trim()).filter(Boolean))].sort();
    return engines.map(e => ({ value: e, count: prompts.filter(p => String(p.engine_type || "").trim() === e).length }));
  }, [prompts]);

  const uniqueAppIds = useMemo(() => {
    const ids = [...new Set(prompts.map(p => String(p.app_id || "").trim()).filter(Boolean))].sort();
    return ids.map(id => ({ value: id, count: prompts.filter(p => String(p.app_id || "").trim() === id).length }));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const q = search.toLowerCase().trim();
      const pName = String(p.name || "").toLowerCase().trim();
      const pPrompt = String(p.system_prompt || "").toLowerCase().trim();
      const pEngine = String(p.engine_type || "").toLowerCase().trim();
      const pApp = String(p.app_id || "").toLowerCase().trim();

      const matchesSearch = !q ||
        pName.includes(q) ||
        pPrompt.includes(q) ||
        pEngine.includes(q) ||
        pApp.includes(q);

      const matchesEngine = !activeEngineFilter || pEngine === activeEngineFilter.toLowerCase().trim();
      const matchesApp = !activeAppIdFilter || pApp === activeAppIdFilter.toLowerCase().trim();

      return matchesSearch && matchesEngine && matchesApp;
    });
  }, [prompts, search, activeEngineFilter, activeAppIdFilter]);

  const groupedPrompts = useMemo(() => {
    const groups: Record<string, Prompt[]> = {};
    filteredPrompts.forEach(p => {
      const engine = p.engine_type || "Uncategorized";
      if (!groups[engine]) groups[engine] = [];
      groups[engine].push(p);
    });
    // Sort group keys alphabetically
    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, Prompt[]>);
  }, [filteredPrompts]);

  const selectedPrompt = useMemo(() =>
    prompts.find(p => p._id === selectedId) || null
    , [prompts, selectedId]);

  const handleSelect = (p: Prompt) => {
    setSelectedId(p._id);
  };

  const listPane = (
    <div className="flex flex-col h-full bg-background">
      <div className="px-3 py-2 border-b border-border bg-card/40 flex-shrink-0 z-30 flex items-center gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="p-1 bg-primary/10 rounded-md flex-shrink-0">
            <Terminal className="w-3 h-3 text-primary" />
          </div>
          <h1 className="text-[11px] font-bold text-foreground truncate">Prompts</h1>
          <span className="text-[9px] font-mono text-muted-foreground bg-secondary/50 px-1 py-0.5 rounded border border-border/40 flex-shrink-0">
            {filteredPrompts.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] gap-1 text-primary hover:bg-primary/10 border border-primary/20 bg-primary/5 shadow-sm"
              onClick={() => {
                setSelectedId(null);
                setShowInsert(true);
              }}
            >
              <Plus className="w-2.5 h-2.5" />
              <span className="font-semibold">Insert Prompt</span>
            </Button>
          )}

          <div className="relative w-50 group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-6 h-6 bg-secondary/20 border-border/40 focus:bg-background transition-all rounded-md text-[9px] w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-2 h-2" />
              </button>
            )}
          </div>
          <FilterDropdown
            label="Engine"
            items={uniqueEngines}
            activeValue={activeEngineFilter}
            onSelect={setActiveEngineFilter}
            onClear={() => setActiveEngineFilter(null)}
          />
          <FilterDropdown
            label="App"
            items={uniqueAppIds}
            activeValue={activeAppIdFilter}
            onSelect={setActiveAppIdFilter}
            onClear={() => setActiveAppIdFilter(null)}
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={loadPrompts}>
            <RefreshCw className={cn("w-2.5 h-2.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-6 scroll-smooth">
        {(activeEngineFilter || activeAppIdFilter) && (
          <div className="flex items-center justify-between px-2 py-1.5 bg-secondary/20 border border-border/40 rounded-lg animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] text-muted-foreground font-medium">Clear active filters to see all entries</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => {
                setActiveEngineFilter(null);
                setActiveAppIdFilter(null);
              }}
            >
              Reset
            </Button>
          </div>
        )}
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
          Object.entries(groupedPrompts).map(([engine, items]) => (
            <div key={engine} className="space-y-2">
              <div className="flex items-center gap-2 px-1 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">{engine}</span>
                <div className="h-px flex-1 bg-border/40" />
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 opacity-50">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((p) => (
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
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-semibold text-foreground pr-6 truncate">{normalizeName(p.name)}</h3>
                      <ChevronRight className={cn(
                        "w-3.5 h-3.5 transition-all duration-300",
                        selectedId === p._id ? "text-primary translate-x-0" : "text-muted-foreground/30 -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 opacity-0"
                      )} />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-normal">
                      {p.system_prompt}
                    </p>

                    {selectedId === p._id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const detailPanel = showInsert ? {
    header: (
      <div className="flex items-center justify-between w-full px-4 py-3 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Plus className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Create New Prompt</h2>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowInsert(false)} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>
    ),
    body: (
      <InsertPanelContent
        onClose={() => setShowInsert(false)}
        onSuccess={() => {
          loadPrompts();
          toast({ title: "Success", description: "Prompt created successfully" });
        }}
      />
    )
  } : selectedPrompt ? {
    header: (
      <div className="flex items-center justify-between w-full px-4 py-3 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold flex items-center gap-1.5 truncate pr-4 text-foreground">
              {normalizeName(selectedPrompt.name)}
              <Badge variant="outline" className="text-[10px] h-5 font-mono font-medium py-0 px-1 border-primary/20 bg-primary/5 text-primary flex-shrink-0">
                {selectedPrompt.version || "v?.?.?"}
              </Badge>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  if (confirm("Are you sure you want to delete this prompt?")) {
                    try {
                      await deletePrompt(selectedPrompt._id);
                      setSelectedId(null);
                      loadPrompts();
                      toast({ title: "Success", description: "Prompt deleted successfully" });
                    } catch (e: any) {
                      toast({ title: "Error", description: e.message, variant: "destructive" });
                    }
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <div className="h-4 w-px bg-border mx-1" />
            </>
          )}
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
      <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-2 duration-400">
        <div className="grid grid-cols-2 gap-3">
          <EditableField
            fieldKey="Name"
            value={selectedPrompt.name}
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, name: v });
              loadPrompts();
            }}
          />
          <EditableField
            fieldKey="Version"
            value={selectedPrompt.version}
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, version: v });
              loadPrompts();
            }}
          />
          <EditableField
            fieldKey="Model"
            value={selectedPrompt.model_name}
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, model_name: v });
              loadPrompts();
            }}
          />
          <EditableField
            fieldKey="Max Tokens"
            value={selectedPrompt.max_tokens}
            type="number"
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, max_tokens: v });
              loadPrompts();
            }}
          />
          <EditableField
            fieldKey="Engine Type"
            value={selectedPrompt.engine_type}
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, engine_type: v });
              loadPrompts();
            }}
          />
          <EditableField
            fieldKey="App ID"
            value={selectedPrompt.app_id}
            editable={canEdit}
            onSave={async (v) => {
              await updatePrompt(selectedPrompt._id, { ...selectedPrompt, app_id: v });
              loadPrompts();
            }}
          />
          <div className="col-span-2">
            <EditableField
              fieldKey="Tenant ID"
              value={selectedPrompt.tenant_id}
              editable={canEdit}
              onSave={async (v) => {
                await updatePrompt(selectedPrompt._id, { ...selectedPrompt, tenant_id: v });
                loadPrompts();
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">System Prompt Instructions</span>
            <div className="flex gap-1.5">
              <Button variant="ghost" className="h-6 px-2 text-[9px] gap-1" onClick={() => {
                navigator.clipboard.writeText(selectedPrompt.system_prompt);
                toast({ title: "Copied", description: "Prompt copied to clipboard" });
              }}>
                <Copy className="w-2.5 h-2.5" /> Copy
              </Button>
            </div>
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
            <div className="p-1">
              <EditableField
                fieldKey="System Prompt Content"
                value={selectedPrompt.system_prompt}
                type="textarea"
                editable={canEdit}
                onSave={async (v) => {
                  await updatePrompt(selectedPrompt._id, { ...selectedPrompt, system_prompt: v });
                  loadPrompts();
                }}
              />
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
      listPaneClassName="overflow-hidden"
    />
  );
};

export default PromptsManager;
