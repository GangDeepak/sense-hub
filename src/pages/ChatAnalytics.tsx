import { useState } from "react";
import FilterBar from "@/components/analytics/FilterBar";
import KpiCards from "@/components/analytics/KpiCards";
import AnalyticsCharts from "@/components/analytics/AnalyticsCharts";
import CostPanel from "@/components/analytics/CostPanel";
import QueryDetail from "@/components/analytics/QueryDetail";
import type { DashboardData, FilterState } from "@/components/analytics/types";

const API_BASE = "http://localhost:8000/api";

const ChatAnalytics = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FilterBar onApply={handleApply} />
      <div className="flex-1 p-5 flex flex-col gap-4 overflow-y-auto bg-background">
        {loading && (
          <div className="text-center py-16 text-primary text-sm tracking-wider">Loading data…</div>
        )}
        {error && (
          <div className="text-center py-16 text-destructive text-sm">Error: {error}</div>
        )}
        {!loading && !error && !data && (
          <div className="text-center py-16 text-muted-foreground text-sm tracking-wider">Click Apply to load dashboard data</div>
        )}
        {!loading && !error && data && (
          <>
            <KpiCards data={data} />
            <CostPanel data={data} />
            <AnalyticsCharts data={data} />
            <QueryDetail data={data} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatAnalytics;
