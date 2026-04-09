import type { DashboardData } from "./types";
import { Users, MessageSquareText, ThumbsUp, Timer, ChevronRight } from "lucide-react";

interface KpiCardsProps {
  data: DashboardData;
}

const StatCard = ({ title, value, icon: Icon, colorClass, gradientClass, children }: any) => (
  <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md hover:-translate-y-0.5">
    <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${gradientClass}`} />
    
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="text-[11px] tracking-widest text-muted-foreground uppercase font-bold">{title}</div>
      <div className={`p-2 rounded-xl bg-background/50 border border-border/50 shadow-sm backdrop-blur-md ${colorClass}`}>
        <Icon size={16} />
      </div>
    </div>
    
    <div className="relative z-10">
       <div className={`text-4xl font-extrabold tracking-tight mb-4 ${colorClass}`}>{value}</div>
       <div className="flex flex-col gap-2">
         {children}
       </div>
    </div>
  </div>
);

const KpiCards = ({ data }: KpiCardsProps) => {
  const qs = data.q_stats || { min_per_user: 0, avg_per_user: 0, max_per_user: 0, min_per_session: 0, avg_per_session: 0, max_per_session: 0 };
  const rt = data.response_time || { avg: 0, per_user: { min: 0, avg: 0, max: 0 }, per_session: { min: 0, avg: 0, max: 0 } };
  const totalRated = (data.overall_accuracy?.[0]?.value || 0) + (data.overall_accuracy?.[1]?.value || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Users */}
      <StatCard 
        title="Total Users" 
        value={data.total_users || 0} 
        icon={Users} 
        colorClass="text-blue-500" 
        gradientClass="bg-blue-500"
      >
        <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <span className="font-medium">@velocityrisk.com</span>
          <span className="font-bold">{data.velocity_count || 0}</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20">
          <span className="font-medium">@bluepond.ai</span>
          <span className="font-bold">{data.bluepond_count || 0}</span>
        </div>
      </StatCard>

      {/* Total Queries */}
      <StatCard 
        title="Total Queries" 
        value={data.total_queries || 0} 
        icon={MessageSquareText} 
        colorClass="text-indigo-500" 
        gradientClass="bg-indigo-500"
      >
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1 mb-0.5 flex items-center gap-1">
          <ChevronRight size={10} className="text-indigo-500" /> Per User
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[["Min", qs.min_per_user], ["Avg", qs.avg_per_user], ["Max", qs.max_per_user]].map(([l, v]) => (
            <div key={l as string} className="flex flex-col items-center p-1.5 rounded-md bg-secondary/50 border border-border/50">
              <span className="text-[9px] text-muted-foreground uppercase">{l}</span>
              <span className="text-xs font-bold text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </StatCard>

      {/* Feedback */}
      <StatCard 
        title="Feedback Rate" 
        value={totalRated} 
        icon={ThumbsUp} 
        colorClass="text-teal-500" 
        gradientClass="bg-teal-500"
      >
        <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-teal-500/10 text-teal-600 border border-teal-500/20">
          <span className="font-medium">👍 Positive</span>
          <span className="font-bold">{data.overall_accuracy?.[0]?.value || 0}</span>
        </div>
        <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <span className="font-medium">👎 Negative</span>
          <span className="font-bold">{data.overall_accuracy?.[1]?.value || 0}</span>
        </div>
        <div className="flex justify-end pr-1 opacity-60">
           <span className="text-[9px] text-muted-foreground">— No Feedback: {data.overall_accuracy?.[2]?.value || 0}</span>
        </div>
      </StatCard>

      {/* Median Response Time */}
      <StatCard 
        title="Avg Latency" 
        value={`${rt.avg}s`} 
        icon={Timer} 
        colorClass="text-amber-500" 
        gradientClass="bg-amber-500"
      >
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1 mb-0.5 flex items-center gap-1">
          <ChevronRight size={10} className="text-amber-500" /> Per User
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[["Min", rt.per_user.min], ["Avg", rt.per_user.avg], ["Max", rt.per_user.max]].map(([l, v]) => (
             <div key={l as string} className="flex flex-col items-center p-1.5 rounded-md bg-secondary/50 border border-border/50">
              <span className="text-[9px] text-muted-foreground uppercase">{l}</span>
              <span className="text-xs font-bold text-foreground">{v}s</span>
            </div>
          ))}
        </div>
      </StatCard>
    </div>
  );
};

export default KpiCards;
