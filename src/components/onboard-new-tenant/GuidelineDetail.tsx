import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FileSearch, Quote, FileText, Hash, Layers, ShieldCheck, CircleAlert as AlertCircle, BookOpen } from "lucide-react";
import type { GeneratedRule, DetailPanelConfig } from "./types";

interface GuidelineDetailProps {
  rule: GeneratedRule;
  ruleIndex: number;
  onClose: () => void;
}

const GuidelineDetail = ({ rule, ruleIndex, onClose }: GuidelineDetailProps) => {
  return {
    header: (
      <div className="flex items-start gap-3 px-5 py-3.5 relative overflow-hidden bg-card border-b border-border shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-3xl rounded-full pointer-events-none" />

        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center text-primary mt-0.5 relative z-10">
          <BookOpen size={16} />
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center flex-wrap gap-2 mb-1.5">
            <span className="font-mono font-bold text-primary uppercase tracking-wider text-xs">
              Rule #{ruleIndex + 1}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                rule.rule_type === "triage"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-600"
              }`}
            >
              {rule.rule_type}
            </Badge>
          </div>
          <p className="text-[14px] font-semibold text-foreground leading-snug break-words pr-6">
            {rule.rule_name}
          </p>
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
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    rule.rule_type === "triage"
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

              {rule.rule_description.threshold && rule.rule_description.threshold.length > 0 && (
                <div className="border-t border-border/40">
                  <div className="px-3 pt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2 bg-muted/30">
                    <Layers size={12} className="text-muted-foreground" />
                    Thresholds ({rule.rule_description.threshold.length})
                  </div>
                  <ScrollArea className="max-h-[300px]">
                    <div className="px-2 pb-2 space-y-2 pt-2">
                      {rule.rule_description.threshold.map((t, idx) => (
                        <div key={idx} className="bg-muted/30 rounded-lg p-3 border border-border/40 text-xs">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            {Object.entries(t).map(([key, value]) => (
                              <div key={key} className="col-span-2 sm:col-span-1">
                                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block mb-0.5">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                {Array.isArray(value) ? (
                                  <div className="flex flex-wrap gap-1">
                                    {value.map((v, i) => (
                                      <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                        {String(v)}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : typeof value === 'string' ? (
                                  <span className="text-foreground">{value}</span>
                                ) : (
                                  <span className="text-foreground">{String(value)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Confidence Card */}
          {rule.confidence && (
            <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
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
                        className={`h-full rounded-full transition-all ${
                          rule.confidence.score >= 0.9
                            ? "bg-emerald-500"
                            : rule.confidence.score >= 0.7
                            ? "bg-sky-500"
                            : rule.confidence.score >= 0.5
                            ? "bg-amber-500"
                            : "bg-destructive"
                        }`}
                        style={{ width: `${rule.confidence.score * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-mono font-bold ${
                      rule.confidence.score >= 0.9
                        ? "text-emerald-500"
                        : rule.confidence.score >= 0.7
                        ? "text-sky-500"
                        : rule.confidence.score >= 0.5
                        ? "text-amber-500"
                        : "text-destructive"
                    }`}>
                      {(rule.confidence.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="py-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AlertCircle className="w-3 h-3 text-muted-foreground" />
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Steps to Boost Confidence
                    </label>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {rule.confidence.reason_and_steps_to_boost}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  } as DetailPanelConfig;
};

export default GuidelineDetail;
