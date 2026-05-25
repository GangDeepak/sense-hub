import { useMemo } from "react";
import {
  Activity,
  BookOpen,
  ShieldCheck,
  FileCheck,
  TriangleAlert as AlertTriangle,
  FileX,
  Eye,
} from "lucide-react";
import type { Insights, GeneratedRule, GuidelineFilter } from "./types";
import { CHART_COLORS, RULE_TYPES, CONFIDENCE_CATEGORIES } from "./types";

interface OverviewTabProps {
  insights: Insights;
  baseInsights?: Insights | null;
  rules: GeneratedRule[];
  onViewRules: (filter: GuidelineFilter | null) => void;
}

interface DistributionRowProps {
  name: string;
  value: string;
  count: number;
  maxCount: number;
  color: string;
  filterKind: GuidelineFilter["kind"];
  onViewRules: (filter: GuidelineFilter | null) => void;
}

const DistributionRow = ({
  name,
  value,
  count,
  maxCount,
  color,
  filterKind,
  onViewRules
}: DistributionRowProps) => {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border/50 transition-all group sm:flex-nowrap">
      <span className="text-[12px] font-medium text-muted-foreground w-full truncate group-hover:text-foreground transition-colors sm:w-[220px]" title={name}>
        {name}
      </span>
      <div className="min-w-[140px] flex-1 h-2 bg-secondary rounded overflow-hidden">
        <div
          className="h-full rounded opacity-60 group-hover:opacity-90 transition-all"
          style={{ width: `${percentage.toFixed(1)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] font-mono font-semibold text-muted-foreground min-w-[24px] text-right">{count}</span>
      <div className="flex items-center gap-2 ml-auto transition-all duration-300 sm:ml-4">
        <button
          type="button"
          onClick={() => onViewRules({ kind: filterKind, value, label: name })}
          className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-500 transition-all hover:bg-blue-500 hover:text-white hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:pointer-events-none"
          disabled={count === 0}
        >
          <Eye size={11} />
          View
        </button>
      </div>
    </div>
  );
};

const ComparisonLine = ({ before, after, suffix = "" }: { before: number | string; after: number | string; suffix?: string }) => (
  <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
    <span>Before: <span className="font-bold text-foreground">{before}{suffix}</span></span>
    <span>After: <span className="font-bold text-foreground">{after}{suffix}</span></span>
  </div>
);

const OverviewTab = ({ insights, baseInsights, rules, onViewRules }: OverviewTabProps) => {
  const hasComparison = !!baseInsights;
  const confidenceBoost = baseInsights ? insights.avgConfidence - baseInsights.avgConfidence : 0;

  // Compute Rule Type Distribution stats with every known type represented.
  const ruleTypeStats = useMemo(() => {
    return RULE_TYPES.map((type, idx) => {
      const count = rules.filter((rule) => rule.rule_type.toLowerCase().trim() === type.toLowerCase().trim()).length;

      return {
        type,
        formattedName: type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        count,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
  }, [rules]);

  // Compute Confidence Category stats with every known category represented.
  const confidenceStats = useMemo(() => {
    return CONFIDENCE_CATEGORIES.map((cat, idx) => {
      const count = rules.filter((rule) => rule.confidence?.category.toLowerCase().trim() === cat.toLowerCase().trim()).length;

      return {
        category: cat,
        formattedName: cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        count,
        color: CHART_COLORS[(idx + 3) % CHART_COLORS.length],
      };
    });
  }, [rules]);

  const maxRuleTypeCount = Math.max(...ruleTypeStats.map((stat) => stat.count), 1);
  const maxConfidenceCount = Math.max(...confidenceStats.map((stat) => stat.count), 1);

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
          <button
            type="button"
            onClick={() => onViewRules(null)}
            className="text-left bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
          >
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
          </button>

          {/* Avg Confidence */}
          <button
            type="button"
            onClick={() => onViewRules(null)}
            className="text-left bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
          >
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
              {hasComparison && baseInsights ? (
                <>
                  <ComparisonLine
                    before={(baseInsights.avgConfidence * 100).toFixed(0)}
                    after={(insights.avgConfidence * 100).toFixed(0)}
                    suffix="%"
                  />
                  <span className={`mt-2 block text-[10px] tracking-wider uppercase font-bold ${confidenceBoost >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                    Boost {confidenceBoost >= 0 ? "+" : ""}{(confidenceBoost * 100).toFixed(0)}%
                  </span>
                </>
              ) : (
                <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">average score</span>
              )}
            </div>
          </button>

          {/* Ready to Integrate */}
          <button
            type="button"
            onClick={() => onViewRules({ kind: "confidence_bucket", value: "ready_to_integrate", label: "Ready to Integrate" })}
            className="text-left bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-teal-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Ready to Integrate</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-teal-500">
                <FileCheck size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-teal-500">{insights.readyToIntegrate}</div>
              {hasComparison && baseInsights ? (
                <ComparisonLine before={baseInsights.readyToIntegrate} after={insights.readyToIntegrate} />
              ) : (
                <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">full confidence</span>
              )}
            </div>
          </button>

          {/* Needs Review */}
          <button
            type="button"
            onClick={() => onViewRules({ kind: "confidence_bucket", value: "needs_review", label: "Needs Review" })}
            className="text-left bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-amber-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Needs Review</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-amber-500">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-amber-500">{insights.needsReview}</div>
              {hasComparison && baseInsights ? (
                <ComparisonLine before={baseInsights.needsReview} after={insights.needsReview} />
              ) : (
                <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">partial confidence</span>
              )}
            </div>
          </button>

          {/* Incomplete */}
          <button
            type="button"
            onClick={() => onViewRules({ kind: "confidence_bucket", value: "incomplete", label: "Incomplete" })}
            className="text-left bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-rose-500" />
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Incomplete</div>
              <div className="p-1.5 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md text-rose-500">
                <FileX size={14} />
              </div>
            </div>
            <div className="relative z-10 mt-3">
              <div className="text-4xl font-extrabold tracking-tight mb-2 opacity-90 text-rose-500">{insights.incomplete}</div>
              {hasComparison && baseInsights ? (
                <ComparisonLine before={baseInsights.incomplete} after={insights.incomplete} />
              ) : (
                <span className="text-[10px] tracking-wider uppercase font-medium text-muted-foreground">needs data</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Two Overlaid Custom Breakdown Tables (Stacked vertically) */}
      <div className="flex flex-col gap-6">

        {/* Rule Type Distribution */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/40">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rule Type Distribution</h3>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <BookOpen size={14} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground mb-3">View generated guidelines by rule type.</div>
            <div className="flex flex-col gap-1.5">
              {ruleTypeStats.map((stat) => (
                <DistributionRow
                  key={stat.type}
                  name={stat.formattedName}
                  value={stat.type}
                  count={stat.count}
                  maxCount={maxRuleTypeCount}
                  color={stat.color}
                  filterKind="rule_type"
                  onViewRules={onViewRules}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Category Breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/40">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confidence Breakdown</h3>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck size={14} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] text-muted-foreground mb-3">View generated guidelines by confidence category.</div>
            <div className="flex flex-col gap-1.5">
              {confidenceStats.map((stat) => (
                <DistributionRow
                  key={stat.category}
                  name={stat.formattedName}
                  value={stat.category}
                  count={stat.count}
                  maxCount={maxConfidenceCount}
                  color={stat.color}
                  filterKind="confidence_category"
                  onViewRules={onViewRules}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OverviewTab;
