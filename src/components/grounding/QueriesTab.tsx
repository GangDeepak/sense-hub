import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, Grid2x2, Plus, Trash2, Pencil, Check, X, Save, Loader2 } from "lucide-react";
import type { QueryRecord } from "./types";
import { isEditable, apiUpdatePoint, apiDeletePoint, apiInsert } from "./types";
import { SplitPanelWrapper } from "./SplitDetailPanel";

interface QueriesTabProps {
  queries: QueryRecord[];
  collection: string;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  highlightKnowledgeId?: string | null;
}

// ── Filter Dropdown ───────────────────────────────────────────────────────────
const FilterDropdown = ({ label, items, activeValue, onSelect, onClear, colorClass = "text-primary" }: {
  label: string; items: { value: string; count: number }[]; activeValue: string | null;
  onSelect: (v: string) => void; onClear: () => void; colorClass?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) => i.value.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 h-[30px] rounded-full border cursor-pointer whitespace-nowrap transition-all duration-300 ${activeValue ? `${colorClass} bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]` : "text-muted-foreground bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/50 hover:text-foreground"}`}>
        <span>{label}</span>
        {activeValue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 truncate max-w-[90px] backdrop-blur-md">{activeValue}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[180px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {items.length > 6 && <input className="w-full text-[11px] font-mono bg-secondary border border-border rounded px-2 py-1.5 mb-1 outline-none text-foreground placeholder:text-muted-foreground" placeholder={`Search ${label.toLowerCase()}…`} value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />}
          {filtered.map((item) => (
            <div key={item.value} onClick={() => { onSelect(item.value); setOpen(false); setSearch(""); }} className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] font-mono transition-colors hover:bg-secondary ${activeValue === item.value ? colorClass : "text-muted-foreground"}`}>
              <span>{item.value}</span><span className="text-[10px] text-muted-foreground ml-auto">{item.count}</span>
            </div>
          ))}
          <div className="h-px bg-border my-1" />
          <button onClick={() => { onClear(); setOpen(false); setSearch(""); }} className="w-full text-left px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors">✕ Clear {label.toLowerCase()} filter</button>
        </div>
      )}
    </div>
  );
};

// ── Confirm Delete ────────────────────────────────────────────────────────────
const ConfirmDelete = ({ query, onConfirm, onCancel, deleting }: { query: string; onConfirm: () => void; onCancel: () => void; deleting: boolean }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
    <div className="bg-card border border-border rounded-xl shadow-2xl p-5 max-w-[360px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">Delete Query?</h3>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-3">Remove <span className="text-foreground font-medium">"{query}"</span>?</p>
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
    created_at: "date",
    cluster_id: "string",
    query_uuid: crypto.randomUUID() as string,
    user_query: "string",
    intent_tags: ["string"],
    knowledge_ids: ["string"],
    tenant_id: "string (optional)",
    app_id: "string (optional)",
    task_planner: {
      tasks: [
        {
          task_id: "string",
          name: "string",
          type: "api",
          order: "number",
          depends_on: ["task_id"],
          arguments: {
            api_name: "string",
            method: "GET/POST",
            headers: {
              "tenant-id": "string",
              "app-id": "string",
              "email-id": "string"
            },
            inputs: {
              "ref-id": ["string"]
            }
          },
          checkpoint: "boolean"
        }
      ]
    },
    intent_tools: [
      {
        name: "string",
        type: "api",
        description: "string",
        arguments: {
          api_name: "string",
          method: "GET/POST",
          headers: {
            "tenant-id": "string",
            "app-id": "string",
            "email-id": "string"
          },
          inputs: {
            "ref-id": "string"
          }
        }
      }
    ],
    knowledge: [
      {
        type: "calculation | fact",
        description: "string"
      }
    ]
  }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFieldChange = (k: string, v: unknown) => {
    setRecord((prev) => ({ ...prev, [k]: v }));
  };

  const handleInsert = async () => {
    setSaving(true); setErr(null);
    try {
      if (collection === "query_memory" && (!record.user_query || record.user_query === "string")) {
        throw new Error('user_query is required. Please provide a valid string.');
      }
      
      await apiInsert(collection, [record], "user_query");
      setTimeout(() => { onSuccess(); onClose(); }, 900);
    } catch (e: any) { setErr(e.message); } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col pb-4">
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
          Replace placeholders with real data.<br />
          <code className="text-blue-400">user_query</code> is required.
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="text-[11px] font-mono px-3 py-1.5 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">Cancel</button>
          <button onClick={handleInsert} disabled={saving} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3.5 py-1.5 rounded-md bg-blue-400/15 border border-blue-400/30 text-blue-400 hover:bg-blue-400/25 disabled:opacity-50 transition-colors flex-shrink-0">
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

// ── Query Row (compact) ───────────────────────────────────────────────────────
const QueryRow = ({ d, searchQuery, isSelected, onSelect }: { d: QueryRecord; searchQuery: string; isSelected: boolean; onSelect: () => void }) => {
  const tags = d.intent_tags || [];
  return (
    <div
      onClick={onSelect}
      className={`relative group flex flex-col gap-1.5 p-3.5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden mb-1.5 ${isSelected ? "bg-blue-400/10 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]" : "bg-card/50 border-border hover:border-blue-400/30 hover:bg-card hover:shadow-lg hover:scale-[1.005]"}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isSelected ? "bg-blue-400" : "bg-transparent group-hover:bg-blue-400/40"}`} />
      <div className="flex items-start gap-2.5">
        <div className="flex-1 min-w-0">
          <span className="text-sm text-foreground block leading-snug" dangerouslySetInnerHTML={{
            __html: searchQuery ? String(d.user_query || "(no query)").replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark class='bg-amber-500/25 text-amber-400 rounded px-0.5'>$1</mark>") : String(d.user_query || "(no query)"),
          }} />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">{t}</span>)}
              {tags.length > 3 && <span className="text-[10px] font-mono text-muted-foreground">+{tags.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Editable field row in detail ──────────────────────────────────────────────
const EditableField = ({ fieldKey, value, editable, onSave }: { fieldKey: string; value: unknown; editable: boolean; onSave?: (v: unknown) => Promise<void> }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(typeof value === "object" ? JSON.stringify(value, null, 2) : String(value ?? ""));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  const isLocked = fieldKey === "user_query" || fieldKey === "_doc_id";
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(val, null, 2).replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:').replace(/: "([^"]*)"/g, ': <span class="text-blue-300">"$1"</span>').replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>').replace(/: (true|false)/g, ': <span class="text-green-400">$1</span>').replace(/: null/g, ': <span class="text-muted-foreground">null</span>') }} />;
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
          <button onClick={() => setEditing(true)} className="p-0.5 rounded hover:bg-blue-400/15 text-muted-foreground hover:text-blue-400 transition-colors"><Pencil className="w-3 h-3" /></button>
        )}
      </div>
      {editing ? (
        <div className="mt-1 flex flex-col gap-1.5">
          <textarea className="w-full bg-secondary border border-blue-400/40 focus:border-blue-400 rounded-md px-2.5 py-2 font-mono text-xs text-foreground outline-none resize-y leading-relaxed" rows={Math.min(30, Math.max(draft.split('\n').length + 1, isComplex ? 12 : 3))} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          {err && <span className="text-[11px] font-mono text-destructive">{err}</span>}
          <div className="flex gap-1.5">
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded bg-blue-400/15 border border-blue-400/30 text-blue-400 hover:bg-blue-400/25 disabled:opacity-50 transition-colors">
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
const QueriesTab = ({ queries: initialQueries, collection, loading, error, onReload, highlightKnowledgeId }: QueriesTabProps) => {
  const [queries, setQueries] = useState<QueryRecord[]>(initialQueries);
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterMode, setClusterMode] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKnowledge, setActiveKnowledge] = useState<number | null>(null);
  const [showInsert, setShowInsert] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editable = isEditable(collection);

  const uniqueTags = useMemo(() => {
    const tags = [...new Set(queries.flatMap((d) => d.intent_tags || []))].sort();
    return tags.map((t) => ({ value: t, count: queries.filter((d) => (d.intent_tags || []).includes(t)).length }));
  }, [queries]);

  const knowledgeCounts = useMemo(() => Array.from({ length: 7 }, (_, i) => ({
    value: i === 6 ? "6+" : String(i),
    count: queries.filter((d) => { const kc = (d.knowledge || []).length; return i === 6 ? kc >= 6 : kc === i; }).length,
  })), [queries]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return queries.filter((d) => {
      if (q && !String(d.user_query || "").toLowerCase().includes(q) && !String(d.query_uuid || "").toLowerCase().includes(q)) return false;
      if (activeTag && !(d.intent_tags || []).includes(activeTag)) return false;
      if (activeKnowledge !== null) { const kc = Array.isArray(d.knowledge) ? d.knowledge.length : 0; if (activeKnowledge === 6 ? kc < 6 : kc !== activeKnowledge) return false; }
      if (highlightKnowledgeId && !(d.knowledge_ids || []).includes(highlightKnowledgeId)) return false;
      return true;
    });
  }, [queries, searchQuery, activeTag, activeKnowledge, highlightKnowledgeId]);

  const selectedRecord = useMemo(() => queries.find((q) => (q._doc_id || q.query_uuid) === selectedId) ?? null, [queries, selectedId]);
  const confirmRecord = useMemo(() => queries.find((q) => (q._doc_id || q.query_uuid) === confirmDeleteId) ?? null, [queries, confirmDeleteId]);

  const handleDeleted = (id: string) => {
    setQueries((prev) => prev.filter((q) => (q._doc_id || q.query_uuid) !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleFieldUpdated = (id: string, field: string, val: unknown) => {
    setQueries((prev) => prev.map((q) => (q._doc_id || q.query_uuid) === id ? { ...q, [field]: val } : q));
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    try {
      await apiDeletePoint(collection, confirmDeleteId);
      handleDeleted(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (e: any) { alert(`Delete failed: ${e.message}`); } finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
      <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
      <div className="text-sm font-mono text-muted-foreground">Loading {collection}…</div>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
      <div className="text-sm font-mono text-destructive">Failed to load</div>
      <div className="text-xs font-mono text-muted-foreground text-center max-w-[340px]">{error}</div>
      <button onClick={onReload} className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded px-3.5 py-1.5 hover:opacity-80">↺ Retry</button>
    </div>
  );

  const renderListItems = () => {
    if (!queries.length) return <div className="text-center py-12 text-sm text-muted-foreground">No data available.</div>;
    if (!filtered.length) return <div className="text-center py-12 text-sm text-muted-foreground">No queries match your filters.</div>;

    const makeRow = (d: QueryRecord, i: number) => (
      <QueryRow key={d._doc_id || i} d={d} searchQuery={searchQuery}
        isSelected={selectedId === (d._doc_id || d.query_uuid) && !showInsert}
        onSelect={() => { 
          const id = d._doc_id || d.query_uuid || ""; 
          setSelectedId(selectedId === id ? null : id);
          setShowInsert(false);
        }}
      />
    );

    if (clusterMode) {
      const groups: Record<string, QueryRecord[]> = {};
      filtered.forEach((d) => { const cid = d.cluster_id || "__none__"; if (!groups[cid]) groups[cid] = []; groups[cid].push(d); });
      return Object.entries(groups).map(([cid, items]) => (
        <div key={cid} className="mb-4">
          <div className="flex items-center gap-2 py-1.5 mb-2">
            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">cluster</span>
            <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{cid === "__none__" ? "No cluster" : cid}</span>
            <span className="text-[11px] font-mono text-muted-foreground">{items.length} quer{items.length === 1 ? "y" : "ies"}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          {items.map(makeRow)}
        </div>
      ));
    }
    return filtered.map(makeRow);
  };

  const listContent = (
    <div className="max-w-none mx-auto py-8 px-4">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Queries</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filtered.length}</span>
          {editable && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-400/10 border border-blue-400/30 text-blue-400 uppercase tracking-wider">editable</span>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search queries or ID…" className="h-[30px] text-xs pl-8 w-[210px] bg-card" />
          </div>
          <div className="w-px h-[22px] bg-border" />
          <button onClick={() => setClusterMode(!clusterMode)} className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 h-[30px] rounded-md border cursor-pointer whitespace-nowrap transition-colors ${clusterMode ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-muted-foreground bg-card border-border hover:text-foreground"}`}>
            <Grid2x2 className="w-3 h-3" /> Cluster view
          </button>
          <div className="w-px h-[22px] bg-border" />
          <FilterDropdown label="Tag" items={uniqueTags} activeValue={activeTag} onSelect={(v) => setActiveTag(activeTag === v ? null : v)} onClear={() => setActiveTag(null)} />
          <FilterDropdown label="Knowledge" items={knowledgeCounts} activeValue={activeKnowledge !== null ? (activeKnowledge === 6 ? "6+" : String(activeKnowledge)) : null} onSelect={(v) => { const n = v === "6+" ? 6 : parseInt(v); setActiveKnowledge(activeKnowledge === n ? null : n); }} onClear={() => setActiveKnowledge(null)} colorClass="text-green-400" />
          {editable && (<><div className="w-px h-[22px] bg-border/50 mx-1" />
            <button onClick={() => { setShowInsert(true); setSelectedId(null); }} className="inline-flex items-center gap-1.5 text-[11px] font-mono px-3.5 h-[32px] rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-400 hover:bg-blue-400 hover:text-white hover:shadow-[0_0_15px_rgba(96,165,250,0.4)] transition-all duration-300">
              <Plus className="w-3.5 h-3.5" /> Insert
            </button></>
          )}
        </div>
      </div>
      
      {highlightKnowledgeId && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-400/10 border border-blue-400/30 rounded-lg mb-4 text-[11px] font-mono text-muted-foreground">
          <span>Filtered by knowledge:</span><span className="text-blue-400 flex-1 truncate">{highlightKnowledgeId}</span>
        </div>
      )}

      {renderListItems()}
    </div>
  );

  const detail = showInsert ? {
    header: (
      <div className="flex items-start gap-2.5 px-4 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5"><Plus className="w-4 h-4 text-blue-400" /><span className="text-sm font-semibold text-foreground">Insert Query</span></div>
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
      <div className="flex items-start gap-2.5 px-4 py-3.5">
        <div className="flex-1 min-w-0">
          {selectedRecord.cluster_id && <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-amber-400/10 border-amber-400/30 text-amber-400 mb-1.5 inline-block">cluster: {selectedRecord.cluster_id}</span>}
          <p className="text-sm font-semibold text-foreground leading-snug break-words">{String(selectedRecord.user_query || "(no query)")}</p>
          {(selectedRecord.query_uuid || selectedRecord._doc_id) && <span className="text-[11px] font-mono text-muted-foreground mt-0.5 block truncate">{selectedRecord.query_uuid || selectedRecord._doc_id}</span>}
          {editable && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary border border-border text-muted-foreground mt-1 inline-block">user_query locked</span>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {editable && (
            <button onClick={() => setConfirmDeleteId(selectedRecord._doc_id || selectedRecord.query_uuid || "")} className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors" title="Delete query">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Close panel">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ),
    body: (
      <div>
        {Object.entries(selectedRecord).map(([k, v]) => {
          const isLocked = k === "user_query" || k === "_doc_id";
          return (
            <EditableField
              key={k}
              fieldKey={k}
              value={v}
              editable={editable && !isLocked}
              onSave={editable && !isLocked ? async (newVal) => {
                const docId = selectedRecord._doc_id || selectedRecord.query_uuid || "";
                const payload: Record<string, unknown> = { ...selectedRecord };
                delete payload._doc_id;
                payload[k] = newVal;
                await apiUpdatePoint(collection, docId, payload);
                handleFieldUpdated(docId, k, newVal);
              } : undefined}
            />
          );
        })}
      </div>
    ),
  } : null;

  return (
    <>
      {confirmRecord && <ConfirmDelete query={String(confirmRecord.user_query || "(no query)")} onConfirm={handleDelete} onCancel={() => setConfirmDeleteId(null)} deleting={deleting} />}
      <SplitPanelWrapper listPane={listContent} detail={detail} />
    </>
  );
};

export default QueriesTab;
