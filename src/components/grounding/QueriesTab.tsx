import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Grid2x2 } from "lucide-react";
import type { QueryRecord } from "./types";

interface QueriesTabProps {
  queries: QueryRecord[];
  collection: string;
  loading: boolean;
  error: string | null;
  onReload: () => void;
}

const FilterDropdown = ({
  label, items, activeValue, onSelect, onClear, colorClass = "text-primary",
}: {
  label: string;
  items: { value: string; count: number }[];
  activeValue: string | null;
  onSelect: (val: string) => void;
  onClear: () => void;
  colorClass?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = items.filter((i) => i.value.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 h-[30px] rounded-md border cursor-pointer whitespace-nowrap transition-colors ${
          activeValue ? `${colorClass} bg-primary/10 border-primary/30` : "text-muted-foreground bg-card border-border hover:text-foreground hover:border-border"
        }`}
      >
        <span>{label}</span>
        {activeValue && <span className="text-[10px] px-1.5 rounded bg-white/10 truncate max-w-[90px]">{activeValue}</span>}
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[180px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {items.length > 6 && (
            <input
              className="w-full text-[11px] font-mono bg-secondary border border-border rounded px-2 py-1.5 mb-1 outline-none text-foreground placeholder:text-muted-foreground"
              placeholder={`Search ${label.toLowerCase()}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          )}
          {filtered.map((item) => (
            <div
              key={item.value}
              onClick={() => { onSelect(item.value); setOpen(false); setSearch(""); }}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] font-mono transition-colors hover:bg-secondary ${
                activeValue === item.value ? colorClass : "text-muted-foreground"
              }`}
            >
              <span>{item.value}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{item.count}</span>
            </div>
          ))}
          <div className="h-px bg-border my-1" />
          <button onClick={() => { onClear(); setOpen(false); setSearch(""); }} className="w-full text-left px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors">
            ✕ Clear {label.toLowerCase()} filter
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

const QueryItem = ({ d, searchQuery }: { d: QueryRecord; searchQuery: string }) => {
  const [open, setOpen] = useState(false);
  const uuid = d.query_uuid || d._doc_id || JSON.stringify(d).slice(0, 20);
  const bodyFields = Object.entries(d).filter(([k]) => k !== "user_query");

  return (
    <div className={`bg-card border rounded-lg overflow-hidden transition-colors mb-1.5 ${open ? "border-border" : "border-border hover:border-muted-foreground/30"}`}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        <span className="flex-1 text-sm text-foreground" dangerouslySetInnerHTML={{
          __html: searchQuery
            ? String(d.user_query || "(no query)").replace(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark class='bg-amber-500/25 text-amber-400 rounded px-0.5'>$1</mark>")
            : String(d.user_query || "(no query)")
        }} />
      </div>
      {open && (
        <div className="border-t border-border">
          {bodyFields.map(([k, v]) => <SectionContent key={k} label={k} value={v} />)}
        </div>
      )}
    </div>
  );
};

const QueriesTab = ({ queries, collection, loading, error, onReload }: QueriesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clusterMode, setClusterMode] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeKnowledge, setActiveKnowledge] = useState<number | null>(null);

  const uniqueTags = useMemo(() => {
    const tags = [...new Set(queries.flatMap((d) => d.intent_tags || []))].sort();
    return tags.map((t) => ({ value: t, count: queries.filter((d) => (d.intent_tags || []).includes(t)).length }));
  }, [queries]);

  const knowledgeCounts = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => ({
      value: i === 6 ? "6+" : String(i),
      count: queries.filter((d) => { const kc = (d.knowledge || []).length; return i === 6 ? kc >= 6 : kc === i; }).length,
    }));
  }, [queries]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return queries.filter((d) => {
      if (q && !String(d.user_query || "").toLowerCase().includes(q) && !String(d.query_uuid || "").toLowerCase().includes(q)) return false;
      if (activeTag && !(d.intent_tags || []).includes(activeTag)) return false;
      if (activeKnowledge !== null) {
        const kc = Array.isArray(d.knowledge) ? d.knowledge.length : 0;
        if (activeKnowledge === 6 ? kc < 6 : kc !== activeKnowledge) return false;
      }
      return true;
    });
  }, [queries, searchQuery, activeTag, activeKnowledge]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
        <div className="text-sm font-mono text-muted-foreground">Loading {collection}…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="text-sm font-mono text-destructive">Failed to load</div>
        <div className="text-xs font-mono text-muted-foreground text-center max-w-[340px]">{error}</div>
        <button onClick={onReload} className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded px-3.5 py-1.5 hover:opacity-80">↺ Retry</button>
      </div>
    );
  }

  const renderList = () => {
    if (!queries.length) return <div className="text-center py-12 text-sm text-muted-foreground">No data available.</div>;
    if (!filtered.length) return <div className="text-center py-12 text-sm text-muted-foreground">No queries match your filters.</div>;

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
          {items.map((d, i) => <QueryItem key={d._doc_id || i} d={d} searchQuery={searchQuery} />)}
        </div>
      ));
    }

    return filtered.map((d, i) => <QueryItem key={d._doc_id || i} d={d} searchQuery={searchQuery} />);
  };

  return (
    <div className="max-w-[960px] mx-auto py-8 px-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-baseline gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Queries</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search queries or ID…"
              className="h-[30px] text-xs pl-8 w-[210px] bg-card"
            />
          </div>
          <div className="w-px h-[22px] bg-border" />
          <button
            onClick={() => setClusterMode(!clusterMode)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 h-[30px] rounded-md border cursor-pointer whitespace-nowrap transition-colors ${
              clusterMode ? "text-amber-400 bg-amber-400/10 border-amber-400/30" : "text-muted-foreground bg-card border-border hover:text-foreground"
            }`}
          >
            <Grid2x2 className="w-3 h-3" /> Cluster view
          </button>
          <div className="w-px h-[22px] bg-border" />
          <FilterDropdown
            label="Tag"
            items={uniqueTags}
            activeValue={activeTag}
            onSelect={(v) => setActiveTag(activeTag === v ? null : v)}
            onClear={() => setActiveTag(null)}
          />
          <FilterDropdown
            label="Knowledge"
            items={knowledgeCounts}
            activeValue={activeKnowledge !== null ? (activeKnowledge === 6 ? "6+" : String(activeKnowledge)) : null}
            onSelect={(v) => { const n = v === "6+" ? 6 : parseInt(v); setActiveKnowledge(activeKnowledge === n ? null : n); }}
            onClear={() => setActiveKnowledge(null)}
            colorClass="text-green-400"
          />
        </div>
      </div>

      {renderList()}
    </div>
  );
};

export default QueriesTab;
