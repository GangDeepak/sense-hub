import type { DashboardData } from "./types";

interface KpiCardsProps {
  data: DashboardData;
}

const KpiCards = ({ data }: KpiCardsProps) => {
  const qs = data.q_stats || { min_per_user: 0, median_per_user: 0, max_per_user: 0, min_per_session: 0, median_per_session: 0, max_per_session: 0 };
  const rt = data.response_time || { median: 0, per_user: { min: 0, median: 0, max: 0 }, per_session: { min: 0, median: 0, max: 0 } };
  const totalRated = (data.overall_accuracy?.[0]?.value || 0) + (data.overall_accuracy?.[1]?.value || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total Users */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />
        <div className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold mb-2">Total Users</div>
        <div className="text-3xl font-bold text-primary">{data.total_users || 0}</div>
        <div className="mt-2 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 border border-blue-300 text-blue-700 w-fit">
            @velocityrisk.com <strong>{data.velocity_count || 0}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-purple-100 border border-purple-300 text-purple-700 w-fit">
            @bluepond.ai <strong>{data.bluepond_count || 0}</strong>
          </span>
        </div>
      </div>

      {/* Total Queries */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "hsl(217 91% 46%)" }} />
        <div className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold mb-2">Total Queries</div>
        <div className="text-3xl font-bold" style={{ color: "hsl(217 91% 46%)" }}>{data.total_queries || 0}</div>
        <div className="mt-2 border-t border-border pt-2">
          <div className="text-[9px] tracking-wider text-primary uppercase font-bold mb-1">Per User</div>
          {[["Min", qs.min_per_user], ["Median", qs.median_per_user], ["Max", qs.max_per_user]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between text-[11px] text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}</span></div>
          ))}
          <div className="h-px bg-border my-1.5" />
          <div className="text-[9px] tracking-wider text-primary uppercase font-bold mb-1">Per Session</div>
          {[["Min", qs.min_per_session], ["Median", qs.median_per_session], ["Max", qs.max_per_session]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between text-[11px] text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}</span></div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: "hsl(160 84% 39%)" }} />
        <div className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold mb-2">Feedback</div>
        <div className="text-3xl font-bold" style={{ color: "hsl(160 84% 39%)" }}>{totalRated}</div>
        <div className="mt-2 flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-green-100 border border-green-300 text-green-700 w-fit">
            👍 Positive <strong>{data.overall_accuracy?.[0]?.value || 0}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-red-100 border border-red-300 text-red-700 w-fit">
            👎 Negative <strong>{data.overall_accuracy?.[1]?.value || 0}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground w-fit">
            — No Feedback <strong>{data.overall_accuracy?.[2]?.value || 0}</strong>
          </span>
        </div>
      </div>

      {/* Median Response Time */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-foreground" />
        <div className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold mb-2">Median Response Time</div>
        <div className="text-3xl font-bold text-foreground">{rt.median}<span className="text-sm font-normal text-muted-foreground">s</span></div>
        <div className="mt-2 border-t border-border pt-2">
          <div className="text-[9px] tracking-wider text-muted-foreground uppercase font-bold mb-1">Per User</div>
          {[["Min", rt.per_user.min], ["Median", rt.per_user.median], ["Max", rt.per_user.max]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between text-[11px] text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}s</span></div>
          ))}
          <div className="h-px bg-border my-1.5" />
          <div className="text-[9px] tracking-wider text-muted-foreground uppercase font-bold mb-1">Per Session</div>
          {[["Min", rt.per_session.min], ["Median", rt.per_session.median], ["Max", rt.per_session.max]].map(([l, v]) => (
            <div key={l as string} className="flex justify-between text-[11px] text-muted-foreground"><span>{l}</span><span className="text-foreground font-medium">{v}s</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KpiCards;
