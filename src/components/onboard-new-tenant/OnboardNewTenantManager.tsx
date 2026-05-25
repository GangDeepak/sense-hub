import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, FileText, Files, Sparkles, Trash2, CloudUpload as UploadCloud, Wand as Wand2, BarChart3 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import rulesData from "@/mock_data/onboard-guideline";
import regeneratedRulesData from "@/mock_data/regenerate-guideline";
import { SplitPanelWrapper } from "@/components/grounding/SplitDetailPanel";
import type { DetailPanelConfig } from "@/components/grounding/SplitDetailPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import GuidelinesList from "./GuidelinesList";
import GuidelineDetail from "./GuidelineDetail";
import type { GeneratedRule, UploadedPdf, Insights, GuidelineFilter, RegeneratedRulesData } from "./types";
import { computeInsights, DOMAIN_OPTIONS, LOB_OPTIONS, formatBytes } from "./types";

export default function OnboardNewTenantManager() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPdfs, setUploadedPdfs] = useState<UploadedPdf[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRules, setGeneratedRules] = useState<GeneratedRule[]>([]);
  const [baseRulesForComparison, setBaseRulesForComparison] = useState<GeneratedRule[] | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [guidelineFilter, setGuidelineFilter] = useState<GuidelineFilter | null>(null);
  const [isGlossaryDialogOpen, setIsGlossaryDialogOpen] = useState(false);
  const [isGlossaryDragging, setIsGlossaryDragging] = useState(false);
  const [glossaryFile, setGlossaryFile] = useState<File | null>(null);
  const [isGlossaryReadyToPublish, setIsGlossaryReadyToPublish] = useState(false);
  const [isGlossaryPublished, setIsGlossaryPublished] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const glossaryInputRef = useRef<HTMLInputElement>(null);
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

  const addGlossaryFile = (incoming: FileList | null) => {
    if (!incoming) return;
    const file = Array.from(incoming).find((item) => {
      const name = item.name.toLowerCase();
      return (
        item.type === "application/pdf" ||
        item.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        item.type === "application/msword" ||
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
      );
    });

    if (file) {
      setGlossaryFile(file);
      setIsGlossaryReadyToPublish(false);
      setIsGlossaryPublished(false);
    }
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

  const handleGenerateGuidelines = async (options?: { fromGlossary?: boolean }) => {
    setIsGenerating(true);
    setShowResults(false);
    setGeneratedRules([]);
    setSelectedRuleIndex(null);
    setGuidelineFilter(null);
    if (!options?.fromGlossary) {
      setBaseRulesForComparison(null);
      setIsGlossaryReadyToPublish(false);
      setIsGlossaryPublished(false);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (options?.fromGlossary) {
      const regenerated = regeneratedRulesData as RegeneratedRulesData;
      setBaseRulesForComparison(regenerated.base_rules);
      setGeneratedRules(regenerated.refined_rules);
    } else {
      setGeneratedRules(rulesData);
    }
    setShowResults(true);
    setIsGenerating(false);
    setActiveTab("insights");

    if (options?.fromGlossary) {
      setIsGlossaryReadyToPublish(true);
      setIsGlossaryPublished(false);
    }
  };

  const handleRegenerateGuidelines = () => {
    setIsGlossaryDialogOpen(false);
    handleGenerateGuidelines({ fromGlossary: true });
  };

  const handleRuleClick = (index: number) => {
    setSelectedRuleIndex(selectedRuleIndex === index ? null : index);
  };

  const handleViewFilteredGuidelines = (filter: GuidelineFilter | null) => {
    setGuidelineFilter(filter);
    setSelectedRuleIndex(null);
    setActiveTab("guidelines");
  };

  const selectedRule = useMemo(() => {
    if (selectedRuleIndex === null || !generatedRules[selectedRuleIndex]) return null;
    return generatedRules[selectedRuleIndex];
  }, [selectedRuleIndex, generatedRules]);

  const selectedBaseRule = useMemo(() => {
    if (selectedRuleIndex === null || !baseRulesForComparison || !selectedRule) return null;
    return baseRulesForComparison.find((rule) => rule.rule_name === selectedRule.rule_name) || baseRulesForComparison[selectedRuleIndex] || null;
  }, [baseRulesForComparison, selectedRule, selectedRuleIndex]);

  const insights: Insights | null = useMemo(() => {
    if (!showResults || generatedRules.length === 0) return null;
    return computeInsights(generatedRules);
  }, [showResults, generatedRules]);

  const baseInsights: Insights | null = useMemo(() => {
    if (!showResults || !baseRulesForComparison || baseRulesForComparison.length === 0) return null;
    return computeInsights(baseRulesForComparison);
  }, [baseRulesForComparison, showResults]);

  const listPaneContent = (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full min-h-0 flex-col">
        <div className="bg-background px-4 py-6 lg:px-8">
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
        </div>

        <div className="flex items-center gap-0.5 px-4 border-b border-border bg-card sticky top-0 z-10">
          <TabsList className="flex h-auto bg-transparent p-0">
            <TabsTrigger
              value="upload"
              className="rounded-none gap-2 text-[13px] px-3.5 py-3.5 border-b-2 -mb-px border-transparent bg-transparent shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Upload
              {uploadedPdfs.length > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] rounded-full">
                  {uploadedPdfs.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-none gap-2 text-[13px] px-3.5 py-3.5 border-b-2 -mb-px border-transparent bg-transparent shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Insights
            </TabsTrigger>
            <TabsTrigger
              value="guidelines"
              className="rounded-none gap-2 text-[13px] px-3.5 py-3.5 border-b-2 -mb-px border-transparent bg-transparent shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <FileText className="h-3.5 w-3.5" />
              Guidelines
              {generatedRules.length > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full">
                  {generatedRules.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          {showResults && uploadedPdfs.length > 0 && generatedRules.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGlossaryDialogOpen(true)}
                className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-3 text-[11px] font-mono text-primary transition-colors hover:bg-primary/15"
              >
                <FileText className="h-3.5 w-3.5" />
                Add Glossary
              </button>
              {isGlossaryReadyToPublish && (
                <button
                  type="button"
                  onClick={() => setIsGlossaryPublished(true)}
                  className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 text-[11px] font-mono text-emerald-600 transition-colors hover:bg-emerald-500/15 disabled:cursor-default disabled:opacity-70"
                  disabled={isGlossaryPublished}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isGlossaryPublished ? "Glossary Published" : "Publish Glossary"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-none mx-auto py-8 px-4 lg:px-8 space-y-6">
          <TabsContent value="upload" className="space-y-6 outline-none focus:ring-0">
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
                            className="group relative grid grid-cols-[minmax(220px,1.6fr)_minmax(190px,auto)_minmax(170px,auto)_auto] items-center gap-4 px-5 py-4 text-sm transition-all hover:bg-primary/[0.03] max-xl:grid-cols-[minmax(220px,1fr)_minmax(190px,auto)_auto] max-lg:grid-cols-[minmax(220px,1fr)_auto] max-md:grid-cols-1 max-md:items-start"
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
                            <div className="flex min-w-0 items-center gap-2">
                              <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                Domain
                              </Badge>
                              <Select value={domain} onValueChange={(value) => updatePdfField(index, "domain", value)}>
                                <SelectTrigger className="h-9 min-w-[150px] rounded-lg bg-background text-xs max-md:w-full">
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
                            <div className="flex min-w-0 items-center gap-2">
                              <Badge variant="outline" className="shrink-0 border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                LoB
                              </Badge>
                              <Select value={lob} onValueChange={(value) => updatePdfField(index, "lob", value)}>
                                <SelectTrigger className="h-9 min-w-[130px] rounded-lg bg-background text-xs max-md:w-full">
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
                      <div className="flex items-center justify-between gap-3 border-t border-border/50 bg-gradient-to-r from-muted/30 via-muted/10 to-primary/5 px-5 py-4 max-sm:flex-col max-sm:items-start">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{uploadedPdfs.length}</span>{" "}
                          {uploadedPdfs.length === 1 ? "file" : "files"} · {formatBytes(totalSize)}
                        </p>
                        <Button
                          size="sm"
                          onClick={() => handleGenerateGuidelines()}
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
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 outline-none focus:ring-0">
            {showResults && insights ? (
              <OverviewTab
                insights={insights}
                baseInsights={baseInsights}
                rules={generatedRules}
                onViewRules={handleViewFilteredGuidelines}
              />
            ) : (
              <Card className="overflow-hidden border border-dashed border-border/60 bg-gradient-to-b from-card to-muted/20 shadow-sm rounded-2xl animate-in fade-in duration-500">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <BarChart3 className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Insights Dashboard Pending</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    Diagnostic analytics and rule distribution charts will render here once guidelines are generated.
                  </p>
                  <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-indigo-500" />
                    Go to <span className="font-semibold text-primary">Upload</span> tab to start
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6 outline-none focus:ring-0">
            {showResults && generatedRules.length > 0 ? (
              <GuidelinesList
                rules={generatedRules}
                selectedRuleIndex={selectedRuleIndex}
                onRuleClick={handleRuleClick}
                activeFilter={guidelineFilter}
                onFilterChange={setGuidelineFilter}
                baseRules={baseRulesForComparison}
              />
            ) : (
              <Card className="overflow-hidden border border-dashed border-border/60 bg-gradient-to-b from-card to-muted/20 shadow-sm rounded-2xl animate-in fade-in duration-500">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                    <FileText className="h-8 w-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">Guidelines View Pending</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                    Extracted underwriting policies and confidence breakdowns will be shown here after parsing.
                  </p>
                  <div className="mt-6 flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
                    <Wand2 className="h-3 w-3 text-emerald-500" />
                    Press <span className="font-semibold text-primary">Generate Guideline</span> to extract
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );

  const detail: DetailPanelConfig | null = useMemo(() => {
    if (!selectedRule || selectedRuleIndex === null) return null;
    return GuidelineDetail({
      rule: selectedRule,
      baseRule: selectedBaseRule,
      onClose: () => setSelectedRuleIndex(null),
    });
  }, [selectedBaseRule, selectedRule, selectedRuleIndex]);

  return (
    <>
      <SplitPanelWrapper
        listPane={listPaneContent}
        detail={detail}
        listPaneClassName="overflow-hidden"
      />

      <Dialog open={isGlossaryDialogOpen} onOpenChange={setIsGlossaryDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add Glossary</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => glossaryInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") glossaryInputRef.current?.click();
              }}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsGlossaryDragging(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsGlossaryDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsGlossaryDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsGlossaryDragging(false);
                addGlossaryFile(event.dataTransfer.files);
              }}
              className={`rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                isGlossaryDragging
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/60 hover:bg-primary/[0.03]"
              }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold">
                {glossaryFile ? glossaryFile.name : "Upload glossary document"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag and drop a PDF, DOC, or DOCX file, or click to browse.
              </p>
              <input
                ref={glossaryInputRef}
                type="file"
                accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={(event) => {
                  addGlossaryFile(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>

            {glossaryFile && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-muted-foreground">
                Glossary uploaded. Regenerate Guideline to apply glossary terms to the generated rules.
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsGlossaryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegenerateGuidelines} disabled={!glossaryFile || isGenerating} className="gap-2">
              <Wand2 className="h-4 w-4" />
              Regenerate Guideline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
