import React, { useState, useRef, useMemo } from 'react';
import {
  Database,
  Search,
  Loader2,
  ArrowRightLeft,
  Eye,
  X,
  Wrench,
  Terminal as TerminalIcon,
  Cpu,
  Copy,
  Info,
  Layout,
  Plus,
  Upload,
  Download,
  FileJson,
  ChevronRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchTxnData, TxnResult, API_ENDPOINTS } from "@/utils/apiDataService";
import { ComparisonView } from "./ComparisonView";
import { cn } from "@/lib/utils";
import { SplitPanelWrapper } from "../grounding/SplitDetailPanel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiToolsView } from "./ApiToolsView";
import { API_TOOLS, ApiTool } from "./apiToolsData";

const JsonView = ({ data }: { data: any }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast({ title: "Copied!", description: "JSON copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-black/5 border border-border/40 overflow-hidden font-mono text-[11px] h-full">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="outline" size="sm" className="h-7 px-2 bg-background/80 backdrop-blur-md" onClick={handleCopy}>
          <Copy className={cn("w-3 h-3 mr-1.5", copied && "text-green-500")} />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="p-4 h-full overflow-auto custom-scrollbar leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

const formatEndpointName = (name: string) => {
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// ── Tool Tile (List Item Style) ────────────────────────────────────────────────
const ToolTile = ({ toolId, tool, isSelected, onClick }: {
  toolId: string;
  tool: ApiTool;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const apiEndpoint = tool.parameters?.properties?.api_name?.const ?? null;
  const method = tool.parameters?.properties?.method?.const ?? null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative group flex flex-col gap-2 p-5 rounded-2xl border transition-all duration-400 cursor-pointer overflow-hidden",
        isSelected
          ? "bg-primary/10 border-primary/40 shadow-[0_4px_24px_-8px_rgba(59,130,246,0.3)] ring-1 ring-primary/20"
          : "bg-card/40 border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      <div className={cn(
        "absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500",
        isSelected ? "bg-primary/20 opacity-100" : "bg-primary/10 opacity-0 group-hover:opacity-100"
      )} />
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
        isSelected ? "bg-primary" : "bg-transparent group-hover:bg-primary/40"
      )} />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-mono text-[10px] px-2 py-0">
            {(tool.type ?? 'api').toUpperCase()}
          </Badge>
          <span className="text-sm font-bold tracking-wide">
            {(tool.name || toolId).replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {method && (
            <Badge variant="outline" className="font-mono text-[10px] py-0 border-emerald-400/30 text-emerald-400">
              {method}
            </Badge>
          )}
          <div className={cn(
            "p-1.5 rounded-lg border border-border/40 transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "bg-background/50 group-hover:bg-primary group-hover:text-primary-foreground"
          )}>
            <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isSelected && "rotate-90")} />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed italic relative z-10 pl-1">
        {(tool.definition ?? '').replace(/^- /, '').trim()}
      </p>
    </div>
  );
};

// ── Upload Zone ───────────────────────────────────────────────────────────────
const UploadZone = ({ onUpload }: { onUpload: (tools: Record<string, ApiTool>) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processFile = (file: File) => {
    setError(null);
    if (!file.name.endsWith('.json')) {
      setError('Please upload a valid .json file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const tools: Record<string, ApiTool> = parsed.tools ?? parsed;
        if (typeof tools !== 'object' || Array.isArray(tools)) {
          throw new Error('Expected an object mapping tool IDs to tool definitions.');
        }
        onUpload(tools);
        toast({ title: "Uploaded!", description: `Pricing Tool Loaded.` });
      } catch (err: any) {
        setError(`Invalid JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed p-10 flex flex-col items-center gap-4 transition-all duration-300",
        dragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border/50 hover:border-primary/40 hover:bg-card/60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
      />
      <div className={cn(
        "p-4 rounded-2xl transition-colors",
        dragging ? "bg-primary/10" : "bg-secondary/50"
      )}>
        <FileJson className={cn("w-10 h-10 transition-colors", dragging ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">
          {dragging ? "Drop your JSON file here" : "Upload OpenAPI Tool Definition"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Drag & drop or click to browse · <code className="font-mono text-xs">.json</code> only
        </p>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-rose-500 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export function ApiDataManager() {
  const [activeTab, setActiveTab] = useState<'description' | 'playground'>('description');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [uploadedTools, setUploadedTools] = useState<Record<string, ApiTool> | null>(null);
  const [results, setResults] = useState<TxnResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTxn, setSearchTxn] = useState('');
  const [activePanel, setActivePanel] = useState<{ mode: 'raw' | 'compare', endpoint: string, txnId?: string } | null>(null);
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [diffCount, setDiffCount] = useState(0);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // By default, show all tools except 'groundup_pricing'. On upload, show all tools with 'groundup_pricing' at the TOP.
  const displayTools = useMemo(() => {
    const tools = { ...API_TOOLS };
    if (!uploadedTools) {
      delete (tools as any).groundup_pricing;
      return tools;
    }
    // If uploaded, extract pricing and put it at the very start of the object
    const { groundup_pricing, ...rest } = tools;
    return { groundup_pricing, ...rest };
  }, [uploadedTools]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(displayTools, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api_tools_export.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported!", description: "Tools JSON downloaded successfully." });
  };

  const handleSearch = async () => {
    const txnIds = searchTxn
      .split(/[\n,]/)
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (txnIds.length === 0) return;

    setLoading(true);
    const successIds: string[] = [];
    const errorIds: string[] = [];

    try {
      for (const id of txnIds) {
        try {
          const data = await fetchTxnData(id);
          setResults(prev => {
            const exists = prev.find(r => r.txnId === data.txnId);
            if (exists) return prev;
            return [data, ...prev];
          });
          successIds.push(id);
        } catch (err) {
          errorIds.push(id);
        }
      }

      if (successIds.length > 0) {
        toast({ title: "Data Fetched", description: `Successfully fetched ${successIds.length} transaction(s).` });
        setSearchTxn('');
      }
      if (errorIds.length > 0) {
        toast({ variant: "destructive", title: "Fetch Partial Error", description: `Failed to fetch: ${errorIds.join(', ')}` });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Tool Description Tab Content ──────────────────────────────────────────
  const descriptionListContent = (
    <div className="p-6 lg:p-8 space-y-6 pb-20">
      <div className="space-y-3">
        {Object.keys(displayTools).map((toolId) => (
          <ToolTile
            key={toolId}
            toolId={toolId}
            tool={displayTools[toolId]}
            isSelected={selectedToolId === toolId}
            onClick={() => setSelectedToolId(selectedToolId === toolId ? null : toolId)}
          />
        ))}
      </div>
    </div>
  );

  const descriptionDetailPanel = selectedToolId ? {
    header: (
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border/40">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold leading-none">
              {(displayTools[selectedToolId]?.name || selectedToolId).replace(/_/g, ' ').toUpperCase()}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1 truncate">
              {displayTools[selectedToolId]?.type?.toUpperCase() ?? 'API TOOL'}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-rose-500/10 hover:text-rose-500 group"
          onClick={() => setSelectedToolId(null)}>
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </Button>
      </div>
    ),
    body: (
      <div className="flex flex-col h-full overflow-hidden">
        <ApiToolsView toolId={selectedToolId} toolData={displayTools[selectedToolId]} />
      </div>
    )
  } : null;

  // ── Playground List Pane ──────────────────────────────────────────────────
  const playgroundListContent = (
    <div className="space-y-6 h-full flex flex-col p-6 lg:p-8 pb-20">
      <div className="flex gap-3 items-end">
        <div className="flex-1 space-y-2">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
            Transaction IDs (Comma or newline separated)
          </Label>
          <div className="relative group">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Textarea
              placeholder="TXN_001, TXN_002..."
              value={searchTxn}
              onChange={(e) => setSearchTxn(e.target.value)}
              className="pl-10 min-h-[60px] py-3 resize-y bg-card border-border/60 focus:border-primary/40 focus:ring-primary/10 transition-all rounded-2xl shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSearch())}
            />
          </div>
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading || !searchTxn.trim()}
          className="h-[60px] px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Fetch Data
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pt-2">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6 bg-card/20 rounded-3xl border border-dashed border-border/40">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No data available</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-1">
              Enter transaction IDs above to fetch and analyze live API response data.
            </p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {API_ENDPOINTS.map((endpoint) => {
                const endpointResults = results.filter(r => r.results.some(res => res.endpoint === endpoint && !res.error));
                if (endpointResults.length === 0) return null;
                return (
                  <Card key={endpoint} className="border-border/40 bg-card/40 hover:bg-card/60 transition-all border-2 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="p-4 border-b border-border/10 pb-3 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TerminalIcon className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{formatEndpointName(endpoint)}</span>
                        </div>
                        <Badge variant="outline" className="h-5 text-[9px] px-1.5 rounded-md">{endpointResults.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="p-2.5">
                        <Button variant="secondary" size="sm" className="w-full h-9 text-[10px] gap-2 font-bold rounded-xl"
                          onClick={() => setActivePanel({ mode: 'compare', endpoint })}>
                          <ArrowRightLeft className="w-3 h-3" /> Compare Results
                        </Button>
                      </div>
                      <ScrollArea className="max-h-[200px]">
                        {endpointResults.map((res) => (
                          <div key={res.txnId}
                            className={cn(
                              "flex items-center justify-between p-3.5 transition-colors cursor-pointer group/row border-t border-border/5",
                              activePanel?.txnId === res.txnId && activePanel?.endpoint === endpoint && activePanel?.mode === 'raw'
                                ? "bg-primary/10 text-primary" : "hover:bg-primary/5 text-muted-foreground"
                            )}
                            onClick={() => setActivePanel({ mode: 'raw', endpoint, txnId: res.txnId })}>
                            <code className="text-[11px] font-mono font-medium truncate">{res.txnId}</code>
                            <Eye className="w-3.5 h-3.5 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          </div>
                        ))}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ── Playground Detail Pane ────────────────────────────────────────────────
  const playgroundDetailPanel = activePanel ? {
    header: (
      <div className="flex items-center justify-between gap-4 p-4 border-b border-border/40">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
            {activePanel.mode === 'raw' ? <Eye className="w-4 h-4 text-primary" /> : <ArrowRightLeft className="w-4 h-4 text-primary" />}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold leading-none">
              {activePanel.mode === 'raw' ? 'Raw Result' : 'Schema Analysis'}
            </h3>
            <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground mt-1 truncate">
              {formatEndpointName(activePanel.endpoint)}{activePanel.txnId && ` · ${activePanel.txnId}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {activePanel.mode === 'compare' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/40 rounded-full border border-border/40">
              <Label htmlFor="diff-toggle" className="text-[9px] font-bold uppercase text-muted-foreground cursor-pointer">Diffs Only</Label>
              <Switch id="diff-toggle" className="scale-75" checked={showOnlyDiffs} onCheckedChange={setShowOnlyDiffs} />
              {diffCount > 0 && (
                <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] h-4 font-bold py-0">
                  {diffCount}
                </Badge>
              )}
            </div>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-rose-500/10 hover:text-rose-500 group"
            onClick={() => setActivePanel(null)}>
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    ),
    body: (
      <div className="py-4">
        {activePanel.mode === 'raw' && activePanel.txnId ? (
          <div className="h-[calc(100vh-250px)] px-4">
            {(() => {
              const txnRes = results.find(r => r.txnId === activePanel.txnId);
              const apiData = txnRes?.results.find(res => res.endpoint === activePanel.endpoint)?.data;
              return apiData ? <JsonView data={apiData} /> : <div className="text-center p-12 text-muted-foreground italic">No data found</div>;
            })()}
          </div>
        ) : (
          <div className="px-4">
            {(() => {
              const selResults = results.filter(r => r.results.some(res => res.endpoint === activePanel.endpoint && !res.error));
              const apiDatas = selResults.map(r => ({
                id: r.txnId,
                data: r.results.find(res => res.endpoint === activePanel.endpoint)?.data
              }));
              return (
                <ComparisonView sources={apiDatas} endpoint={activePanel.endpoint}
                  showOnlyDiffs={showOnlyDiffs} onDiffCountChange={setDiffCount} />
              );
            })()}
          </div>
        )}
      </div>
    )
  } : null;

  return (
    <div className="h-full w-full bg-background overflow-hidden flex flex-col">
      {/* Page Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b border-border/40 bg-card/20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Underwriting API Tools</h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Explore the configurations, definitions, and logic driving our intelligent underwriting assistance system.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="h-10 px-5 gap-2 rounded-xl border-border/60 hover:border-primary/40 hover:bg-primary/5 font-semibold bg-background/50"
                  onClick={() => {
                    if (uploadedTools) {
                      setUploadedTools(null);
                      setSelectedToolId(null);
                    } else {
                      setIsUploadDialogOpen(true);
                    }
                  }}
                >
                  <Upload className="w-4 h-4" />
                  {uploadedTools ? "Reset Tools" : "Upload OpenAPI JSON"}
                </Button>
                <Button
                  variant="outline"
                  className="h-10 px-5 gap-2 rounded-xl border-border/60 hover:border-emerald-400/40 hover:bg-emerald-400/5 hover:text-emerald-400 font-semibold bg-background/50"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4" />
                  Export Tools JSON
                </Button>
              </div>
              {uploadedTools && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold animate-in fade-in zoom-in duration-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pricing tool has been added
                </div>
              )}
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex items-center gap-3 p-1 bg-secondary/30 rounded-xl w-fit border border-border/40">
            <Button
              variant={activeTab === 'description' ? "default" : "ghost"}
              onClick={() => setActiveTab('description')}
              className={cn("h-10 px-6 rounded-lg gap-2 font-bold transition-all",
                activeTab === 'description' ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground")}
            >
              <Layout className="w-4 h-4" />
              Tool Description
            </Button>
            <Button
              variant={activeTab === 'playground' ? "default" : "ghost"}
              onClick={() => setActiveTab('playground')}
              className={cn("h-10 px-6 rounded-lg gap-2 font-bold transition-all",
                activeTab === 'playground' ? "shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground")}
            >
              <TerminalIcon className="w-4 h-4" />
              Tool Playground
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'description' ? (
          <SplitPanelWrapper
            listPane={descriptionListContent}
            detail={descriptionDetailPanel}
            listPaneClassName="overflow-y-auto custom-scrollbar h-full bg-background/5"
          />
        ) : (
          <SplitPanelWrapper
            listPane={playgroundListContent}
            detail={playgroundDetailPanel}
            listPaneClassName="overflow-y-auto custom-scrollbar h-full bg-background/5"
          />
        )}
      </div>

      {/* Dialog for Uploading */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-6 border-none shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">Upload Tool Definitions</DialogTitle>
          </DialogHeader>
          <UploadZone onUpload={(tools) => {
            setUploadedTools(tools);
            setIsUploadDialogOpen(false);
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
