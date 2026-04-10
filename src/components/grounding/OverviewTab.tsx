import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { MessageSquareText, Database, Tags, Link2, Box, Bookmark, Activity, BarChart3, DatabaseZap } from "lucide-react";
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

const Section = ({ icon: Icon, title, description, color, children }: { icon: any, title: string, description: string, color?: string, children: React.ReactNode }) => {
  const c = color || "indigo";
  return (
    <div className="flex flex-col relative before:absolute before:-inset-4 before:bg-card/20 before:rounded-3xl before:border before:border-border/30 before:-z-10 z-0 mb-14">
      <div className="flex items-center gap-3 mb-5 pl-1">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-${c}-500/20 to-${c}-500/5 border border-${c}-500/20 text-${c}-500 shadow-[0_0_15px_rgba(var(--${c}-rgb),0.2)]`}>
          <Icon size={16} className="drop-shadow-md" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">{title}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

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
    { label: "Total Queries", value: queries.length, sub: "query records", colorClass: "text-blue-500", gradientClass: "bg-blue-500", icon: MessageSquareText },
    { label: "Total Knowledges", value: knowledges.length, sub: "knowledge records", colorClass: "text-teal-500", gradientClass: "bg-teal-500", icon: Database },
    { label: "Total Tags", value: Object.keys(tagCounts).length, sub: "query intent tags", colorClass: "text-emerald-500", gradientClass: "bg-emerald-500", icon: Tags },
    { label: "Knowledges Attached", value: uniqueKnowledgeTagged, sub: "refs in queries", colorClass: "text-rose-500", gradientClass: "bg-rose-500", icon: Link2 },
    { label: "Knowledge Types", value: Object.keys(knowledgeTypes).length, sub: "unique record types", colorClass: "text-violet-500", gradientClass: "bg-violet-500", icon: Box },
    { label: "API Tags Used", value: Object.keys(knowledgeTags).length, sub: "knowledge api tags", colorClass: "text-amber-500", gradientClass: "bg-amber-500", icon: Bookmark },
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
      <div className="max-w-none mx-auto py-8 px-8">
  
      {/* Metrics Section */}
      <Section icon={Activity} title="Key Performance Metrics" description="Overview of platform engagement, query totals, and knowledge grounding." color="blue">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
                <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${m.gradientClass}`} />
                
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold max-w-[120px] leading-tight break-words">{m.label}</div>
                  <div className={`p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md flex-shrink-0 ${m.colorClass}`}>
                    <Icon size={14} />
                  </div>
                </div>
                
                <div className="relative z-10 mt-3">
                   <div className={`text-4xl font-extrabold tracking-tight mb-2 opacity-90 ${m.colorClass}`}>{m.value}</div>
                   <div className="flex flex-col gap-2">
                     <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground flex items-center gap-1">
                        {m.sub}
                     </span>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Query Analytics Section */}
      <Section icon={BarChart3} title="Query Trends & Distribution" description="Deep dive into query tags, intents, and knowledge grounding intersections." color="indigo">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Query distribution by tag</div>
            {tagChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={tagChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
                  <Tooltip 
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{ fontSize: 11, background: "rgba(255, 255, 255, 0.95)", border: "1px solid hsl(var(--border))", borderRadius: "8px", backdropFilter: "blur(8px)", color: "#111827" }} 
                    itemStyle={{ color: "#111827" }}
                  />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {tagChartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-xs text-muted-foreground py-8 text-center">No tag data</div>}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Queries by knowledge count</div>
            {kBucketData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kBucketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{ fontSize: 11, background: "rgba(255, 255, 255, 0.95)", border: "1px solid hsl(var(--border))", borderRadius: "8px", backdropFilter: "blur(8px)", color: "#111827" }} 
                    itemStyle={{ color: "#111827" }}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {kBucketData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-xs text-muted-foreground py-8 text-center">No knowledge data</div>}
          </div>
        </div>
      </Section>

      {/* Knowledge Charts */}
      {knowledges.length > 0 && (
        <Section icon={DatabaseZap} title="Knowledge Analytics" description="Usage statistics and distribution mapping of internal database sources." color="teal">
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Knowledge distribution by tag</div>
                {apiTagData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={apiTagData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={100} />
                      <Tooltip 
                        cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                        contentStyle={{ fontSize: 11, background: "rgba(255, 255, 255, 0.95)", border: "1px solid hsl(var(--border))", borderRadius: "8px", backdropFilter: "blur(8px)", color: "#111827" }} 
                        itemStyle={{ color: "#111827" }}
                      />
                      <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                        {apiTagData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="text-xs text-muted-foreground py-8 text-center">No API tag data</div>}
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">Knowledge by type</div>
                {typeEntries.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {typeEntries.map(([type, cnt]) => (
                      <div key={type} className="flex items-center gap-3 py-1.5 group">
                        <span className="text-[12px] font-medium text-foreground/80 w-[140px] truncate">{type}</span>
                        <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                          <div className="h-full bg-teal-400 rounded opacity-60 group-hover:opacity-100 transition-opacity" style={{ width: `${(cnt / typeMax * 100).toFixed(1)}%` }} />
                        </div>
                        <span className="text-[12px] font-mono font-semibold text-muted-foreground min-w-[24px] text-right">{cnt}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-xs text-muted-foreground py-8 text-center">No type data</div>}
              </div>
            </div>

            {/* Knowledge usage */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-3">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Knowledge usage mapping</div>
              <div className="text-[11px] text-muted-foreground mb-4">Jump directly to individual knowledge nodes or matching queries.</div>
              {kidEntries.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {kidEntries.map(([kid, cnt]) => (
                    <div
                      key={kid}
                      className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border/50 transition-all group"
                    >
                      <span className="text-[12px] font-medium text-muted-foreground w-[260px] truncate group-hover:text-foreground transition-colors" title={kid}>
                        {getKnowledgeName(kid)}
                      </span>
                      <div className="flex-1 h-2 bg-secondary rounded overflow-hidden">
                        <div className="h-full bg-primary rounded opacity-50 group-hover:opacity-80 transition-opacity" style={{ width: `${(cnt / kidMax * 100).toFixed(1)}%` }} />
                      </div>
                      <span className="text-[12px] font-mono font-semibold text-muted-foreground min-w-[20px] text-right">{cnt}</span>
                      <div className="flex items-center gap-2 ml-4 transition-all duration-300">
                        <button onClick={() => onDrillToQueries(kid)} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 transition-all hover:bg-blue-500 hover:text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.3)]">Queries</button>
                        <button onClick={() => onDrillToKnowledge(kid)} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-500 transition-all hover:bg-teal-500 hover:text-white hover:shadow-[0_0_12px_rgba(20,184,166,0.3)]">Knowledge</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-muted-foreground py-8 text-center">No knowledge IDs found</div>}
            </div>
          </>
        </Section>
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
