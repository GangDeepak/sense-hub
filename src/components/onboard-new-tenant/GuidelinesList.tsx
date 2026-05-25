import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { GeneratedRule } from "./types";

interface GuidelinesListProps {
  rules: GeneratedRule[];
  selectedRuleIndex: number | null;
  onRuleClick: (index: number) => void;
}

const GuidelinesList = ({ rules, selectedRuleIndex, onRuleClick }: GuidelinesListProps) => {
  if (rules.length === 0) return null;

  return (
    <div className="space-y-3">
      {rules.map((rule, idx) => {
        const isSelected = selectedRuleIndex === idx;
        return (
          <div
            key={idx}
            onClick={() => onRuleClick(idx)}
            className={`rounded-xl border bg-card/50 overflow-hidden transition-all cursor-pointer group ${
              isSelected
                ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20"
                : "border-border/60 hover:border-primary/30 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-primary/10 text-primary group-hover:bg-primary/15"
                }`}>
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm truncate transition-colors ${
                      isSelected ? "text-primary" : "text-foreground"
                    }`}>
                      {rule.rule_name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                        rule.rule_type === "triage"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {rule.rule_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {rule.short_description}
                  </p>
                </div>
              </div>
              <div className="text-muted-foreground shrink-0 text-xs">
                Click to view
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GuidelinesList;
