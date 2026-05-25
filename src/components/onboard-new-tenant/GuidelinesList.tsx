import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { GeneratedRule, GuidelineFilter } from "./types";
import { CONFIDENCE_BUCKETS, CONFIDENCE_CATEGORIES, RULE_TYPES, getConfidenceScore } from "./types";

interface GuidelinesListProps {
  rules: GeneratedRule[];
  selectedRuleIndex: number | null;
  onRuleClick: (index: number) => void;
  activeFilter: GuidelineFilter | null;
  onFilterChange: (filter: GuidelineFilter | null) => void;
  baseRules?: GeneratedRule[] | null;
}

const formatLabel = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

const confidenceBucketCategories: Record<string, readonly string[]> = {
  ready_to_integrate: CONFIDENCE_BUCKETS.ready_to_integrate,
  needs_review: CONFIDENCE_BUCKETS.needs_review,
  incomplete: CONFIDENCE_BUCKETS.incomplete,
};

const getRuleBucket = (rule: GeneratedRule) => {
  const category = rule.confidence?.category;
  if (category && confidenceBucketCategories.ready_to_integrate.includes(category)) return "ready_to_integrate";
  if (category && confidenceBucketCategories.needs_review.includes(category)) return "needs_review";
  return "incomplete";
};

const BUCKET_GROUPS = [
  {
    value: "ready_to_integrate",
    label: "Ready to Integrate",
    countClassName: "text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30",
  },
  {
    value: "needs_review",
    label: "Needs Review",
    countClassName: "text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30",
  },
  {
    value: "incomplete",
    label: "Incomplete",
    countClassName: "text-slate-700 bg-slate-50 border-slate-300 dark:text-slate-300 dark:bg-slate-500/10 dark:border-slate-500/30",
  },
] as const;

const getTileClassName = (rule: GeneratedRule, isSelected: boolean) => {
  const bucket = getRuleBucket(rule);
  const selectedClass = isSelected ? "ring-2 ring-primary/25 shadow-md" : "hover:shadow-sm";

  if (bucket === "ready_to_integrate") {
    return `border-emerald-400 bg-emerald-50/70 hover:bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/15 ${selectedClass}`;
  }
  if (bucket === "needs_review") {
    return `border-amber-400 bg-amber-50/70 hover:bg-amber-50 dark:border-amber-500/60 dark:bg-amber-500/10 dark:hover:bg-amber-500/15 ${selectedClass}`;
  }
  return `border-slate-300 bg-slate-50/80 hover:bg-slate-100/70 dark:border-slate-600 dark:bg-slate-800/35 dark:hover:bg-slate-800/50 ${selectedClass}`;
};

const FilterDropdown = ({
  label,
  items,
  activeValue,
  onSelect,
  onClear,
  colorClass = "text-primary",
}: {
  label: string;
  items: { value: string; label: string; count: number }[];
  activeValue: string | null;
  onSelect: (item: { value: string; label: string; count: number }) => void;
  onClear: () => void;
  colorClass?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-3 h-[30px] rounded-full border cursor-pointer whitespace-nowrap transition-all duration-300 ${activeValue ? `${colorClass} bg-primary/10 border-primary/40 shadow-[0_0_10px_rgba(59,130,246,0.15)]` : "text-muted-foreground bg-card/50 backdrop-blur-sm border-border hover:border-muted-foreground/50 hover:text-foreground"}`}
      >
        <span>{label}</span>
        {activeValue && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 truncate max-w-[120px] backdrop-blur-md">{formatLabel(activeValue)}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-[calc(100%+5px)] right-0 min-w-[220px] bg-card border border-border rounded-lg p-1.5 z-50 shadow-lg max-h-[300px] overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-2 py-1.5 rounded cursor-pointer text-[11px] font-mono transition-colors hover:bg-secondary ${activeValue === item.value ? colorClass : "text-muted-foreground"}`}
            >
              <span>{item.label}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">{item.count}</span>
            </button>
          ))}
          <div className="h-px bg-border my-1" />
          <button
            type="button"
            onClick={() => {
              onClear();
              setOpen(false);
            }}
            className="w-full text-left px-2 py-1 text-[10px] font-mono text-muted-foreground hover:text-destructive rounded transition-colors"
          >
            Clear {label.toLowerCase()} filter
          </button>
        </div>
      )}
    </div>
  );
};

const GuidelinesList = ({ rules, selectedRuleIndex, onRuleClick, activeFilter, onFilterChange, baseRules }: GuidelinesListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const activeRuleType = activeFilter?.kind === "rule_type" ? activeFilter.value : null;
  const activeConfidence = activeFilter?.kind === "confidence_category" ? activeFilter.value : null;
  const activeConfidenceBucket = activeFilter?.kind === "confidence_bucket" ? activeFilter.value : null;

  const indexedRules = useMemo(() => rules.map((rule, index) => ({ rule, index })), [rules]);

  const ruleTypeItems = useMemo(() => RULE_TYPES.map((type) => ({
    value: type,
    label: formatLabel(type),
    count: rules.filter((rule) => rule.rule_type.toLowerCase().trim() === type.toLowerCase().trim()).length,
  })), [rules]);

  const confidenceItems = useMemo(() => CONFIDENCE_CATEGORIES.map((category) => ({
    value: category,
    label: formatLabel(category),
    count: rules.filter((rule) => rule.confidence?.category.toLowerCase().trim() === category.toLowerCase().trim()).length,
  })), [rules]);

  const filteredRules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return indexedRules.filter(({ rule }) => {
      if (activeRuleType && rule.rule_type.toLowerCase().trim() !== activeRuleType.toLowerCase().trim()) return false;
      if (activeConfidence && rule.confidence?.category.toLowerCase().trim() !== activeConfidence.toLowerCase().trim()) return false;
      if (activeConfidenceBucket) {
        const categories = confidenceBucketCategories[activeConfidenceBucket] || [];
        if (!rule.confidence?.category || !categories.includes(rule.confidence.category)) return false;
      }
      if (!q) return true;

      return [
        rule.rule_name,
        rule.short_description,
        rule.rule_type,
        rule.confidence?.category,
      ].some((value) => String(value || "").toLowerCase().includes(q));
    });
  }, [activeConfidence, activeConfidenceBucket, activeRuleType, indexedRules, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-medium text-foreground">Generated Guidelines</span>
          <span className="text-[11px] font-mono text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{filteredRules.length}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2 flex-wrap">
          <div className="relative min-w-[180px] max-sm:w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guidelines..."
              className="h-[30px] text-xs pl-8 w-[220px] bg-card max-sm:w-full"
            />
          </div>
          <div className="w-px h-[22px] bg-border max-sm:hidden" />
          <FilterDropdown
            label="Rule Type"
            items={ruleTypeItems}
            activeValue={activeRuleType}
            onSelect={(item) => onFilterChange({ kind: "rule_type", value: item.value, label: item.label })}
            onClear={() => activeRuleType && onFilterChange(null)}
          />
          <FilterDropdown
            label="Confidence"
            items={confidenceItems}
            activeValue={activeConfidence}
            onSelect={(item) => onFilterChange({ kind: "confidence_category", value: item.value, label: item.label })}
            onClear={() => activeConfidence && onFilterChange(null)}
            colorClass="text-emerald-500"
          />
          {activeFilter && (
            <button
              type="button"
              onClick={() => onFilterChange(null)}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 h-[30px] rounded-md border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      {activeFilter && (
        <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-400/10 border border-blue-400/30 rounded-lg text-[11px] font-mono text-muted-foreground">
          <span>
            Filtered by {activeFilter.kind === "rule_type" ? "rule type" : activeFilter.kind === "confidence_bucket" ? "bucket" : "confidence"}:
          </span>
          <span className="text-blue-500 flex-1 truncate">{activeFilter.label}</span>
        </div>
      )}

      {!filteredRules.length ? (
        <div className="text-center py-12 text-sm text-muted-foreground">No guidelines match your filters.</div>
      ) : BUCKET_GROUPS.map((group) => {
        const groupRules = filteredRules.filter(({ rule }) => getRuleBucket(rule) === group.value);
        if (!groupRules.length) return null;

        return (
          <div key={group.value} className="space-y-3">
            <div className="flex items-center gap-4 py-1.5">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-md border uppercase tracking-widest shadow-sm ${group.countClassName}`}>
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] font-mono text-muted-foreground">{groupRules.length} rule{groupRules.length === 1 ? "" : "s"}</span>
            </div>

            {groupRules.map(({ rule, index }) => {
              const isSelected = selectedRuleIndex === index;
              const baseRule = baseRules?.find((item) => item.rule_name === rule.rule_name) || baseRules?.[index] || null;
              return (
                <div
                  key={index}
                  onClick={() => onRuleClick(index)}
                  className={`relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 ${getTileClassName(rule, isSelected)}`}
                >
                  <div className="px-5 py-6">
                    <div className="flex min-w-0 items-center gap-2.5 flex-wrap">
                      <span className={`font-bold text-base truncate transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {rule.rule_name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-wider shrink-0 border-slate-300 bg-white/50 text-slate-800 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-100"
                      >
                        {rule.rule_type}
                      </Badge>
                      {rule.confidence && (
                        <Badge variant="outline" className="text-[10px] font-bold shrink-0 border-transparent bg-slate-200/55 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100">
                          {baseRule
                            ? `Score: ${getConfidenceScore(baseRule).toFixed(2)} -> ${getConfidenceScore(rule).toFixed(2)}`
                            : `Score: ${getConfidenceScore(rule).toFixed(2)}`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                      {rule.short_description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default GuidelinesList;
