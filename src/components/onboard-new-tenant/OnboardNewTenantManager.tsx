import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Eye, FileText, Files, Sparkles, UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface UploadedPdf {
  file: File;
  url: string;
  domain: string;
  lob: string;
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

  return (
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
                <div className="overflow-hidden rounded-xl border bg-card">
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {uploadedPdfs.length} {uploadedPdfs.length === 1 ? "document" : "documents"} ready
                        </p>
                        <p className="text-xs text-muted-foreground">Total size: {formatBytes(totalSize)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive">
                      Clear all
                    </Button>
                  </div>
                  <div className="divide-y">
                    {uploadedPdfs.map(({ file, url, domain, lob }, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="group grid grid-cols-[minmax(180px,1.5fr)_minmax(170px,1fr)_minmax(150px,1fr)_auto] items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/30 max-md:grid-cols-1 max-md:items-start"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="shrink-0 text-[10px] font-medium uppercase tracking-wide">
                            Domain
                          </Badge>
                          <Select value={domain} onValueChange={(value) => updatePdfField(index, "domain", value)}>
                            <SelectTrigger className="h-8 min-w-[150px] bg-background text-xs">
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
                          <Badge variant="outline" className="shrink-0 text-[10px] font-medium uppercase tracking-wide">
                            LoB
                          </Badge>
                          <Select value={lob} onValueChange={(value) => updatePdfField(index, "lob", value)}>
                            <SelectTrigger className="h-8 min-w-[120px] bg-background text-xs">
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removePdf(index)}
                            title="Remove PDF"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Add more
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Process documents
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
