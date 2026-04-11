import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Plus, Pencil, Trash2, Check, X, Save, Loader2, BookOpen } from "lucide-react";
import type { KnowledgeRecord } from "./types";
import { isEditable, apiUpdatePoint, apiDeletePoint, apiInsert } from "./types";
import { SplitPanelWrapper, FieldBlock } from "./SplitDetailPanel";
import { useAuth } from "@/contexts/AuthContext";

interface KnowledgesTabProps {
  knowledges: KnowledgeRecord[];
  collection: string;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  highlightId?: string | null;
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────
const FilterDropdown = ({ label, items, activeValue, onSelect, onClear, colorClass = "text-teal-400" }: {
  label: string; items: { value: string; count: number }[]; activeValue: string | null;
  onSelect: (v: string) => void; onClear: () => void; colorClass?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 h-[30px] rounded-full border cursor-pointer whitespace-nowrap transition-all duration-300 ${activeValue ? `${colorClass} bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(45,212,191,0.15)]` : "text-muted-foreground bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/50 hover:text-foreground"}`}>
        <span>{label}</span>
        {activeValue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 truncate max-w-[90px] backdrop-blur-md">{activeValue}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[180px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.value} onClick={() => { onSelect(item.value); setOpen(false); }} className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] font-mono transition-colors hover:bg-secondary ${activeValue === item.value ? colorClass : "text-muted-foreground"}`}>
              <span>{item.value}</span><span className="text-[10px] text-muted-foreground ml-auto">{item.count}</span>
            </div>
          ))}
          <div className="h-px bg-border my-1" />
          <button onClick={() => { onClear(); setOpen(false); }} className="w-full text-left px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors">✕ Clear filter</button>
        </div>
      )}
    </div>
  );
};

// ── Confirm Delete ────────────────────────────────────────────────────────────
const ConfirmDelete = ({ name, onConfirm, onCancel, deleting }: { name: string; onConfirm: () => void; onCancel: () => void; deleting: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
    <div className="bg-card border border-border rounded-xl shadow-2xl p-5 max-w-[360px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">Delete Knowledge?</h3>
      <p className="text-xs text-muted-foreground mb-4">Permanently remove <span className="text-foreground font-medium">"{name}"</span>?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={deleting} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded-md bg-destructive/15 border border-destructive/30 text-destructive hover:bg-destructive/25 disabled:opacity-50 transition-colors">
          {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Insert Panel Content ──────────────────────────────────────────────────────
const InsertPanelContent = ({ collection, onClose, onSuccess }: { collection: string; onClose: () => void; onSuccess: () => void }) => {
  const [record, setRecord] = useState(() => ({
    version: "string (e.g., v1.0.1)",
    knowledge_id: crypto.randomUUID() as string,
    short_description: "brief summary",
    search_keywords: [
      ["keyword1", "keyword2"], 
      ["keyword_group_2"]
    ],
    description: "detailed explanation",
    api_tags: ["tag1", "tag2"],
    keywords: ["keyword1", "keyword2"],
    name: "title of the knowledge item",
    type: "insurance_dict",
    tenant_id: "optional string",
    app_id: "optional string"
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFieldChange = (k: string, v: unknown) => {
    setRecord((prev) => ({ ...prev, [k]: v }));
  };

  const handleInsert = async () => {
    setSaving(true); setErr(null);
    try {
      if (!record.short_description || record.short_description === "brief summary") {
        throw new Error('short_description is required. Please provide a brief summary.');
      }
      
      await apiInsert(collection, [record], "short_description");
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col pb-4">
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
          Replace placeholders with real data.<br />
          <code className="text-teal-400">short_description</code> is the embedding text.
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">Cancel</button>
          <button onClick={handleInsert} disabled={saving} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3.5 py-1.5 rounded-md bg-teal-400/15 border border-teal-400/30 text-teal-400 hover:bg-teal-400/25 disabled:opacity-50 transition-colors flex-shrink-0">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Insert Record
          </button>
        </div>
      </div>

      {err && <div className="mb-4 text-[11px] font-mono text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-1.5">{err}</div>}
      
      <div>
        {Object.entries(record).map(([k, v]) => (
          <EditableField 
            key={k} 
            fieldKey={k} 
            value={v} 
            editable={true} 
            onSave={async (newVal) => handleFieldChange(k, newVal)} 
          />
        ))}
      </div>
    </div>
  );
};

// ── Knowledge Row (compact list item) ────────────────────────────────────────
const KnowledgeRow = ({ d, searchQuery, isSelected, onSelect }: {
  d: KnowledgeRecord; searchQuery: string; isSelected: boolean; onSelect: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`relative group flex flex-col gap-1.5 p-3.5 rounded-2xl border transition-all duration-400 cursor-pointer overflow-hidden ${isSelected ? "bg-teal-400/10 border-teal-400/40 shadow-[0_4px_24px_-8px_rgba(45,212,191,0.4)] ring-1 ring-teal-500/20" : "bg-card/40 border-border/50 hover:border-teal-400/30 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5"}`}
  >
    <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 ${isSelected ? "bg-teal-400/20 opacity-100" : "bg-teal-400/10 opacity-0 group-hover:opacity-100"}`} />
    <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isSelected ? "bg-teal-400" : "bg-transparent group-hover:bg-teal-400/40"}`} />
    <div className="flex items-center gap-2.5">
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground leading-snug line-clamp-2" dangerouslySetInnerHTML={{
          __html: searchQuery ? (d.name || "(unnamed)").replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark class='bg-amber-500/25 text-amber-400 rounded px-0.5'>$1</mark>") : (d.name || "(unnamed)"),
        }} />
        {d.short_description && <p className="text-[11px] font-mono text-muted-foreground mt-1 line-clamp-1">{String(d.short_description)}</p>}
      </div>
      {d.type && <span className="flex-shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-400/10 border border-teal-400/20 text-teal-400">{d.type}</span>}
    </div>
  </div>
);

// ── Editable field row in detail ──────────────────────────────────────────────
const EditableField = ({ fieldKey, value, editable, onSave }: { fieldKey: string; value: unknown; editable: boolean; onSave?: (v: unknown) => Promise<void> }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const isLocked = fieldKey === "knowledge_id" || fieldKey === "_doc_id";
  const isComplex = (typeof value === "object" && value !== null) || (typeof value === "string" && (String(value).length > 100 || value.includes("\n")));

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true); setErr(null);
    try {
      let parsed: unknown = draft;
      if (draft.trim().startsWith("{") || draft.trim().startsWith("[")) parsed = JSON.parse(draft);
      await onSave(parsed);
      setEditing(false);
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setDraft(typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? ""));
    setEditing(false); setErr(null);
  };

  const renderVal = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-muted-foreground italic text-xs">null</span>;
    if (typeof val === "boolean") return <span className="text-green-400 font-mono text-xs">{String(val)}</span>;
    if (typeof val === "number") return <span className="text-amber-400 font-mono text-xs">{val}</span>;
    if (typeof val === "string" && val.length <= 100 && !val.includes("\n")) return <span className="text-blue-300 font-mono text-xs break-all">{val}</span>;
    if (typeof val === "string") return <pre className="bg-secondary/60 border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed mt-1">{val}</pre>;
    if (Array.isArray(val) && val.length === 0) return <span className="text-muted-foreground font-mono text-xs">[]</span>;
    return <pre className="bg-secondary/60 border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed mt-1"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(val, null, 2).replace(/"([^"]+)":/g, '<span class="text-teal-400">"$1"</span>:').replace(/: "([^"]*)"/g, ': <span class="text-blue-300">"$1"</span>').replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>').replace(/: (true|false)/g, ': <span class="text-green-400">$1</span>').replace(/: null/g, ': <span class="text-muted-foreground">null</span>') }} />;
  };

  return (
    <div className="py-3 border-b border-border/60 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {isComplex ? (
            <button className="flex items-center gap-1 group" onClick={() => setOpen(p => !p)}>
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{fieldKey}</span>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{fieldKey}</span>
          )}
          {isLocked && <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-secondary border border-border text-muted-foreground">locked</span>}
        </div>
        {!isLocked && editable && !editing && (
          <button onClick={() => setEditing(true)} className="p-0.5 rounded hover:bg-teal-400/15 text-muted-foreground hover:text-teal-400 transition-colors"><Pencil className="w-3 h-3" /></button>
        )}
      </div>
      {editing ? (
        <div className="mt-1 flex flex-col gap-1.5">
          <textarea className="w-full bg-secondary border border-teal-400/40 focus:border-teal-400 rounded-md px-2.5 py-2 font-mono text-xs text-foreground outline-none resize-y leading-relaxed" rows={Math.min(30, Math.max(draft.split('\n').length + 1, isComplex ? 12 : 3))} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          {err && <span className="text-[11px] font-mono text-destructive">{err}</span>}
          <div className="flex gap-1.5">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-teal-400/15 border border-teal-400/30 text-teal-400 hover:bg-teal-400/25 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />} Save
            </button>
            <button onClick={handleCancel} className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"><X className="w-3 h-3" /> Cancel</button>
          </div>
        </div>
      ) : (
        (!isComplex || open) && renderVal(value)
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const KnowledgesTab = ({ knowledges: initialKnowledges, collection, loading, error, onReload, highlightId }: KnowledgesTabProps) => {
  const [knowledges, setKnowledges] = useState<KnowledgeRecord[]>(initialKnowledges);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeApi, setActiveApi] = useState<string | null>(null);
  const [showInsert, setShowInsert] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  const editable = isEditable(collection) && !!user?.edit_access;

  const uniqueTypes = useMemo(() => {
    const types = [...new Set(knowledges.map((d) => d.type).filter(Boolean) as string[])].sort();
    return types.map((t) => ({ value: t, count: knowledges.filter((d) => d.type === t).length }));
  }, [knowledges]);

  const uniqueApiTags = useMemo(() => {
    const tags = [...new Set(knowledges.flatMap((d) => d.api_tags || []))].sort();
    return tags.map((t) => ({ value: t, count: knowledges.filter((d) => (d.api_tags || []).includes(t)).length }));
  }, [knowledges]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return knowledges.filter((d) => {
      if (q) {
        if (!["name","description","short_description","knowledge_id","_doc_id"].some(k => String((d as any)[k] || "").toLowerCase().includes(q))) return false;
      }
      if (activeType && d.type !== activeType) return false;
      if (activeApi && !(d.api_tags || []).includes(activeApi)) return false;
      if (highlightId && (d.knowledge_id || d._doc_id) !== highlightId) return false;
      return true;
    });
  }, [knowledges, searchQuery, activeType, activeApi, highlightId]);

  const selectedRecord = useMemo(() => knowledges.find((k) => (k._doc_id || k.knowledge_id) === selectedId) ?? null, [knowledges, selectedId]);
  const confirmRecord = useMemo(() => knowledges.find((k) => (k._doc_id || k.knowledge_id) === confirmDeleteId) ?? null, [knowledges, confirmDeleteId]);

  const handleDeleted = (id: string) => {
    setKnowledges((prev) => prev.filter((k) => (k._doc_id || k.knowledge_id) !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleFieldUpdated = (id: string, field: string, val: unknown) => {
    setKnowledges((prev) => prev.map((k) => (k._doc_id || k.knowledge_id) === id ? { ...k, [field]: val } : k));
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await apiDeletePoint(collection, confirmDeleteId);
      handleDeleted(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (e: any) { alert(`Delete failed: ${e.message}`); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
      <div className="w-7 h-7 border-2 border-border border-t-teal-400 rounded-full animate-spin" />
      <div className="text-sm font-mono text-muted-foreground">Loading {collection}…</div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
      <div className="text-sm font-mono text-destructive">Failed to load</div>
      <div className="text-xs font-mono text-muted-foreground text-center max-w-[340px]">{error}</div>
      <button onClick={onReload} className="text-xs font-mono text-teal-400 bg-teal-400/10 border border-teal-400/30 rounded px-3.5 py-1.5 hover:opacity-80">↺ Retry</button>
    </div>
  );

  const listContent = (
    <div className="max-w-none mx-auto py-8 px-4">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Knowledges</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filtered.length}</span>
          {editable && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-400/10 border border-teal-400/30 text-teal-400 uppercase tracking-wider">editable</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search name, description…" className="h-[30px] text-xs pl-8 w-[210px] bg-card" />
          </div>
          <div className="w-px h-[22px] bg-border" />
          <FilterDropdown label="Type" items={uniqueTypes} activeValue={activeType} onSelect={(v) => setActiveType(activeType === v ? null : v)} onClear={() => setActiveType(null)} colorClass="text-teal-400" />
          <FilterDropdown label="API Tag" items={uniqueApiTags} activeValue={activeApi} onSelect={(v) => setActiveApi(activeApi === v ? null : v)} onClear={() => setActiveApi(null)} colorClass="text-purple-400" />
          {editable && (
            <><div className="w-px h-[22px] bg-border/50 mx-1" />
            <button onClick={() => { setShowInsert(true); setSelectedId(null); }} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3.5 h-[32px] rounded-full border border-teal-400/30 bg-teal-400/10 text-teal-400 hover:bg-teal-400 hover:text-white hover:shadow-[0_0_15px_rgba(45,212,191,0.4)] transition-all duration-300">
              <Plus className="w-3.5 h-3.5" /> Insert
            </button></>
          )}
        </div>
      </div>

      {highlightId && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-teal-400/10 border border-teal-400/30 rounded-lg mb-3.5 text-[11px] font-mono text-muted-foreground">
          <span>Filtered by knowledge:</span><span className="text-teal-400 flex-1 truncate">{highlightId}</span>
        </div>
      )}

      {!knowledges.length ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No data available.</div>
      ) : !filtered.length ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No entries match your filters.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((d, i) => (
            <KnowledgeRow
              key={d._doc_id || d.knowledge_id || i}
              d={d}
              searchQuery={searchQuery}
              isSelected={selectedId === (d._doc_id || d.knowledge_id) && !showInsert}
              onSelect={() => {
                const id = d._doc_id || d.knowledge_id || "";
                setSelectedId(selectedId === id ? null : id);
                setShowInsert(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const detail = showInsert ? {
    header: (
      <div className="flex items-start gap-2.5 px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5"><Plus className="w-4 h-4 text-teal-400" /><span className="text-sm font-semibold text-foreground">Insert Knowledge</span></div>
          <span className="text-[11px] font-mono text-muted-foreground block truncate">{collection}</span>
        </div>
        <button onClick={() => setShowInsert(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Close panel">
          <X className="w-4 h-4" />
        </button>
      </div>
    ),
    body: <InsertPanelContent collection={collection} onClose={() => setShowInsert(false)} onSuccess={onReload} />
  } : selectedRecord ? {
    header: (
      <div className="flex items-start gap-3 px-5 py-3.5 relative overflow-hidden bg-card border-b border-border shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex flex-shrink-0 items-center justify-center text-teal-500 mt-0.5 relative z-10">
          <BookOpen size={14} />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5 text-[10px]">
            <span className="font-mono font-bold text-teal-500 uppercase tracking-widest">{selectedRecord.knowledge_id || selectedRecord._doc_id || "UNKNOWN"}</span>
            {selectedRecord.type && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-teal-400/10 border-teal-400/30 text-teal-500 inline-block font-semibold">{selectedRecord.type}</span>
              </>
            )}
            {editable && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary/80 border border-border text-muted-foreground inline-block">knowledge_id locked</span>
              </>
            )}
          </div>
          <p className="text-[13px] font-semibold text-foreground leading-snug break-words pr-6">
            {selectedRecord.name || "(unnamed)"}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 relative z-10">
          {editable && (
            <button onClick={() => setConfirmDeleteId(selectedRecord._doc_id || selectedRecord.knowledge_id || "")} className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors group" title="Delete">
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group bg-background/50 border border-border/50 shadow-sm" title="Close">
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    ),
    body: (
      <div className="space-y-1 py-2 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="px-2 mb-4">
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
            <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-secondary/20">
              <BookOpen size={12} className="text-teal-500" />
              Knowledge Record
            </div>
            <div className="px-2 pb-2">
              {Object.entries(selectedRecord).map(([k, v]) => {
                const isLocked = k === "knowledge_id" || k === "_doc_id" || k === "short_description";
                return (
                  <div key={k} className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both" style={{ animationDelay: `${Object.keys(selectedRecord).indexOf(k) * 20}ms` }}>
                    <EditableField
                      fieldKey={k}
                      value={v}
                      editable={editable && !isLocked}
                      onSave={editable && !isLocked ? async (newVal) => {
                        const docId = selectedRecord._doc_id || selectedRecord.knowledge_id || "";
                        const payload: Record<string, unknown> = { ...selectedRecord };
                        delete payload._doc_id;
                        payload[k] = newVal;
                        await apiUpdatePoint(collection, docId, payload);
                        handleFieldUpdated(docId, k, newVal);
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ),
  } : null;

  return (
    <>
      {confirmRecord && (
        <ConfirmDelete name={confirmRecord.name || "(unnamed)"} onConfirm={handleDelete} onCancel={() => setConfirmDeleteId(null)} deleting={deleting} />
      )}
      <SplitPanelWrapper listPane={listContent} detail={detail} />
    </>
  );
};

export default KnowledgesTab;
