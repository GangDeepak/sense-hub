import { Badge } from "@/components/ui/badge";
import { X, FileSearch, Quote, FileText, Hash, Layers, ShieldCheck, CircleAlert as AlertCircle, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GeneratedRule, DetailPanelConfig, RuleThreshold } from "./types";
import { getConfidenceScore } from "./types";

interface GuidelineDetailProps {
  rule: GeneratedRule;
  baseRule?: GeneratedRule | null;
  onClose: () => void;
}

const formatLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const formatThresholdValue = (value: unknown) => {
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
};

const thresholdToMarkdown = (threshold?: RuleThreshold[] | string) => {
  if (!threshold) return "";
  if (typeof threshold === "string") return threshold;
  if (!Array.isArray(threshold) || threshold.length === 0) return "";

  const columns = Array.from(
    new Set(threshold.flatMap((row) => Object.keys(row)))
  );

  const escapeCell = (value: unknown) => formatThresholdValue(value).replace(/\|/g, "\\|").replace(/\n/g, "<br />");
  const header = `| ${columns.map(formatLabel).join(" | ")} |`;
  const divider = `| ${columns.map(() => "---").join(" | ")} |`;
  const rows = threshold.map((row) => `| ${columns.map((column) => escapeCell(row[column])).join(" | ")} |`);

  return [header, divider, ...rows].join("\n");
};

const MarkdownTable = ({ markdown }: { markdown: string }) => (
  <div className="overflow-x-auto rounded-lg border border-border/50">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: ({ children }) => (
          <table className="w-full min-w-[520px] border-collapse text-xs">
            {children}
          </table>
        ),
        thead: ({ children }) => <thead className="bg-secondary/70">{children}</thead>,
        th: ({ children }) => (
          <th className="border-b border-r border-border/50 px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground last:border-r-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border-b border-r border-border/40 px-3 py-2 align-top text-foreground last:border-r-0">
            {children}
          </td>
        ),
        tr: ({ children }) => <tr className="last:[&>td]:border-b-0">{children}</tr>,
        p: ({ children }) => <>{children}</>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  </div>
);

const ScoreText = ({ label, score }: { label: string; score: number }) => (
  <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-1 text-lg font-bold text-foreground">{(score * 100).toFixed(0)}%</div>
  </div>
);

const GuidelineDetail = ({ rule, baseRule, onClose }: GuidelineDetailProps) => {
  const thresholdMarkdown = thresholdToMarkdown(rule.rule_description?.threshold);
  const score = getConfidenceScore(rule);
  const baseScore = getConfidenceScore(baseRule);
  const hasComparison = !!baseRule;

  return {
    header: (
      <div className="flex items-center gap-3 px-5 py-3.5 relative overflow-hidden bg-card border-b border-border shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary relative z-10">
          <BookOpen size={16} />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-[14px] font-semibold text-foreground leading-none break-words pr-2">
              {rule.rule_name}
            </p>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase tracking-wider ${rule.rule_type === "triage"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-600"
                }`}
            >
              {rule.rule_type}
            </Badge>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors group bg-background/50 border border-border/50 shadow-sm flex-shrink-0 relative z-10"
          title="Close panel"
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    ),
    body: (
      <div className="space-y-1 py-2 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="px-2 mb-4">
          {hasComparison && (
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-secondary/20">
                <ShieldCheck size={12} className="text-emerald-500" />
                Glossary Comparison
              </div>
              <div className="px-3 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ScoreText label="Before Glossary" score={baseScore} />
                  <ScoreText label="After Glossary" score={score} />
                </div>
                <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm">
                  Confidence boost: <span className="font-bold text-emerald-600">{score - baseScore >= 0 ? "+" : ""}{((score - baseScore) * 100).toFixed(0)}%</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Before Glossary</div>
                    <p className="text-sm text-foreground leading-relaxed">{baseRule?.short_description}</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 mb-1">After Glossary</div>
                    <p className="text-sm text-foreground leading-relaxed">{rule.short_description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confidence Card */}
          {rule.confidence && (
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-secondary/20">
                <ShieldCheck size={12} className="text-sky-500" />
                Confidence
              </div>
              <div className="px-2 pb-2">
                <div className="py-3 border-b border-border/60">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                    Category
                  </label>
                  <Badge variant="outline" className="text-[10px] font-semibold capitalize">
                    {rule.confidence.category.replace(/_/g, ' ')}
                  </Badge>
                </div>

                <div className="py-3 border-b border-border/60">
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                    Score
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${score >= 0.9
                            ? "bg-emerald-500"
                            : score >= 0.7
                              ? "bg-sky-500"
                              : score >= 0.5
                                ? "bg-amber-500"
                                : "bg-destructive"
                          }`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-mono font-bold ${score >= 0.9
                        ? "text-emerald-500"
                        : score >= 0.7
                          ? "text-sky-500"
                          : score >= 0.5
                            ? "text-amber-500"
                            : "text-destructive"
                      }`}>
                      {hasComparison ? `${(baseScore * 100).toFixed(0)}% -> ${(score * 100).toFixed(0)}%` : `${(score * 100).toFixed(0)}%`}
                    </span>
                  </div>
                </div>

                <div className="py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Confidence Rationale
                    </label>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {rule.confidence.reason_and_steps_to_boost}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rule Details Card */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-secondary/20">
              <FileSearch size={12} className="text-primary" />
              Rule Details
            </div>
            <div className="px-2 pb-2">
              <div className="py-3 border-b border-border/60">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Rule Name
                </label>
                <p className="text-sm text-foreground font-medium">
                  {rule.rule_name}
                </p>
              </div>

              <div className="py-3 border-b border-border/60">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Rule Type
                </label>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase tracking-wider ${rule.rule_type === "triage"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-600"
                    }`}
                >
                  {rule.rule_type}
                </Badge>
              </div>

              <div className="py-3 border-b border-border/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Quote className="w-3 h-3 text-muted-foreground" />
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Definition
                  </label>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {rule.definition}
                </p>
              </div>

              <div className="py-3 border-b border-border/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    Short Description
                  </label>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {rule.short_description}
                </p>
              </div>

              {rule.source_citation && (
                <div className="py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Hash className="w-3 h-3 text-muted-foreground" />
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Source Citation
                    </label>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/40">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Page:</span>
                    <span className="text-xs font-medium text-foreground">
                      {rule.source_citation.page_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rule Description Card */}
          {rule.rule_description && (
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm mb-4">
              <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-secondary/20">
                <Layers size={12} className="text-emerald-500" />
                Rule Description
              </div>
              <div className="px-3 py-3">
                <p className="text-sm text-foreground leading-relaxed">
                  {rule.rule_description.description}
                </p>
              </div>

              {thresholdMarkdown && (
                <div className="border-t border-border/40">
                  <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-muted/30">
                    <Layers size={12} className="text-muted-foreground" />
                    Threshold
                  </div>
                  <div className="px-3 py-3">
                    <MarkdownTable markdown={thresholdMarkdown} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    ),
  } as DetailPanelConfig;
};

export default GuidelineDetail;
