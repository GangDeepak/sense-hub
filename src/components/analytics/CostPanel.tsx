import type { DashboardData } from "./types";
import { CircleDollarSign, TrendingDown, TrendingUp, Minus, Calculator, Wallet } from "lucide-react";

interface CostPanelProps {
  data: DashboardData;
}

const CostMetric = ({ label, value, icon: Icon, colorClass, bgClass }: { label: string; value: string; icon: any; colorClass?: string; bgClass?: string }) => (
  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-card border border-border/60 hover:bg-muted/30 transition-colors shadow-sm group">
    <div className={`p-1.5 rounded-lg mb-2 ${bgClass || "bg-secondary"}`}>
      <Icon size={12} className={colorClass || "text-muted-foreground"} />
    </div>
    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 text-center">{label}</div>
    <div className={`text-[15px] font-extrabold ${colorClass || "text-foreground"}`}>${value}</div>
  </div>
);

const CostPanel = ({ data }: CostPanelProps) => {
  const cs = data.cost_stats || {};

  if (!cs.count) return null;

  return (
    <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md">
      <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full blur-3xl opacity-10 bg-emerald-500 group-hover:opacity-20 transition-opacity duration-500" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">

        {/* Total Cost Highlight */}
        <div className="md:col-span-1 flex flex-col justify-center border-r border-border/40 pr-4">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Wallet size={16} />
            <span className="text-[10px] tracking-widest uppercase font-bold text-muted-foreground">Total Spend</span>
          </div>
          <div className="text-4xl font-black text-emerald-500 drop-shadow-sm mb-1">${cs.total || "0"}</div>
        </div>

        {/* Breakdown Metrics */}
        <div className="md:col-span-3">
          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Overall Distribution</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <CostMetric label="Minimum" value={cs.min || "0"} icon={TrendingDown} colorClass="text-emerald-600" bgClass="bg-emerald-100 dark:bg-emerald-500/20" />
            <CostMetric label="Average" value={cs.avg || "0"} icon={Calculator} colorClass="text-blue-500" bgClass="bg-blue-100 dark:bg-blue-500/20" />
            <CostMetric label="Median" value={cs.median || "0"} icon={Minus} colorClass="text-indigo-500" bgClass="bg-indigo-100 dark:bg-indigo-500/20" />
            <CostMetric label="Maximum" value={cs.max || "0"} icon={TrendingUp} colorClass="text-rose-500" bgClass="bg-rose-100 dark:bg-rose-500/20" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CostPanel;
