import type { DashboardData } from "./types";

interface CostPanelProps {
  data: DashboardData;
}

const CostCard = ({ label, value, color = "text-primary" }: { label: string; value: string; color?: string }) => (
  <div className="bg-card border border-border rounded-lg p-2.5 text-center border-t-2 border-t-primary">
    <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-[15px] font-bold ${color}`}>${value}</div>
  </div>
);

const CostPanel = ({ data }: CostPanelProps) => {
  const cs = data.cost_stats || {};
  const cpu = data.cost_per_user || {};
  const cps = data.cost_per_session || {};

  if (!cs.count) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm border-t-[3px] border-t-primary">
      <div className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold mb-3.5">💰 Cost (USD)</div>

      <div className="mb-3">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Overall</div>
        <div className="grid grid-cols-5 gap-2">
          <CostCard label="Min" value={cs.min || "0"} color="text-[hsl(160,84%,39%)]" />
          <CostCard label="Avg" value={cs.avg || "0"} />
          <CostCard label="Median" value={cs.median || "0"} />
          <CostCard label="Max" value={cs.max || "0"} color="text-destructive" />
          <CostCard label="Total" value={cs.total || "0"} color="text-[hsl(263,70%,58%)]" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1.5">Per User</div>
          {cpu.min ? (
            <div className="grid grid-cols-3 gap-2">
              <CostCard label="Min" value={cpu.min} color="text-[hsl(160,84%,39%)]" />
              <CostCard label="Median" value={cpu.median || "0"} />
              <CostCard label="Max" value={cpu.max || "0"} color="text-destructive" />
            </div>
          ) : (
            <div className="text-muted-foreground text-[11px] p-2">No data</div>
          )}
        </div>
        <div>
          <div className="text-[9px] font-bold text-primary uppercase tracking-wider mb-1.5">Per Session</div>
          {cps.min ? (
            <div className="grid grid-cols-3 gap-2">
              <CostCard label="Min" value={cps.min} color="text-[hsl(160,84%,39%)]" />
              <CostCard label="Median" value={cps.median || "0"} />
              <CostCard label="Max" value={cps.max || "0"} color="text-destructive" />
            </div>
          ) : (
            <div className="text-muted-foreground text-[11px] p-2">No data</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostPanel;
