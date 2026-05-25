// Rule Types
export const RULE_TYPES = [
  "triage",
  "cross_validation",
  "risk_scoring",
  "pricing_coverage",
  "referral_authority",
  "compliance",
  "other",
] as const;

export type RuleType = (typeof RULE_TYPES)[number];

// Confidence Categories
export const CONFIDENCE_CATEGORIES = [
  "incomplete",
  "threshold_integrity",
  "terminology_clarity",
  "decisional_clarity",
  "full",
] as const;

export type ConfidenceCategory = (typeof CONFIDENCE_CATEGORIES)[number];

// Confidence Buckets for UI
export const CONFIDENCE_BUCKETS = {
  ready_to_integrate: ["full"] as const,
  needs_review: ["threshold_integrity", "terminology_clarity", "decisional_clarity"] as const,
  incomplete: ["incomplete"] as const,
} as const;

// Interfaces
export interface RuleThreshold {
  [key: string]: string | string[] | number | undefined;
}

export interface Confidence {
  category: ConfidenceCategory;
  score: number;
  reason_and_steps_to_boost: string;
}

export interface RuleDescription {
  description: string;
  threshold?: RuleThreshold[];
}

export interface GeneratedRule {
  rule_name: string;
  rule_type: RuleType | string;
  definition: string;
  short_description: string;
  rule_description?: RuleDescription;
  confidence?: Confidence;
  source_citation: {
    page_number: string;
  };
}

export interface UploadedPdf {
  file: File;
  url: string;
  domain: string;
  lob: string;
}

export interface Insights {
  totalRules: number;
  avgConfidence: number;
  readyToIntegrate: number;
  needsReview: number;
  incomplete: number;
  ruleTypeData: { name: string; value: number }[];
  confidenceData: { name: string; value: number }[];
}

// Helper Functions
export function computeInsights(rules: GeneratedRule[]): Insights {
  const totalRules = rules.length;
  const avgConfidence = rules.reduce((sum, r) => sum + (r.confidence?.score || 0), 0) / totalRules;

  // Confidence buckets
  const readyToIntegrate = rules.filter(r => r.confidence?.category === "full").length;
  const needsReview = rules.filter(r =>
    ["threshold_integrity", "terminology_clarity", "decisional_clarity"].includes(r.confidence?.category || "")
  ).length;
  const incomplete = rules.filter(r => r.confidence?.category === "incomplete").length;

  // Rule type distribution - include all types with 0 counts
  const ruleTypeCounts: Record<string, number> = {};
  RULE_TYPES.forEach(t => { ruleTypeCounts[t] = 0; });
  rules.forEach(r => {
    ruleTypeCounts[r.rule_type] = (ruleTypeCounts[r.rule_type] || 0) + 1;
  });
  const ruleTypeData = Object.entries(ruleTypeCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value
  }));

  // Confidence category distribution - include all categories with 0 counts
  const confidenceCounts: Record<string, number> = {};
  CONFIDENCE_CATEGORIES.forEach(c => { confidenceCounts[c] = 0; });
  rules.forEach(r => {
    const cat = r.confidence?.category || "unknown";
    confidenceCounts[cat] = (confidenceCounts[cat] || 0) + 1;
  });
  const confidenceData = Object.entries(confidenceCounts).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value
  }));

  return {
    totalRules,
    avgConfidence,
    readyToIntegrate,
    needsReview,
    incomplete,
    ruleTypeData,
    confidenceData,
  };
}

export const DOMAIN_OPTIONS = ["Underwriting", "Claims"];
export const LOB_OPTIONS = ["Property", "Auto", "WC", "GL"];

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// Chart colors
export const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a78bfa", "#f87171", "#ec4899", "#38bdf8", "#fb923c"];

// Detail Panel Config (for SplitPanelWrapper)
export interface DetailPanelConfig {
  header: React.ReactNode;
  body: React.ReactNode;
}
