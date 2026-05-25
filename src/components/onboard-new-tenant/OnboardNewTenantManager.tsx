import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Files, Sparkles, Trash2, CloudUpload as UploadCloud, Wand as Wand2, CircleCheck as CheckCircle2, BookOpen, X, FileSearch, Quote, Hash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import rulesData from "@/mock_data/onboard-guideline";
import { SplitPanelWrapper, type DetailPanelConfig } from "@/components/grounding/SplitDetailPanel";

interface UploadedPdf {
  file: File;
  url: string;
  domain: string;
  lob: string;
}

interface GeneratedRule {
  rule_name: string;
  rule_type: string;
  definition: string;
  short_description: string;
  source_citation: {
    page_number: string;
  };
}

const DOMAIN_OPTIONS = ["Underwriting", "Claims"];
const LOB_OPTIONS = ["Property", "Auto", "WC", "GL"];

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export default function OnboardNewTenantManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState<UploadedPdf[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<GeneratedRule[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedPdfsRef = useRef<UploadedPdf[]>([]);

  useEffect(() => {
    uploadedPdfsRef.current = uploadedPdfs;
  }, [uploadedPdfs]);

  useEffect(() => {
    return () => {
      uploadedPdfsRef.current.forEach(({ url }) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const pdfs = Array.from(incoming)
      .filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        domain: "Underwriting",
        lob: "Property",
      }));

    if (pdfs.length === 0) return;
    setUploadedPdfs((prev) => [...prev, ...pdfs]);
  };

  const removePdf = (indexToRemove: number) => {
    setUploadedPdfs((prev) => {
      const pdfToRemove = prev[indexToRemove];
      if (pdfToRemove) URL.revokeObjectURL(pdfToRemove.url);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const clearAll = () => {
    uploadedPdfs.forEach(({ url }) => URL.revokeObjectURL(url));
    setUploadedPdfs([]);
  };

  const viewPdf = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const updatePdfField = (indexToUpdate: number, field: "domain" | "lob", value: string) => {
    setUploadedPdfs((prev) =>
      prev.map((pdf, index) => (index === indexToUpdate ? { ...pdf, [field]: value } : pdf)),
    );
  };

  const totalSize = useMemo(
    () => uploadedPdfs.reduce((sum, p) => sum + p.file.size, 0),
    [uploadedPdfs],
  );

  const handleGenerateGuidelines = async () => {
    setIsGenerating(true);
    setShowResults(false);
    setGeneratedRules([]);
    setSelectedRuleIndex(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setGeneratedRules(rulesData.rules);
    setShowResults(true);
    setIsGenerating(false);
  };

  const handleRuleClick = (index: number) => {
    setSelectedRuleIndex(selectedRuleIndex === index ? null : index);
  };

  const selectedRule = useMemo(() => {
    if (selectedRuleIndex === null || !generatedRules[selectedRuleIndex]) return null;
    return generatedRules[selectedRuleIndex];
  }, [selectedRuleIndex, generatedRules]);

  const listPaneContent = (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Tenant Setup
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Onboard New Tenant</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload your knowledge documents and tag them by domain and line of business.
            </p>
          </div>
        </div>

        <Card className="overflow-hidden border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-5">
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  addFiles(e.dataTransfer.files);
                }}
                className={`group relative overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/10 scale-[1.01] shadow-lg"
                    : "border-border hover:border-primary/60 hover:bg-primary/[0.03]"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)",
                  }}
                />
                <div className="relative flex flex-col items-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform ${
                      isDragging ? "scale-110" : "group-hover:scale-105"
                    }`}
                  >
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="mt-4 text-base font-semibold">
                    {isDragging ? "Drop your PDFs here" : "Drag and drop PDF documents"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or <span className="font-medium text-primary">click to browse</span> — multiple files supported
                  </p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <FileText className="h-3 w-3" />
                      PDF only
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                      <Files className="h-3 w-3" />
                      Bulk upload
                    </span>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>

              {uploadedPdfs.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/10 shadow-sm">
                  <ul className="divide-y divide-border/50">
                    {uploadedPdfs.map(({ file, url, domain, lob }, index) => (
                      <li
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="group relative grid grid-cols-[minmax(200px,1.6fr)_minmax(180px,1fr)_minmax(160px,1fr)_auto] items-center gap-4 px-5 py-4 text-sm transition-all hover:bg-primary/[0.03] max-md:grid-cols-1 max-md:items-start"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/10">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            Domain
                          </Badge>
                          <Select value={domain} onValueChange={(value) => updatePdfField(index, "domain", value)}>
                            <SelectTrigger className="h-9 min-w-[150px] rounded-lg bg-background text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DOMAIN_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option} className="text-xs">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                            LoB
                          </Badge>
                          <Select value={lob} onValueChange={(value) => updatePdfField(index, "lob", value)}>
                            <SelectTrigger className="h-9 min-w-[130px] rounded-lg bg-background text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LOB_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option} className="text-xs">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => viewPdf(url)}
                            title="View PDF"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removePdf(index)}
                            title="Delete PDF"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive hover:scale-105"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-gradient-to-r from-muted/30 via-muted/10 to-primary/5 px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{uploadedPdfs.length}</span>{" "}
                      {uploadedPdfs.length === 1 ? "file" : "files"} · {formatBytes(totalSize)}
                    </p>
                    <Button
                      size="sm"
                      onClick={handleGenerateGuidelines}
                      disabled={isGenerating || uploadedPdfs.length === 0}
                      className="group/btn relative gap-2 overflow-hidden bg-gradient-to-r from-primary to-primary/80 px-5 shadow-md transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                          Generate Guideline
                          <Sparkles className="h-3.5 w-3.5 opacity-70" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {showResults && generatedRules.length > 0 && (
          <Card className="overflow-hidden border-2 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Generated Underwriting Guidelines</h2>
                  <p className="text-sm text-muted-foreground">
                    {generatedRules.length} rules extracted from uploaded documents
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {generatedRules.map((rule, idx) => {
                  const isSelected = selectedRuleIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleRuleClick(idx)}
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const detail: DetailPanelConfig | null = selectedRule ? {
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
              Rule #{(selectedRuleIndex ?? 0) + 1}
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                selectedRule.rule_type === "triage"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                  : "border-blue-500/30 bg-blue-500/10 text-blue-600"
              }`}
            >
              {selectedRule.rule_type}
            </Badge>
          </div>
          <p className="text-[14px] font-semibold text-foreground leading-snug break-words pr-6">
            {selectedRule.rule_name}
          </p>
        </div>

        <button
          onClick={() => setSelectedRuleIndex(null)}
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
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm">
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
                  {selectedRule.rule_name}
                </p>
              </div>

              <div className="py-3 border-b border-border/60">
                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Rule Type
                </label>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    selectedRule.rule_type === "triage"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {selectedRule.rule_type}
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
                  {selectedRule.definition}
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
                  {selectedRule.short_description}
                </p>
              </div>

              {selectedRule.source_citation && (
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
                      {selectedRule.source_citation.page_number}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
  } : null;

  return (
    <SplitPanelWrapper
      listPane={listPaneContent}
      detail={detail}
      listPaneClassName="overflow-y-auto"
    />
  );
}
