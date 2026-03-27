import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search } from "lucide-react";
import type { KnowledgeRecord } from "./types";

interface KnowledgesTabProps {
  knowledges: KnowledgeRecord[];
  collection: string;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  highlightId?: string | null;
}

const FilterDropdown = ({
  label, items, activeValue, onSelect, onClear, colorClass = "text-teal-400",
}: {
  label: string;
  items: { value: string; count: number }[];
  activeValue: string | null;
  onSelect: (val: string) => void;
  onClear: () => void;
  colorClass?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 h-[30px] rounded-md border cursor-pointer whitespace-nowrap transition-colors ${
          activeValue ? `${colorClass} bg-current/10 border-current/30` : "text-muted-foreground bg-card border-border hover:text-foreground"
        }`}
      >
        <span>{label}</span>
        {activeValue && <span className="text-[10px] px-1.5 rounded bg-white/10 truncate max-w-[90px]">{activeValue}</span>}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[180px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.value}
              onClick={() => { onSelect(item.value); setOpen(false); }}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] font-mono transition-colors hover:bg-secondary ${
                activeValue === item.value ? colorClass : "text-muted-foreground"
              }`}
            >
              <span>{item.value}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{item.count}</span>
            </div>
          ))}
          <div className="h-px bg-border my-1" />
          <button onClick={() => { onClear(); setOpen(false); }} className="w-full text-left px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors">
            ✕ Clear filter
          </button>
        </div>
      )}
    </div>
  );
};

const SectionContent = ({ label, value }: { label: string; value: unknown }) => {
  const [open, setOpen] = useState(false);
  const isMultiLine = typeof value === "object" && value !== null || (typeof value === "string" && (String(value).length > 80 || String(value).includes("\n")));

  const renderValue = (val: unknown) => {
    if (val === null || val === undefined) return <span className="text-muted-foreground">null</span>;
    if (typeof val === "boolean") return <span className="text-green-400">{String(val)}</span>;
    if (typeof val === "number") return <span className="text-amber-400">{val}</span>;
    if (typeof val === "string" && val.length <= 80 && !val.includes("\n")) return <span className="text-blue-300">{val}</span>;
    if (typeof val === "string") return <pre className="bg-secondary border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed">{val}</pre>;
    if (Array.isArray(val) && val.length === 0) return <span className="text-muted-foreground">[]</span>;
    return (
      <pre className="bg-secondary border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed" dangerouslySetInnerHTML={{
        __html: JSON.stringify(val, null, 2)
          .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
          .replace(/: "([^"]*)"/g, ': <span class="text-blue-300">"$1"</span>')
          .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
          .replace(/: (true|false)/g, ': <span class="text-green-400">$1</span>')
          .replace(/: null/g, ': <span class="text-muted-foreground">null</span>')
      }} />
    );
  };

  if (!isMultiLine) {
    return (
      <div className="px-4 py-3 border-b border-border last:border-b-0">
        <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1.5">{label}</div>
        <span className="font-mono text-xs">{renderValue(value)}</span>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {open && <div className="mt-2.5">{renderValue(value)}</div>}
    </div>
  );
};

const KnowledgeCard = ({ d, searchQuery, defaultOpen }: { d: KnowledgeRecord; searchQuery: string; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen || false);
  const kid = d.knowledge_id || d._doc_id || "";
  const name = d.name || "(unnamed)";
  const bodyFields = Object.entries(d);

  return (
    <div id={`kcard-${kid}`} className={`bg-card border rounded-xl overflow-hidden transition-colors cursor-pointer scroll-mt-[70px] ${open ? "border-primary/30" : "border-border hover:border-muted-foreground/30 hover:shadow-lg"}`}>
      <div className="px-4 py-3.5 flex flex-col gap-2" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-2.5">
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
          <span className="flex-1 text-sm font-medium text-foreground leading-snug" dangerouslySetInnerHTML={{
            __html: searchQuery
              ? name.replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark class='bg-amber-500/25 text-amber-400 rounded px-0.5'>$1</mark>")
              : name
          }} />
        </div>
      </div>
      {open && (
        <div className="border-t border-border">
          {bodyFields.map(([k, v]) => <SectionContent key={k} label={k} value={v} />)}
        </div>
      )}
    </div>
  );
};

const KnowledgesTab = ({ knowledges, collection, loading, error, onReload, highlightId }: KnowledgesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeApi, setActiveApi] = useState<string | null>(null);

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
        const inName = String(d.name || "").toLowerCase().includes(q);
        const inDesc = String(d.description || "").toLowerCase().includes(q);
        const inShort = String(d.short_description || "").toLowerCase().includes(q);
        const inId = String(d.knowledge_id || d._doc_id || "").toLowerCase().includes(q);
        if (!inName && !inDesc && !inShort && !inId) return false;
      }
      if (activeType && d.type !== activeType) return false;
      if (activeApi && !(d.api_tags || []).includes(activeApi)) return false;
      if (highlightId) {
        const currentKid = d.knowledge_id || d._doc_id || "";
        if (currentKid !== highlightId) return false;
      }
      return true;
    });
  }, [knowledges, searchQuery, activeType, activeApi, highlightId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="w-7 h-7 border-2 border-border border-t-teal-400 rounded-full animate-spin" />
        <div className="text-sm font-mono text-muted-foreground">Loading {collection}…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="text-sm font-mono text-destructive">Failed to load</div>
        <div className="text-xs font-mono text-muted-foreground text-center max-w-[340px]">{error}</div>
        <button onClick={onReload} className="text-xs font-mono text-teal-400 bg-teal-400/10 border border-teal-400/30 rounded px-3.5 py-1.5 hover:opacity-80">↺ Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto py-8 px-6">
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Knowledges</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, description…"
              className="h-[30px] text-xs pl-8 w-[210px] bg-card"
            />
          </div>
          <div className="w-px h-[22px] bg-border" />
          <FilterDropdown
            label="Type"
            items={uniqueTypes}
            activeValue={activeType}
            onSelect={(v) => setActiveType(activeType === v ? null : v)}
            onClear={() => setActiveType(null)}
            colorClass="text-teal-400"
          />
          <FilterDropdown
            label="API Tag"
            items={uniqueApiTags}
            activeValue={activeApi}
            onSelect={(v) => setActiveApi(activeApi === v ? null : v)}
            onClear={() => setActiveApi(null)}
            colorClass="text-purple-400"
          />
        </div>
      </div>

      {highlightId && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-teal-400/10 border border-teal-400/30 rounded-lg mb-3.5 text-[11px] font-mono text-muted-foreground">
          <span>Filtered by knowledge:</span>
          <span className="text-teal-400 flex-1 truncate">{highlightId}</span>
        </div>
      )}

      {!knowledges.length ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No data available.</div>
      ) : !filtered.length ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No entries match your filters.</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((d, i) => (
            <KnowledgeCard
              key={d._doc_id || d.knowledge_id || i}
              d={d}
              searchQuery={searchQuery}
              defaultOpen={highlightId === (d.knowledge_id || d._doc_id || "")}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgesTab;
