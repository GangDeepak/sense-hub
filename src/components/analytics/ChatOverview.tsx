import React from "react";
import KpiCards from "./KpiCards";
import CostPanel from "./CostPanel";
import AnalyticsCharts from "./AnalyticsCharts";
import type { DashboardData } from "./types";
import { Activity, CircleDollarSign, BarChart3 } from "lucide-react";

const Section = ({ icon: Icon, title, description, children }: { icon: any, title: string, description: string, children: React.ReactNode }) => (
  <div className="flex flex-col relative before:absolute before:-inset-4 before:bg-card/20 before:rounded-3xl before:border before:border-border/30 before:-z-10 z-0">
    <div className="flex items-center gap-3 mb-5 pl-1">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-b from-primary/20 to-primary/5 border border-primary/20 text-primary shadow-[0_0_15px_rgba(59,130,246,0.2)]">
        <Icon size={16} className="drop-shadow-md" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ChatOverview = ({ data }: { data: DashboardData }) => {
  return (
    <div className="flex flex-col gap-12 px-4 py-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Key Metrics Section */}
      <Section icon={Activity} title="Key Performance Metrics" description="Overview of platform engagement, traffic totals, and feedback distribution.">
        <KpiCards data={data} />
      </Section>

      {/* Break border separating Kpi Cards from Cost Analysis to make it look cohesive, Cost Panel is already heavily styled. */}
      
      {/* Cost Analysis */}
      <Section icon={CircleDollarSign} title="Cost Analysis" description="Breakdown of API operational expenses and generation costs.">
        <CostPanel data={data} />
      </Section>

      {/* Analytics Charts */}
      <Section icon={BarChart3} title="Trends & Distribution" description="Deep dive into temporal usage patterns, latency segments, and feedback spread.">
        <AnalyticsCharts data={data} />
      </Section>

    </div>
  );
};

export default ChatOverview;
