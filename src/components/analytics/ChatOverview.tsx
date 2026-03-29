import React from "react";
import KpiCards from "./KpiCards";
import CostPanel from "./CostPanel";
import AnalyticsCharts from "./AnalyticsCharts";
import QueryDetail from "./QueryDetail";
import type { DashboardData } from "./types";

const ChatOverview = ({ data }: { data: DashboardData }) => {
  return (
    <>
      <KpiCards data={data} />
      <CostPanel data={data} />
      <AnalyticsCharts data={data} />
    </>
  );
};

export default ChatOverview;
