import { useState } from "react";
import FilterBar from "@/components/analytics/FilterBar";
import ChatOverview from "@/components/analytics/ChatOverview";
import QueryAnalytics from "@/components/analytics/QueryAnalytics";
import FaqAnalytics from "@/components/analytics/FaqAnalytics";
import type { DashboardData, FilterState } from "@/components/analytics/types";

const API_BASE = "http://127.0.0.1:8000/api";

const ChatAnalytics = () => {
  const [data, setData] = useState<DashboardData | null>(() => {
    const saved = localStorage.getItem("analytics_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "query" | "faq">(() => {
    const saved = localStorage.getItem("analytics_active_tab");
    return (saved as any) || "overview";
  });
  
  const [persistedFilters, setPersistedFilters] = useState<FilterState | undefined>(() => {
    const saved = localStorage.getItem("analytics_filters");
    return saved ? JSON.parse(saved) : undefined;
  });

  const handleApply = async (filters: FilterState) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/dashboard?start_date=${filters.startDate}&end_date=${filters.endDate}&users=${encodeURIComponent(filters.users)}&tenants=${encodeURIComponent(filters.tenants)}&quick_range=${filters.quickRange}&env=${filters.env}`;
      const r = await fetch(url);
      const ct = r.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await r.text();
        throw new Error("Non-JSON response: " + txt.slice(0, 200));
      }
      const d = await r.json();
      console.log("Received data:", d);
      setData(d);
      localStorage.setItem("analytics_data", JSON.stringify(d));
      localStorage.setItem("analytics_filters", JSON.stringify(filters));
      setPersistedFilters(filters);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "query", label: "Query Analytics" },
    { id: "faq", label: "FAQ Analytics" },
  ] as const;

  const handleTabChange = (id: "overview" | "query" | "faq") => {
    setActiveTab(id);
    localStorage.setItem("analytics_active_tab", id);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <FilterBar onApply={handleApply} initialFilters={persistedFilters} />
      
      {/* Sub-nav */}
      <div className="flex items-center gap-1 px-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 transition-all duration-300">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={`px-4 py-3 text-[11px] font-mono uppercase tracking-widest transition-all duration-300 relative ${
              activeTab === tab.id 
                ? "text-primary font-bold" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar transition-all duration-500">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
             <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Fetching Analytics…</div>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 border border-destructive/20 rounded-2xl">
            <div className="text-sm font-mono text-destructive uppercase tracking-widest mb-1">Data Error</div>
            <div className="text-xs text-muted-foreground">{error}</div>
            <button onClick={() => setData(null)} className="mt-4 text-[11px] font-mono px-3 py-1.5 rounded-md bg-destructive border border-destructive/30 text-white hover:opacity-90">Dismiss</button>
          </div>
        )}
        {!loading && !error && !data && (
           <div className="flex flex-col items-center justify-center py-24 bg-card/30 rounded-2xl border border-dashed border-border/50">
             <div className="text-sm font-mono text-muted-foreground uppercase tracking-widest animate-pulse">Dashboard inactive</div>
             <div className="text-[10px] text-muted-foreground/60 mt-2 italic">Select filters and click apply to generate insights</div>
           </div>
        )}
        {!loading && !error && data && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col flex-1 min-h-0">
            {activeTab === "overview" && <ChatOverview data={data} />}
            {activeTab === "query" && <QueryAnalytics data={data} />}
            {activeTab === "faq" && <FaqAnalytics />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatAnalytics;