import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, ChartBar as BarChart3, BookOpen, ShieldCheck, FileCheck, TriangleAlert as AlertTriangle, FileX } from "lucide-react";
import type { Insights } from "./types";
import { CHART_COLORS } from "./types";

interface OverviewTabProps {
  insights: Insights;
}

const OverviewTab = ({ insights }: OverviewTabProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 pl-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-blue-500/20 to-blue-500/5 border border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Activity size={16} className="drop-shadow-md" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Key Metrics</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Overview of generated guidelines and confidence scores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Rules */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blue-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Total Rules</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-blue-500">
                <BookOpen size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-blue-500">{insights.totalRules}</div>
              <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">guidelines extracted</span>
            </div>
          </div>

          {/* Avg Confidence */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-emerald-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Avg Confidence</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-emerald-500">
                <ShieldCheck size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-emerald-500">
                {(insights.avgConfidence * 100).toFixed(0)}%
              </div>
              <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">average score</span>
            </div>
          </div>

          {/* Ready to Integrate */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-teal-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Ready to Integrate</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-teal-500">
                <FileCheck size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-teal-500">{insights.readyToIntegrate}</div>
              <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">full confidence</span>
            </div>
          </div>

          {/* Needs Review */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-amber-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Needs Review</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-amber-500">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-amber-500">{insights.needsReview}</div>
              <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">partial confidence</span>
            </div>
          </div>

          {/* Incomplete */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-rose-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Incomplete</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-rose-500">
                <FileX size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-rose-500">{insights.incomplete}</div>
              <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">needs data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3 pl-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <BarChart3 size={16} className="drop-shadow-md" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Distribution Analysis</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">Guideline breakdown by type and confidence category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rule Type Distribution */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Guideline Distribution by Type
            </div>
            {insights.ruleTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={insights.ruleTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={130} />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{ fontSize: 11, background: "rgba(255, 255, 255, 0.95)", border: "1px solid hsl(var(--border))", borderRadius: "8px", backdropFilter: "blur(8px)", color: "#111827" }}
                    itemStyle={{ color: "#111827" }}
                  />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {insights.ruleTypeData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted-foreground py-8 text-center">No data available</div>
            )}
          </div>

          {/* Confidence Category Distribution */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Distribution by Confidence Type
            </div>
            {insights.confidenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={insights.confidenceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={130} />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                    contentStyle={{ fontSize: 11, background: "rgba(255, 255, 255, 0.95)", border: "1px solid hsl(var(--border))", borderRadius: "8px", backdropFilter: "blur(8px)", color: "#111827" }}
                    itemStyle={{ color: "#111827" }}
                  />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {insights.confidenceData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-muted-foreground py-8 text-center">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
