import React, { useState, useMemo, useEffect } from 'react';
import { Database, Search, Loader2, AlertCircle, ChevronDown, ChevronRight, Copy, Terminal, History, ArrowRightLeft, Eye, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fetchTxnData, TxnResult, API_ENDPOINTS } from "@/utils/apiDataService";
import { ComparisonView } from "./ComparisonView";
import { cn } from "@/lib/utils";
import { SplitPanelWrapper } from "../grounding/SplitDetailPanel";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function ApiDataManager() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TxnResult[]>([]);
  const [activePanel, setActivePanel] = useState<{
    mode: 'raw' | 'compare';
    endpoint: string;
    txnId?: string;
  } | null>(null);

  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false);
  const [diffCount, setDiffCount] = useState(0);

  // Reset diffCount when panel changes
  useEffect(() => {
    setDiffCount(0);
  }, [activePanel?.endpoint]);

  const { toast } = useToast();

  const handleFetch = async () => {
    const ids = input.split(/[\n,]+/).map(id => id.trim()).filter(id => id.length > 0);
    if (ids.length === 0) {
      toast({ title: "No IDs", description: "Please enter at least one txn_id", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResults([]);
    try {
      const allResults: TxnResult[] = [];
      for (const id of ids) {
        const res = await fetchTxnData(id);
        allResults.push(res);
      }
      setResults(allResults);
      toast({ title: "Success", description: `Fetched data for ${allResults.length} transaction(s)` });
    } catch (err: any) {
      toast({ title: "Fetch Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const listPane = (
    <div className="flex flex-col gap-6 p-6 pb-20 max-w-7xl mx-auto w-full">
      {/* Input Section */}
      <Card className="border-border/40 shadow-sm bg-card/60 backdrop-blur-sm overflow-hidden border-2">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold">API Data Retrieval</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction IDs</span>
              <span className="text-[10px] text-muted-foreground">Separate IDs with commas or new lines</span>
            </div>
            <Textarea
              placeholder="e.g. fe894b24-c655-4345-ab14-3ce82af80ded"
              className="min-h-[100px] font-mono text-xs bg-secondary/20 resize-none border-2 focus:border-primary/40 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Button
            className="w-full sm:w-auto min-w-[140px] gap-2 shadow-lg shadow-primary/20"
            onClick={handleFetch}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Fetching Data..." : "Retrieve API Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold flex items-center gap-2 text-foreground/70">
              <History className="w-4 h-4 text-muted-foreground" />
              Retrieved Endpoints
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {API_ENDPOINTS.map((endpoint) => {
              const endpointResults = results.filter(r =>
                r.results.some(res => res.endpoint === endpoint && !res.error)
              );

              if (endpointResults.length === 0) return null;

              return (
                <Card key={endpoint} className="border-border/40 bg-card/40 hover:bg-card/60 transition-all border-2 group shadow-sm">
                  <CardHeader className="p-4 border-b border-border/10 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                          {formatEndpointName(endpoint)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 px-2 text-[9px] gap-1 transition-all",
                          activePanel?.endpoint === endpoint && activePanel?.mode === 'compare'
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10 hover:text-primary text-muted-foreground border border-transparent hover:border-primary/20"
                        )}
                        onClick={() => setActivePanel({ mode: 'compare', endpoint })}
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        Compare
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                      {endpointResults.map((res) => (
                        <div
                          key={res.txnId}
                          className={cn(
                            "flex items-center justify-between p-3 transition-colors cursor-pointer group/row",
                            activePanel?.txnId === res.txnId && activePanel?.endpoint === endpoint && activePanel?.mode === 'raw'
                              ? "bg-primary/10 text-primary border-l-2 border-primary"
                              : "hover:bg-primary/5 text-muted-foreground"
                          )}
                          onClick={() => setActivePanel({ mode: 'raw', endpoint, txnId: res.txnId })}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <code className="text-[10px] font-mono font-medium truncate">
                              {res.txnId}
                            </code>
                          </div>
                          <Eye className="w-3 h-3 opacity-0 group-hover/row:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const detailPanel = activePanel ? {
    header: (
      <div className="flex flex-col w-full p-4 border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
              {activePanel.mode === 'raw' ? <Eye className="w-4 h-4 text-primary" /> : <ArrowRightLeft className="w-4 h-4 text-primary" />}
            </div>

            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold leading-none whitespace-nowrap">
                {activePanel.mode === 'raw' ? 'Raw Result' : 'Advanced Schema Analysis'}
              </h3>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest font-mono text-primary/70 truncate opacity-80">
                  {activePanel.mode === 'raw'
                    ? `— ${formatEndpointName(activePanel.endpoint)}`
                    : `Analyzed ${results.filter(r => r.results.some(res => res.endpoint === activePanel.endpoint && !res.error)).length} Transactions for ${formatEndpointName(activePanel.endpoint)}`
                  }
                </span>
                {activePanel.txnId && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <code className="text-[10px] font-mono font-bold text-muted-foreground">{activePanel.txnId}</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {activePanel.mode === 'compare' && (
              <div className="flex items-center gap-3 px-3 py-1 bg-secondary/40 rounded-full border border-border/40">
                <div className="flex items-center gap-2 border-r border-border/60 pr-3">
                  <Label htmlFor="diff-toggle-header" className="text-[9px] font-bold uppercase text-muted-foreground whitespace-nowrap cursor-pointer">Inconsistencies Only</Label>
                  <Switch
                    id="diff-toggle-header"
                    className="scale-75 origin-left"
                    checked={showOnlyDiffs}
                    onCheckedChange={setShowOnlyDiffs}
                  />
                </div>
                {diffCount > 0 && (
                  <Badge variant="destructive" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] h-4 font-bold py-0">
                    {diffCount} Issues
                  </Badge>
                )}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-rose-500/10 hover:text-rose-500 group"
              onClick={() => setActivePanel(null)}
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    ),
    body: (
      <div className="py-4">
        {activePanel.mode === 'raw' && activePanel.txnId ? (
          <div className="h-[calc(100vh-250px)]">
            {(() => {
              const txnRes = results.find(r => r.txnId === activePanel.txnId);
              const apiData = txnRes?.results.find(res => res.endpoint === activePanel.endpoint)?.data;
              return apiData ? <JsonView data={apiData} /> : <div className="text-center p-12 text-muted-foreground italic">No data found</div>;
            })()}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {(() => {
              const selectedResults = results.filter(r =>
                r.results.some(res => res.endpoint === activePanel.endpoint && !res.error)
              );

              const apiDatas = selectedResults.map(r => ({
                id: r.txnId,
                data: r.results.find(res => res.endpoint === activePanel.endpoint)?.data
              }));

              return (
                <ComparisonView
                  sources={apiDatas}
                  endpoint={activePanel.endpoint}
                  showOnlyDiffs={showOnlyDiffs}
                  onDiffCountChange={setDiffCount}
                />
              );
            })()}
          </div>
        )}
      </div>
    )
  } : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden h-full">
      <SplitPanelWrapper
        listPane={listPane}
        detail={detailPanel}
        listPaneClassName="overflow-y-auto custom-scrollbar h-full"
      />
    </div>
  );
}
