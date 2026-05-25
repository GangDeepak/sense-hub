import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, Files, Sparkles, Trash2, CloudUpload as UploadCloud, Wand as Wand2, CircleCheck as CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import rulesData from "@/mock_data/onboard-guideline";
import { SplitPanelWrapper } from "@/components/grounding/SplitDetailPanel";
import type { DetailPanelConfig } from "@/components/grounding/SplitDetailPanel";
import OverviewTab from "./OverviewTab";
import GuidelinesList from "./GuidelinesList";
import GuidelineDetail from "./GuidelineDetail";
import type { GeneratedRule, UploadedPdf, Insights } from "./types";
import { computeInsights, DOMAIN_OPTIONS, LOB_OPTIONS, formatBytes } from "./types";

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

    setGeneratedRules(rulesData);
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

  const insights: Insights | null = useMemo(() => {
    if (!showResults || generatedRules.length === 0) return null;
    return computeInsights(generatedRules);
  }, [showResults, generatedRules]);

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

        {/* Insights Overview Section */}
        {showResults && insights && <OverviewTab insights={insights} />}

        {/* Generated Guidelines List */}
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
              <GuidelinesList
                rules={generatedRules}
                selectedRuleIndex={selectedRuleIndex}
                onRuleClick={handleRuleClick}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const detail: DetailPanelConfig | null = useMemo(() => {
    if (!selectedRule || selectedRuleIndex === null) return null;
    return GuidelineDetail({
      rule: selectedRule,
      ruleIndex: selectedRuleIndex,
      onClose: () => setSelectedRuleIndex(null),
    });
  }, [selectedRule, selectedRuleIndex]);

  return (
    <SplitPanelWrapper
      listPane={listPaneContent}
      detail={detail}
      listPaneClassName="overflow-y-auto"
    />
  );
}
