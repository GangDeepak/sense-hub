import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, FileText, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface UploadedPdf {
  file: File;
  url: string;
  domain: string;
  lob: string;
}

const DOMAIN_OPTIONS = ["Underwriting", "Claims"];
const LOB_OPTIONS = ["Property", "Auto", "WC", "GL"];

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
      if (pdfToRemove) {
        URL.revokeObjectURL(pdfToRemove.url);
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const viewPdf = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const updatePdfField = (indexToUpdate: number, field: "domain" | "lob", value: string) => {
    setUploadedPdfs((prev) =>
      prev.map((pdf, index) =>
        index === indexToUpdate ? { ...pdf, [field]: value } : pdf
      )
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Onboard New Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Set up a new tenant workspace, access controls, and default configurations.
          </p>
        </div>

        <Card>

          <CardContent>
            <div className="space-y-4">
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
                className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/40"
                }`}
              >
                <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Drag and drop documents here</p>
                <p className="text-xs text-muted-foreground">or click to upload multiple files</p>
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
                <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-medium">Uploaded PDF</p>
                  </div>
                  <div className="divide-y divide-border">
                    {uploadedPdfs.map(({ file, url, domain, lob }, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="grid grid-cols-[minmax(160px,1.4fr)_minmax(170px,1fr)_minmax(150px,1fr)_auto_auto] items-center gap-3 px-4 py-3 text-sm max-md:grid-cols-1 max-md:items-start"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-primary" />
                          <span className="truncate font-medium" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 font-medium text-foreground">Domain</span>
                          <Select value={domain} onValueChange={(value) => updatePdfField(index, "domain", value)}>
                            <SelectTrigger className="h-8 min-w-[160px] bg-background text-xs">
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
                          <span className="shrink-0 font-medium text-foreground">LoB</span>
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
                        <button
                          type="button"
                          onClick={() => viewPdf(url)}
                          title="View PDF"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground max-md:w-fit max-md:px-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removePdf(index)}
                          title="Remove PDF"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground max-md:w-fit max-md:px-2"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    ))}
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
