import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { QueryRecord, KnowledgeRecord } from "./types";
import { countItems } from "./types";

const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a78bfa", "#f87171", "#ec4899", "#38bdf8", "#fb923c"];

interface OverviewTabProps {
  queries: QueryRecord[];
  knowledges: KnowledgeRecord[];
  queryCollection: string;
  knowledgeCollection: string;
  queryCount: number;
  knowledgeCount: number;
  loading: boolean;
  error: string | null;
  onSwitchTab: (tab: string) => void;
  onDrillToKnowledge: (kid: string) => void;
  onDrillToQueries: (kid: string) => void;
}

const OverviewTab = ({
  queries, knowledges, queryCollection, knowledgeCollection,
  queryCount, knowledgeCount, loading, error, onSwitchTab, onDrillToKnowledge, onDrillToQueries,
}: OverviewTabProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="w-7 h-7 border-2 border-border border-t-primary rounded-full animate-spin" />
        <div className="text-sm font-mono text-muted-foreground">Loading…</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3.5">
        <div className="text-sm font-mono text-destructive">Could not load data</div>
        <div className="text-xs font-mono text-muted-foreground text-center max-w-[340px]">{error}</div>
      </div>
    );
  }

  const allTags = queries.flatMap((d) => d.intent_tags || []);
  const tagCounts = countItems(allTags);
  const allKids = queries.flatMap((d) => d.knowledge_ids || []);
  const uniqueKnowledgeTagged = new Set(allKids).size;
  const knowledgeTypes = countItems(knowledges.map((d) => d.type).filter(Boolean) as string[]);
  const knowledgeTags = countItems(knowledges.flatMap((d) => d.api_tags || []));

  const metrics = [
    { label: "Total Queries", value: queries.length, sub: "query records", color: "from-blue-600/20 to-blue-400/5", text: "text-blue-400" },
    { label: "Total Knowledges", value: knowledges.length, sub: "knowledge records", color: "from-teal-600/20 to-teal-400/5", text: "text-teal-400" },
    { label: "Total Tags", value: Object.keys(tagCounts).length, sub: "query intent tags", color: "from-emerald-600/20 to-emerald-400/5", text: "text-emerald-400" },
    { label: "Knowledges Tagged To Query", value: uniqueKnowledgeTagged, sub: "knowledge refs in queries", color: "from-rose-600/20 to-rose-400/5", text: "text-rose-400" },
    { label: "Knowledge Types", value: Object.keys(knowledgeTypes).length, sub: "unique knowledge types", color: "from-violet-600/20 to-violet-400/5", text: "text-violet-400" },
    { label: "Tags Tagged to Knowledge", value: Object.keys(knowledgeTags).length, sub: "knowledge api tags", color: "from-amber-600/20 to-amber-400/5", text: "text-amber-400" },
  ];

  // Tag chart data
  const tagEntries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const tagChartData = tagEntries.map(([name, value]) => ({ name, value }));

  // Knowledge count buckets
  const knowledgeBuckets: Record<number, number> = {};
  queries.forEach((d) => { const n = (d.knowledge || []).length; knowledgeBuckets[n] = (knowledgeBuckets[n] || 0) + 1; });
  const kBucketData = Object.entries(knowledgeBuckets)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([k, v]) => ({ name: `${k} knowledge`, value: v }));

  // Knowledge type chart
  const typeEntries = Object.entries(knowledgeTypes).sort((a, b) => b[1] - a[1]);
  const typeMax = typeEntries[0]?.[1] || 1;

  // API tag doughnut
  const apiTagEntries = Object.entries(knowledgeTags).sort((a, b) => b[1] - a[1]);
  const apiTagData = apiTagEntries.map(([name, value]) => ({ name, value }));

  // Knowledge usage
  const kidMap: Record<string, number> = {};
  queries.forEach((d) => { (d.knowledge_ids || []).forEach((k) => { kidMap[k] = (kidMap[k] || 0) + 1; }); });
  const kidEntries = Object.entries(kidMap).sort((a, b) => b[1] - a[1]);
  const kidMax = kidEntries[0]?.[1] || 1;

  const getKnowledgeName = (kid: string) => {
    const found = knowledges.find((d) => (d.knowledge_id || d._doc_id || "") === kid);
    return found?.name || kid;
  };

  return (
    <div className="h-full overflow-y-auto w-full">
      <div className="max-w-none mx-auto py-8 px-4">
  
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className={`bg-gradient-to-br ${m.color} border border-white/5 shadow-lg backdrop-blur-sm rounded-xl p-4 flex flex-col gap-2 hover:scale-[1.02] transition-all duration-300`}>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{m.label}</div>
            <div className={`text-3xl font-semibold tracking-tight ${m.text}`}>{m.value}</div>
            <div className="text-[10px] font-mono text-muted-foreground/60">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Query distribution by tag</div>
          {tagChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={tagChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {tagChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-xs text-muted-foreground py-8 text-center">No tag data</div>}
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Queries by knowledge count</div>
          {kBucketData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kBucketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {kBucketData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="text-xs text-muted-foreground py-8 text-center">No knowledge data</div>}
        </div>
      </div>

      {/* Knowledge Charts */}
      {knowledges.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Knowledge distribution by tag</div>
              {apiTagData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={apiTagData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip contentStyle={{ fontSize: 11, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                      {apiTagData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="text-xs text-muted-foreground py-8 text-center">No API tag data</div>}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-4">Knowledge by type</div>
              {typeEntries.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {typeEntries.map(([type, cnt]) => (
                    <div key={type} className="flex items-center gap-2.5 py-1 group">
                      <span className="text-[11px] font-mono text-muted-foreground w-[140px] truncate">{type}</span>
                      <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                        <div className="h-full bg-teal-400 rounded opacity-60 group-hover:opacity-100 transition-opacity" style={{ width: `${(cnt / typeMax * 100).toFixed(1)}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground min-w-[24px] text-right">{cnt}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-muted-foreground py-8 text-center">No type data</div>}
            </div>
          </div>

          {/* Knowledge usage */}
          <div className="bg-card border border-border rounded-lg p-4 mb-3">
            <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Knowledge usage</div>
            <div className="text-[11px] font-mono text-muted-foreground mb-4">click a row to view in Knowledges tab</div>
            {kidEntries.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {kidEntries.map(([kid, cnt]) => (
                  <div
                    key={kid}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors group"
                  >
                    <span className="text-[11px] font-mono text-muted-foreground w-[260px] truncate group-hover:text-foreground transition-colors" title={kid}>
                      {getKnowledgeName(kid)}
                    </span>
                    <div className="flex-1 h-[7px] bg-secondary rounded overflow-hidden">
                      <div className="h-full bg-primary rounded opacity-50 group-hover:opacity-80 transition-opacity" style={{ width: `${(cnt / kidMax * 100).toFixed(1)}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground min-w-[20px] text-right">{cnt}</span>
                    <div className="flex items-center gap-1.5 ml-2 transition-all duration-300">
                      <button onClick={() => onDrillToQueries(kid)} className="text-[9px] font-mono px-2 py-1 rounded-md bg-blue-400/10 border border-blue-400/20 text-blue-400 transition-all hover:bg-blue-400 hover:text-white hover:shadow-[0_0_12px_rgba(96,165,250,0.5)]">Queries</button>
                      <button onClick={() => onDrillToKnowledge(kid)} className="text-[9px] font-mono px-2 py-1 rounded-md bg-teal-400/10 border border-teal-400/20 text-teal-400 transition-all hover:bg-teal-400 hover:text-white hover:shadow-[0_0_12px_rgba(45,212,191,0.5)]">Knowledge</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="text-xs text-muted-foreground py-8 text-center">No knowledge IDs found</div>}
          </div>
        </>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-end gap-2.5 mt-3">
        <button onClick={() => onSwitchTab("queries")} className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 rounded px-3 py-1.5 hover:opacity-80 transition-opacity">
          Browse all queries →
        </button>
        <button onClick={() => onSwitchTab("knowledges")} className="text-xs font-mono text-teal-400 bg-teal-400/10 border border-teal-400/30 rounded px-3 py-1.5 hover:opacity-80 transition-opacity">
          Browse all knowledges →
        </button>
      </div>
    </div>
    </div>
  );
};

export default OverviewTab;
