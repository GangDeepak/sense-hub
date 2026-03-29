import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { DashboardData } from "./types";

interface AnalyticsChartsProps {
  data: DashboardData;
}

const LATENCY_BUCKETS = ["0-5s", "5-10s", "10-15s", "15-20s", "20s+"];

const ChartSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-secondary border border-border rounded-lg p-3.5">
    <div className="text-[10px] tracking-wider text-foreground uppercase font-bold mb-2.5">{title}</div>
    {children}
  </div>
);

const AnalyticsCharts = ({ data }: AnalyticsChartsProps) => {
  console.log("Rendering AnalyticsCharts with data:", data);

  // ✅ Fix 1: API returns q_per_user, not queries_per_user
  const timeSeriesData = (data.time_series || []).map((d) => ({ date: d.date, count: d.count }));
  const queriesPerUser = (data.q_per_user || []).map((d) => ({
    name: d.user.split("@")[0],
    count: d.count,
  }));

  const latencyData = LATENCY_BUCKETS.map((b) => ({ bucket: b, count: data.latency_buckets?.[b] || 0 }));

  // ✅ Fix 2: API returns word_bucket_counts with keys like "0-20", "21-50", etc.
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

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1 */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartSection title="📅 Queries Per Day">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          {/* ✅ Fix 1: now uses q_per_user */}
          <ChartSection title="👤 Queries per User">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={queriesPerUser}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>
      </div>

      {/* Row 2 */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartSection title="⏱ Response Latency Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bucket" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          {/* ✅ Fix 2: now uses word_bucket_counts with actual keys from API */}
          <ChartSection title="📝 Response Word Count Buckets">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={wordData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="bucket" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
        </div>
      </div>

      {/* Row 3: Feedback */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <ChartSection title="👍 Like vs Dislike per User">
          {feedbackData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">No rated queries in range</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feedbackData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="like" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Bar dataKey="dislike" fill="hsl(0 84% 60%)" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>
    </div>
  );
};

export default AnalyticsCharts;