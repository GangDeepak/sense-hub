import React, { useMemo, useState } from "react";
import { Search, User, Clock, ThumbsUp, ThumbsDown, Hash, Calendar, Zap, MessageSquare, Info, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SplitPanelWrapper, FieldBlock } from "@/components/grounding/SplitDetailPanel";
import type { DashboardData, QueryItem } from "./types";

interface EnrichedQuery extends QueryItem {
  userEmail: string;
  bucket: string;
}

// ── Shared Filter Dropdown (Replicated from Grounding/QueriesTab) ────────────
const FilterDropdown = ({ label, items, activeValue, onSelect, onClear, colorClass = "text-primary", icon: Icon }: {
  label: string; 
  items: { value: string; count: number }[]; 
  activeValue: string | null;
  onSelect: (v: string) => void; 
  onClear: () => void; 
  colorClass?: string;
  icon?: any;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = items.filter((i) => i.value.toLowerCase().includes(search.toLowerCase()));
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)} 
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 h-[30px] rounded-full border cursor-pointer whitespace-nowrap transition-all duration-300 ${
          activeValue && activeValue !== "ALL" 
            ? `${colorClass} bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]` 
            : "text-muted-foreground bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/50 hover:text-foreground"
        }`}
      >
        {Icon && <Icon className="w-3 h-3" />}
        <span>{label}</span>
        {activeValue && activeValue !== "ALL" && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 truncate max-w-[90px] backdrop-blur-md">
            {activeValue}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[200px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
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
          <button 
            onClick={() => { onClear(); setOpen(false); setSearch(""); }} 
            className="w-full text-left px-2 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors"
          >
            ✕ Clear {label.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );
};

const QueryAnalytics = ({ data }: { data: DashboardData | null }) => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("ALL");
  const [selectedBucket, setSelectedBucket] = useState("ALL");
  const [selectedQuery, setSelectedQuery] = useState<EnrichedQuery | null>(null);

  // 1. Flatten Data
  const allQueries = useMemo(() => {
    if (!data?.sense_dev) return [];
    const flattened: EnrichedQuery[] = [];
    const buckets = ["0-5s", "5-10s", "10-15s", "15-20s", "20s+", "empty"] as const;

    Object.entries(data.sense_dev).forEach(([email, userStats]) => {
      buckets.forEach((bucket) => {
        const items = userStats[bucket];
        if (items && Array.isArray(items)) {
          items.forEach((item) => {
            flattened.push({ ...item, userEmail: email, bucket });
          });
        }
      });
    });

    return flattened.sort((a, b) => {
      const dateA = a.session_created ? new Date(a.session_created).getTime() : 0;
      const dateB = b.session_created ? new Date(b.session_created).getTime() : 0;
      return dateA - dateB;
    });
  }, [data]);

  // 2. Filter Stats
  const userStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allQueries.forEach(q => counts[q.userEmail] = (counts[q.userEmail] || 0) + 1);
    return Object.entries(counts).map(([value, count]) => ({ value, count })).sort((a,b) => a.value.localeCompare(b.value));
  }, [allQueries]);

  const bucketStats = useMemo(() => {
    const counts: Record<string, number> = {};
    ["0-5s", "5-10s", "10-15s", "15-20s", "20s+", "empty"].forEach(b => counts[b] = 0);
    allQueries.forEach(q => counts[q.bucket] = (counts[q.bucket] || 0) + 1);
    return Object.entries(counts).map(([value, count]) => ({ value, count }));
  }, [allQueries]);

  // 3. Filtered List
  const filteredQueries = useMemo(() => {
    return allQueries.filter((q) => {
      const matchSearch = 
        q.query.toLowerCase().includes(search.toLowerCase()) || 
        (q.query_id || "").toLowerCase().includes(search.toLowerCase());
      const matchUser = selectedUser === "ALL" || q.userEmail === selectedUser;
      const matchBucket = selectedBucket === "ALL" || q.bucket === selectedBucket;
      return matchSearch && matchUser && matchBucket;
    });
  }, [allQueries, search, selectedUser, selectedBucket]);

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24 bg-card/30 rounded-2xl border border-dashed border-border/50">
      <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Waiting for dashboard data</div>
      <div className="text-[10px] text-muted-foreground/60 mt-2 italic">Please apply filters to load query analytics</div>
    </div>
  );

  const listPane = (
    <div className="max-w-none mx-auto py-8 px-4">
      {/* Filters Header (Match QueriesTab style) */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Query Logs</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filteredQueries.length}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search queries or ID…" 
              className="h-[30px] text-xs pl-8 w-[210px] bg-card" 
            />
          </div>
          
          <div className="w-px h-[22px] bg-border mx-1" />

          {/* User Filter */}
          <FilterDropdown 
            label="User" 
            items={userStats} 
            activeValue={selectedUser} 
            onSelect={setSelectedUser} 
            onClear={() => setSelectedUser("ALL")}
            icon={User}
          />

          {/* Bucket Filter */}
          <FilterDropdown 
            label="Latency" 
            items={bucketStats} 
            activeValue={selectedBucket} 
            onSelect={setSelectedBucket} 
            onClear={() => setSelectedBucket("ALL")}
            icon={Clock}
            colorClass="text-amber-400"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="space-y-1.5">
        {filteredQueries.map((q) => (
          <button
            key={q.ref_id + q.query_id}
            onClick={() => setSelectedQuery(q)}
            className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 group hover:shadow-lg hover:scale-[1.005] relative overflow-hidden ${
              selectedQuery?.query_id === q.query_id
                ? "bg-blue-400/10 border-blue-400/40 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                : "bg-card/50 border-border hover:border-blue-400/30 hover:bg-card"
            }`}
          >
            {/* Left Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
              selectedQuery?.query_id === q.query_id ? "bg-blue-400" : "bg-transparent group-hover:bg-blue-400/40"
            }`} />

            <div className="flex justify-between items-start gap-3 mb-1.5">
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-border/50 uppercase tracking-tighter ${
                      q.bucket === "0-5s" ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" :
                      q.bucket === "20s+" ? "bg-rose-400/10 text-rose-400 border-rose-400/20" :
                      "bg-secondary/80 text-muted-foreground"
                    }`}>
                        {q.bucket}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/60 truncate uppercase">{q.query_id}</span>
                  </div>
                  <div className="text-sm text-foreground leading-snug line-clamp-2">
                    {search ? (
                      <span dangerouslySetInnerHTML={{
                        __html: q.query.replace(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "<mark class='bg-amber-500/25 text-amber-400 rounded px-0.5'>$1</mark>")
                      }} />
                    ) : q.query}
                  </div>
               </div>
               <div className="shrink-0 pt-1">
                 {q.rating === "like" && <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 opacity-80" />}
                 {q.rating === "dislike" && <ThumbsDown className="w-3.5 h-3.5 text-rose-400 opacity-80" />}
               </div>
            </div>

            <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono text-muted-foreground/60">
              <span className="truncate max-w-[180px] bg-secondary/50 px-1.5 py-0.5 rounded border border-border/40">{q.userEmail}</span>
              <span className="flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> {q.session_created ? new Date(q.session_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "-"}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const detailConfig = selectedQuery ? {
    header: (
      <div className="flex items-start gap-2.5 px-4 py-3.5 relative overflow-hidden">
        {/* Left Accent (Matches QueriesTab) */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
             <div className="px-1.5 py-0.5 rounded border bg-blue-400/10 border-blue-400/30 text-[9px] font-mono text-blue-400 uppercase tracking-widest">Query Analytics</div>
             <span className="text-[10px] font-mono text-muted-foreground/60">{selectedQuery.query_id}</span>
          </div>
          <p className="text-sm font-semibold text-white leading-snug break-words">
            {selectedQuery.query}
          </p>
          <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-muted-foreground/60">
            <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> {selectedQuery.userEmail}</span>
            <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {selectedQuery.bucket}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={() => setSelectedQuery(null)} 
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors group"
            title="Close panel"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </div>
    ),
    body: (
      <div className="space-y-1 animate-in fade-in slide-in-from-right-2 duration-500">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 border-b border-border/60 py-4 opacity-50 flex items-center justify-between">
           <span>Diagnostic Analysis</span>
           <span className="text-teal-400 text-[9px] px-1.5 py-0.5 rounded bg-teal-400/10 border border-teal-400/20">{selectedQuery.ref_id}</span>
        </div>

        <FieldBlock label="Response Content" value={selectedQuery.response_data} />
        <FieldBlock label="Created At" value={selectedQuery.session_created ? new Date(selectedQuery.session_created).toLocaleString() : "-"} />
        <FieldBlock label="Sentiment Rating" value={selectedQuery.rating} />
        <FieldBlock label="Feedback Log" value={selectedQuery.comment} />
        <FieldBlock label="Execution Time" value={`${selectedQuery.elapsed_s}s`} />
        <FieldBlock label="System Meta" value={selectedQuery.meta_total} />
        <FieldBlock label="Plan Trace" value={selectedQuery.module_outputs} />
        <FieldBlock label="Bag of Properties" value={selectedQuery.metadata} />
      </div>
    )
  } : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 -m-5">
      <SplitPanelWrapper listPane={listPane} detail={detailConfig} />
    </div>
  );
};

export default QueryAnalytics;
