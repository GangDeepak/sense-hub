import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { BASE_URL, QUERY_COLLECTIONS, KNOWLEDGE_COLLECTIONS, normalise } from "./types";
import type { QueryRecord, KnowledgeRecord } from "./types";
import { getAuthHeaders } from "@/utils/token";
import OverviewTab from "./OverviewTab";
import QueriesTab from "./QueriesTab";
import KnowledgesTab from "./KnowledgesTab";

const GroundingModule = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "queries" | "knowledges">("overview");
  const [queryCollection, setQueryCollection] = useState("query_memory");
  const [knowledgeCollection, setKnowledgeCollection] = useState("knowledge_memory");

  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [knowledges, setKnowledges] = useState<KnowledgeRecord[]>([]);
  const [queryCount, setQueryCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [queryLoading, setQueryLoading] = useState(false);
  const [knowledgeLoading, setKnowledgeLoading] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [knowledgeError, setKnowledgeError] = useState<string | null>(null);
  const [highlightKid, setHighlightKid] = useState<string | null>(null);
  const [highlightQueryKid, setHighlightQueryKid] = useState<string | null>(null);

  const loadQueries = useCallback(async (col?: string) => {
    const c = col || queryCollection;
    setQueryLoading(true);
    setQueryError(null);
    try {
      const res = await fetch(`${BASE_URL}/grounding/collection/${c}?with_vectors=false`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const data = (json.data || []).map(normalise);
      setQueries(data);
      setQueryCount(json.count ?? data.length);
    } catch (e: any) {
      setQueryError(e.message);
      setQueries([]);
    } finally {
      setQueryLoading(false);
    }
  }, [queryCollection]);

  const loadKnowledges = useCallback(async (col?: string) => {
    const c = col || knowledgeCollection;
    setKnowledgeLoading(true);
    setKnowledgeError(null);
    try {
      const res = await fetch(`${BASE_URL}/grounding/collection/${c}?with_vectors=false`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
      const json = await res.json();
      const data = (json.data || []).map(normalise);
      setKnowledges(data);
      setKnowledgeCount(json.count ?? data.length);
    } catch (e: any) {
      setKnowledgeError(e.message);
      setKnowledges([]);
    } finally {
      setKnowledgeLoading(false);
    }
  }, [knowledgeCollection]);

  useEffect(() => {
    loadQueries();
    loadKnowledges();
  }, []);

  const handleTabChange = (tab: "overview" | "queries" | "knowledges") => {
    setActiveTab(tab);
    setHighlightKid(null);
    setHighlightQueryKid(null);
  };

  const handleCollectionChange = (val: string) => {
    if (activeTab === "knowledges") {
      setKnowledgeCollection(val);
      loadKnowledges(val);
    } else {
      setQueryCollection(val);
      loadQueries(val);
    }
  };

  const handleReload = () => {
    if (activeTab === "knowledges") loadKnowledges();
    else if (activeTab === "queries") loadQueries();
    else { loadQueries(); loadKnowledges(); }
  };

  const handleDrillToKnowledge = (kid: string) => {
    setHighlightKid(kid);
    setActiveTab("knowledges");
  };

  const handleDrillToQueries = (kid: string) => {
    setHighlightQueryKid(kid);
    setActiveTab("queries");
  };

  const currentCollections = activeTab === "knowledges" ? KNOWLEDGE_COLLECTIONS : QUERY_COLLECTIONS;
  const currentCollection = activeTab === "knowledges" ? knowledgeCollection : queryCollection;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Sub-nav */}
      <div className="flex items-center gap-0.5 px-4 border-b border-border bg-card sticky top-0 z-10">
        {(["overview", "queries", "knowledges"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`text-[13px] px-3.5 py-3.5 border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab
                ? "text-foreground border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="flex-1" />

        {activeTab !== "overview" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Collection</span>
            <Select value={currentCollection} onValueChange={handleCollectionChange}>
              <SelectTrigger className="h-[26px] text-[11px] font-mono min-w-[160px] bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentCollections.map((c) => (
                  <SelectItem key={c} value={c} className="text-[11px] font-mono">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleReload}
              className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground bg-secondary border border-border rounded px-2.5 h-[26px] hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reload
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "overview" && (
          <OverviewTab
            queries={queries}
            knowledges={knowledges}
            queryCollection={queryCollection}
            knowledgeCollection={knowledgeCollection}
            queryCount={queryCount}
            knowledgeCount={knowledgeCount}
            loading={queryLoading || knowledgeLoading}
            error={queryError || knowledgeError}
            onSwitchTab={(tab) => handleTabChange(tab as any)}
            onDrillToKnowledge={handleDrillToKnowledge}
            onDrillToQueries={handleDrillToQueries}
          />
        )}
        {activeTab === "queries" && (
          <QueriesTab
            queries={queries}
            collection={queryCollection}
            loading={queryLoading}
            error={queryError}
            onReload={() => loadQueries()}
            highlightKnowledgeId={highlightQueryKid}
          />
        )}
        {activeTab === "knowledges" && (
          <KnowledgesTab
            knowledges={knowledges}
            collection={knowledgeCollection}
            loading={knowledgeLoading}
            error={knowledgeError}
            onReload={() => loadKnowledges()}
            highlightId={highlightKid}
          />
        )}
      </div>
    </div>
  );
};

export default GroundingModule;
