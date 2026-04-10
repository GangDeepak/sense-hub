import React, { useMemo, useState, useEffect, useRef } from "react";
import { Search, User, Clock, ThumbsUp, ThumbsDown, Calendar, X, ChevronDown, Activity, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SplitPanelWrapper, FieldBlock, SectionBlock } from "@/components/grounding/SplitDetailPanel";
import type { DashboardData, QueryItem } from "./types";

interface EnrichedQuery extends QueryItem {
  userEmail: string;
  bucket: string;
}

// ── Shared Filter Dropdown ───────────────────────────────────────────────────
const FilterDropdown = ({
  label,
  items,
  activeValue,
  onSelect,
  onClear,
  colorClass = "text-primary",
  bgClass = "bg-primary/10",
  align = "left",
  icon: Icon
}: {
  label: string;
  items: { value: string; count: number }[];
  activeValue: string | null;
  onSelect: (v: string) => void;
  onClear: () => void;
  colorClass?: string;
  bgClass?: string;
  align?: "left" | "right";
  icon?: any;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filtered = items.filter((i) => i.value.toLowerCase().includes(search.toLowerCase()));

  const isActive = activeValue && activeValue !== "ALL";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 text-[11px] font-semibold px-4 h-[36px] rounded-full border cursor-pointer whitespace-nowrap transition-all duration-300 ${isActive
          ? `${colorClass} ${bgClass} border-current/30 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-md ring-1 ring-current/20`
          : "text-muted-foreground bg-card/40 backdrop-blur-md border-border/60 hover:border-border hover:bg-card/80 hover:text-foreground"
          }`}
      >
        {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "" : "opacity-60"}`} />}
        <span>{label}</span>
        {isActive && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-background/50 border border-current/10 truncate max-w-[100px] shadow-sm">
            {activeValue}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 opacity-60 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute top-[calc(100%+8px)] ${align === 'right' ? 'right-0' : 'left-0'} min-w-[220px] bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl p-2 z-50 shadow-2xl max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200`}>
          {items.length > 6 && (
            <input
              className="w-full text-xs font-medium bg-background border border-border/50 rounded-lg px-2.5 py-2 mb-2 outline-none text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
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
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all duration-200 hover:bg-muted/80 ${activeValue === item.value ? `${colorClass} bg-muted/50` : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <span>{item.value}</span>
              <span className="text-[10px] bg-background border border-border/40 px-1.5 py-0.5 rounded-md ml-auto text-muted-foreground font-mono">{item.count}</span>
            </div>
          ))}
          <div className="h-px bg-border/50 my-1.5" />
          <button
            onClick={() => { onClear(); setOpen(false); setSearch(""); }}
            className="w-full text-center px-2.5 py-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          >
            Clear Filter
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
  const [selectedRating, setSelectedRating] = useState<"ALL" | "like" | "dislike">("ALL");
  const [selectedQuery, setSelectedQuery] = useState<EnrichedQuery | null>(null);

  // 1. Flatten Data from sense_dev
  const allQueries = useMemo(() => {
    if (!data?.sense_dev) return [];
    const flattened: EnrichedQuery[] = [];
    const buckets = ["0-5s", "5-10s", "10-15s", "15-20s", "20s+", "empty"] as const;

    Object.entries(data.sense_dev).forEach(([email, userStats]) => {
      buckets.forEach((bucket) => {
        const items = userStats[bucket];
        if (items && Array.isArray(items)) {
          items.forEach((item) => {
            flattened.push({
              ...item,
              userEmail: email,
              bucket
            });
          });
        }
      });
    });

    return flattened;
  }, [data]);

  // 2. Filter Stats
  const userStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allQueries.forEach(q => counts[q.userEmail] = (counts[q.userEmail] || 0) + 1);
    return Object.entries(counts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [allQueries]);

  const bucketStats = useMemo(() => {
    const counts: Record<string, number> = {};
    ["0-5s", "5-10s", "10-15s", "15-20s", "20s+", "empty"].forEach(b => counts[b] = 0);
    allQueries.forEach(q => counts[q.bucket] = (counts[q.bucket] || 0) + 1);
    return Object.entries(counts).map(([value, count]) => ({ value, count }));
  }, [allQueries]);

  const ratingStats = useMemo(() => {
    const counts = { like: 0, dislike: 0, none: 0 };
    allQueries.forEach(q => {
      if (q.rating === "like") counts.like++;
      else if (q.rating === "dislike") counts.dislike++;
      else counts.none++;
    });

    return [
      { value: "like", count: counts.like },
      { value: "dislike", count: counts.dislike },
    ];
  }, [allQueries]);

  // 3. Filtered & Sorted Queries
  const filteredQueries = useMemo(() => {
    let result = allQueries.filter((q) => {
      const matchSearch =
        q.query.toLowerCase().includes(search.toLowerCase()) ||
        (q.query_id || "").toLowerCase().includes(search.toLowerCase());

      const matchUser = selectedUser === "ALL" || q.userEmail === selectedUser;
      const matchBucket = selectedBucket === "ALL" || q.bucket === selectedBucket;
      const matchRating = selectedRating === "ALL" || q.rating === selectedRating;

      return matchSearch && matchUser && matchBucket && matchRating;
    });

    // Sort by Time: Latest First (Primary), then Rating (Secondary)
    result.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      
      if (timeB !== timeA) {
        return timeB - timeA;
      }

      const order = { like: 3, dislike: 2, undefined: 1, null: 1 };
      const scoreA = order[a.rating as keyof typeof order] || 1;
      const scoreB = order[b.rating as keyof typeof order] || 1;
      return scoreB - scoreA;
    });

    return result;
  }, [allQueries, search, selectedUser, selectedBucket, selectedRating]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-card/30 rounded-2xl border border-dashed border-border/50">
        <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
          Waiting for dashboard data
        </div>
        <div className="text-[10px] text-muted-foreground/60 mt-2 italic">
          Please apply filters to load query analytics
        </div>
      </div>
    );
  }

  const listPane = (
    <div className="max-w-none mx-auto py-6 px-5 h-full flex flex-col">
      {/* Premium Header & Filters Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 z-20 relative">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-sm">
            <MessagesSquare size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Query Logs</h2>
            <p className="text-xs text-muted-foreground">Showing {filteredQueries.length} detailed conversation traces</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-indigo-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by query text or ID..."
              className="h-[36px] text-xs pl-9 w-[220px] bg-card/50 backdrop-blur-md border-border/60 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 rounded-xl transition-all shadow-sm"
            />
          </div>

          <div className="w-px h-[20px] bg-border/60 hidden sm:block mx-1" />

          {/* User Filter */}
          <FilterDropdown
            label="User"
            items={userStats}
            activeValue={selectedUser}
            onSelect={setSelectedUser}
            onClear={() => setSelectedUser("ALL")}
            icon={User}
            colorClass="text-blue-500"
            bgClass="bg-blue-500/10"
          />

          {/* Latency Bucket Filter */}
          <FilterDropdown
            label="Latency"
            items={bucketStats}
            activeValue={selectedBucket}
            onSelect={setSelectedBucket}
            onClear={() => setSelectedBucket("ALL")}
            icon={Clock}
            colorClass="text-amber-500"
            bgClass="bg-amber-500/10"
          />

          {/* Rating Filter */}
          <FilterDropdown
            label="Sentiment"
            items={ratingStats}
            activeValue={selectedRating}
            onSelect={(v) => setSelectedRating(v as "ALL" | "like" | "dislike")}
            onClear={() => setSelectedRating("ALL")}
            icon={ThumbsUp}
            colorClass="text-emerald-500"
            bgClass="bg-emerald-500/10"
            align="right"
          />
        </div>
      </div>

      {/* Query List Cards */}
      <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar pr-1 -mr-1">
        {filteredQueries.map((q) => (
          <button
            key={q.ref_id + (q.query_id || '')}
            onClick={() => setSelectedQuery(q)}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-400 group relative overflow-hidden backdrop-blur-sm focus:outline-none ${selectedQuery?.query_id === q.query_id
              ? "bg-indigo-500/10 border-indigo-500/40 shadow-[0_4px_24px_-8px_rgba(99,102,241,0.4)] ring-1 ring-indigo-500/20"
              : "bg-card/40 border-border/50 hover:border-indigo-500/30 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5"
              }`}
          >
            {/* Hover subtle glow */}
            <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500 ${selectedQuery?.query_id === q.query_id ? "bg-indigo-500/20 opacity-100" : "bg-indigo-500/10 opacity-0 group-hover:opacity-100"
              }`} />

            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${selectedQuery?.query_id === q.query_id ? "bg-indigo-500" : "bg-transparent group-hover:bg-indigo-500/40"
              }`} />

            <div className="flex justify-between items-start gap-4 mb-2.5 relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-widest ${q.bucket === "0-5s" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    q.bucket === "20s+" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }`}>
                    {q.bucket}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-muted-foreground/60 truncate uppercase px-1.5 py-0.5 bg-background/50 rounded border border-border/40">
                    {q.query_id}
                  </span>
                </div>

                <div className="text-sm font-medium text-foreground leading-relaxed line-clamp-2 pr-6">
                  {q.query}
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                {q.rating === "like" && (
                  <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/20">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                )}
                {q.rating === "dislike" && (
                  <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-500 shadow-sm border border-rose-500/20">
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground relative z-10">
              <span className="flex items-center gap-1.5 font-medium truncate max-w-[180px]">
                <User size={12} className="opacity-60" />
                {q.userEmail}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar size={12} className="opacity-60" />
                {q.created_at ? new Date(q.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const detailConfig = selectedQuery ? {
    header: (
      <div className="flex items-start gap-3 px-5 py-3.5 relative overflow-hidden bg-card border-b border-border shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-3xl rounded-full" />

        <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex flex-shrink-0 items-center justify-center text-indigo-500 mt-0.5">
          <Activity size={14} />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1.5 text-[10px]">
            <span className="font-mono font-bold text-indigo-500 uppercase tracking-widest">{selectedQuery.query_id || "UNKNOWN"}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1 text-muted-foreground"><User className="w-3 h-3 text-blue-500" /> {selectedQuery.userEmail}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3 text-amber-500" /> {selectedQuery.bucket}</span>
            {selectedQuery.rating && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className={`flex items-center gap-1 ${selectedQuery.rating === 'like' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {selectedQuery.rating === 'like' ? <ThumbsUp className="w-3 h-3" /> : <ThumbsDown className="w-3 h-3" />}
                  {selectedQuery.rating === 'like' ? 'Positive' : 'Negative'}
                </span>
              </>
            )}
          </div>
          <p className="text-[13px] font-semibold leading-snug text-foreground break-words pr-6">
            {selectedQuery.query}
          </p>
        </div>
        <button
          onClick={() => setSelectedQuery(null)}
          className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group z-10 bg-background/50 border border-border/50 shadow-sm"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    ),
    body: (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 p-1 pb-6 mt-2">
        {/* Response Data Card */}
        <div className="p-4 bg-card border border-border/60 rounded-xl relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <MessagesSquare className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assistant Response</span>
          </div>
          <div className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-wrap break-words border-l-[3px] border-primary/40 pl-3 ml-1 relative z-10 custom-scrollbar max-h-[300px] overflow-y-auto">
            {selectedQuery.response_data || <span className="italic text-muted-foreground">No response generated.</span>}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/60 border border-border/50 rounded-xl p-3.5 flex flex-col gap-1.5 hover:bg-secondary/80 transition-colors">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
              <Calendar size={12} className="text-blue-500" /> Session Date
            </span>
            <span className="text-[13px] font-semibold text-foreground">
              {selectedQuery.created_at ? new Date(selectedQuery.created_at).toLocaleString() : "Unknown"}
            </span>
          </div>
          <div className="bg-secondary/60 border border-border/50 rounded-xl p-3.5 flex flex-col gap-1.5 hover:bg-secondary/80 transition-colors">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1.5">
              <Activity size={12} className="text-amber-500" /> Execution Time
            </span>
            <span className="text-[13px] font-semibold text-foreground">
              {selectedQuery.elapsed_s != null ? `${selectedQuery.elapsed_s} seconds` : "-"}
            </span>
          </div>
        </div>

        {/* User Feedback Comment */}
        {selectedQuery.comment && (
          <div className="p-4 bg-gradient-to-br from-rose-500/5 to-orange-500/5 border border-rose-500/20 rounded-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Search className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600/80">User Commentary</span>
            </div>
            <div className="text-[13px] italic text-muted-foreground pl-1">
              "{selectedQuery.comment}"
            </div>
          </div>
        )}

        {/* Technical Trace Data */}
        <div className="p-4 bg-card border border-border/60 rounded-xl mt-4 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Technical Trace</span>
          </div>
          
          <div className="px-1">
            {selectedQuery.module_outputs && typeof selectedQuery.module_outputs === "object" ? (
              <SectionBlock label="Module Outputs" defaultOpen={false}>
                {Object.entries(selectedQuery.module_outputs).map(([key, val]) => (
                  <FieldBlock key={`mod-${key}`} label={key} value={val} defaultOpen={false} />
                ))}
              </SectionBlock>
            ) : (
              <FieldBlock label="Module Outputs" value={selectedQuery.module_outputs} defaultOpen={false} />
            )}
            
            {selectedQuery.metadata && typeof selectedQuery.metadata === "object" ? (
              <SectionBlock label="Meta Data" defaultOpen={false}>
                {Object.entries(selectedQuery.metadata).map(([key, val]) => (
                  <FieldBlock key={`meta-${key}`} label={key} value={val} defaultOpen={false} />
                ))}
              </SectionBlock>
            ) : (
              <FieldBlock label="Meta Data" value={selectedQuery.metadata} defaultOpen={false} />
            )}
          </div>
        </div>
      </div>
    )
  } : null;

  return (
    <div className="flex flex-col flex-1 min-h-0 -m-5 bg-card/20 rounded-xl overflow-hidden mt-2 border border-border/30">
      <SplitPanelWrapper listPane={listPane} detail={detailConfig} />
    </div>
  );
};

export default QueryAnalytics;