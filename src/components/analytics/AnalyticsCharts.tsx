import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";
import type { DashboardData } from "./types";
import { Activity, BarChart2, Calendar, FileText, HeartPulse } from "lucide-react";

interface AnalyticsChartsProps {
  data: DashboardData;
}

const LATENCY_BUCKETS = ["0-5s", "5-10s", "10-15s", "15-20s", "20s+"];

const ChartSection = ({ title, icon: Icon, children, colorClass }: { title: string; icon: any; children: React.ReactNode; colorClass?: string }) => (
  <div className="bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-border/80 transition-all duration-500 hover:shadow-md">
    <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full blur-3xl opacity-10 transition-opacity duration-500 group-hover:opacity-20 ${colorClass}`} />
    
    <div className="flex items-center gap-2 mb-6 relative z-10">
      <div className={`p-1.5 rounded-lg bg-background border border-border/50 shadow-sm ${colorClass}`}>
        <Icon size={14} />
      </div>
      <div className="text-[11px] tracking-widest text-foreground uppercase font-bold">{title}</div>
    </div>
    
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl backdrop-saturate-200">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-bold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ data }: AnalyticsChartsProps) => {
  console.log("Rendering AnalyticsCharts with data:", data);

  const timeSeriesData = (data.time_series || []).map((d) => ({ date: d.date, count: d.count }));
  const queriesPerUser = (data.q_per_user || []).map((d) => ({
    name: d.user.split("@")[0],
    count: d.count,
  }));

  const latencyData = LATENCY_BUCKETS.map((b) => ({ bucket: b, count: data.latency_buckets?.[b] || 0 }));

  const wordBucketCounts = data.word_bucket_counts || {};
  const wordData = Object.entries(wordBucketCounts).map(([bucket, count]) => ({
    bucket,
    count: count as number,
  }));

  const feedbackData = (data.user_accuracy || []).map((u) => ({
    name: u.user.split("@")[0],
    like: u.like,
    dislike: u.dislike,
  }));

  const gridStroke = "hsl(var(--border))";
  const textStroke = "hsl(var(--muted-foreground))";

  return (
    <div className="flex flex-col gap-6">
      
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection title="Response Latency Distribution" icon={Activity} colorClass="text-amber-500 bg-amber-500">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Bar dataKey="count" name="Queries" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Queries per User" icon={BarChart2} colorClass="text-blue-500 bg-blue-500">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={queriesPerUser} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Bar dataKey="count" name="Queries" fill="#3b82f6" radius={[6, 6, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSection title="Queries Per Day" icon={Calendar} colorClass="text-indigo-500 bg-indigo-500">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Queries" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" activeDot={{ r: 6, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Response Word Count" icon={FileText} colorClass="text-violet-500 bg-violet-500">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={wordData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="bucket" tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
              <Bar dataKey="count" name="Responses" fill="#8b5cf6" radius={[6, 6, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1">
        <ChartSection title="User Feedback Ratio" icon={HeartPulse} colorClass="text-teal-500 bg-teal-500">
          {feedbackData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[260px] text-muted-foreground border border-dashed border-border/50 rounded-xl bg-muted/20">
              <HeartPulse className="mb-2 opacity-50" size={24} />
              <span className="text-xs uppercase tracking-wider font-bold">No rated queries</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feedbackData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke={textStroke} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="like" name="👍 Positive" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.9} stackId="a" />
                <Bar dataKey="dislike" name="👎 Negative" fill="#f43f5e" radius={[4, 4, 0, 0]} opacity={0.9} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>
    </div>
  );
};

export default AnalyticsCharts;