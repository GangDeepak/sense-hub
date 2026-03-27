import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardData, QueryItem, SenseDevUser } from "./types";

interface QueryDetailProps {
  data: DashboardData;
}

const BUCKETS = ["0-5s", "5-10s", "10-15s", "15-20s", "20s+"] as const;

const Badge = ({ rating }: { rating?: string | null }) => {
  if (rating === "like") return <span className="inline-block px-2 py-0.5 rounded text-[9px] tracking-wider uppercase font-bold bg-green-100 border border-green-300 text-green-700">👍 Like</span>;
  if (rating === "dislike") return <span className="inline-block px-2 py-0.5 rounded text-[9px] tracking-wider uppercase font-bold bg-red-100 border border-red-300 text-red-700">👎 Dislike</span>;
  return <span className="inline-block px-2 py-0.5 rounded text-[9px] tracking-wider uppercase font-bold bg-secondary border border-border text-muted-foreground">No Rating</span>;
};

const QueryCard = ({ q, showElapsed }: { q: QueryItem; showElapsed: boolean }) => {
  const [showModuleOutputs, setShowModuleOutputs] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const mt = q.meta_total || {};

  return (
    <div className="bg-card border border-border rounded-lg p-3.5 text-xs leading-relaxed shadow-sm">
      <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Ref ID</span><span className="text-primary font-mono text-[10px]">{q.ref_id}</span></div>
      {q.query_id && <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Query ID</span><span className="text-foreground font-mono text-[10px]">{q.query_id}</span></div>}
      <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Session Date</span><span className="text-[10px]">{q.session_created || "—"}</span></div>
      {showElapsed && q.elapsed_s != null && <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Elapsed</span><span className="text-amber-600 font-semibold">{q.elapsed_s}s</span></div>}
      <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Query</span><span className="text-primary font-medium break-words">{q.query}</span></div>
      <div className="flex gap-2 mb-1">
        <span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Response</span>
        <div className="flex-1 bg-secondary border border-border rounded p-2.5 text-[11px] leading-relaxed max-h-[220px] overflow-y-auto">{q.response_data || <em className="text-muted-foreground">empty</em>}</div>
      </div>
      <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Rating</span><Badge rating={q.rating} /></div>
      {q.comment && <div className="flex gap-2 mb-1"><span className="text-[9px] tracking-wider text-muted-foreground uppercase font-semibold min-w-[110px]">Comment</span><span className="italic text-muted-foreground">"{q.comment}"</span></div>}

      {Object.keys(mt).length > 0 && (
        <div className="grid grid-cols-5 gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-md mt-2">
          {mt.total_latency != null && <div className="bg-card border border-border rounded p-2 text-center border-t-2 border-t-primary"><div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">Total Latency</div><div className="text-[15px] font-bold text-primary">{mt.total_latency}<span className="text-[8px] text-muted-foreground">s</span></div></div>}
          {mt.total_cost != null && <div className="bg-card border border-border rounded p-2 text-center border-t-2 border-t-green-600"><div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">Total Cost</div><div className="text-[15px] font-bold text-green-600">${mt.total_cost}</div></div>}
          {mt.total_llm_latency != null && <div className="bg-card border border-border rounded p-2 text-center border-t-2 border-t-primary"><div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">LLM Latency</div><div className="text-[15px] font-bold text-primary">{mt.total_llm_latency}<span className="text-[8px] text-muted-foreground">s</span></div></div>}
          {mt.total_compute_time != null && <div className="bg-card border border-border rounded p-2 text-center border-t-2 border-t-primary"><div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">Compute Time</div><div className="text-[15px] font-bold text-primary">{mt.total_compute_time}<span className="text-[8px] text-muted-foreground">s</span></div></div>}
          {mt.first_token_seconds != null && <div className="bg-card border border-border rounded p-2 text-center border-t-2 border-t-primary"><div className="text-[8px] text-muted-foreground font-bold uppercase mb-1">First Token</div><div className="text-[15px] font-bold text-primary">{mt.first_token_seconds}<span className="text-[8px] text-muted-foreground">s</span></div></div>}
        </div>
      )}

      {q.module_outputs && Object.keys(q.module_outputs).length > 0 && (
        <div className="mt-2 border border-border rounded-md overflow-hidden">
          <button onClick={() => setShowModuleOutputs(!showModuleOutputs)} className="w-full text-left text-[10px] font-bold text-white bg-primary px-3 py-1.5 tracking-wider uppercase hover:opacity-90">
            ▶ Module Outputs
          </button>
          {showModuleOutputs && (
            <pre className="bg-muted p-3 text-[10px] leading-relaxed overflow-auto max-h-[280px] font-mono">
              {JSON.stringify(q.module_outputs, null, 2)}
            </pre>
          )}
        </div>
      )}

      {q.metadata && Object.keys(q.metadata).length > 0 && (
        <div className="mt-2 border border-border rounded-md overflow-hidden">
          <button onClick={() => setShowMetadata(!showMetadata)} className="w-full text-left text-[10px] font-bold text-white bg-foreground px-3 py-1.5 tracking-wider uppercase hover:opacity-90">
            ▶ Metadata
          </button>
          {showMetadata && (
            <pre className="bg-muted p-3 text-[10px] leading-relaxed overflow-auto max-h-[280px] font-mono">
              {JSON.stringify(q.metadata, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const StatMini = ({ label, value, unit, color = "text-primary" }: { label: string; value: number; unit?: string; color?: string }) => (
  <div className="bg-card border border-border rounded-md p-2 text-center border-t-2 border-t-primary">
    <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-base font-bold ${color}`}>{value}{unit && <span className="text-[8px] text-muted-foreground">{unit}</span>}</div>
  </div>
);

const SpendVsResp = ({ svr }: { svr: NonNullable<SenseDevUser["spend_vs_resp"]> }) => {
  const ss = svr.spend_stats || { min: 0, median: 0, max: 0 };
  const rs = svr.resp_len_stats || { min: 0, median: 0, max: 0 };
  const sqs = svr.sess_q_stats || { min: 0, median: 0, max: 0 };
  const raw = svr.raw || [];
  const splot = svr.sess_plot || [];

  const spendData = raw.map((r, i) => ({ name: `Q${i + 1}`, value: r.spend_s }));
  const respData = raw.map((r, i) => ({ name: `Q${i + 1}`, value: r.resp_len }));
  const sessData = splot.map((s) => ({ name: s.session, count: s.count }));

  return (
    <div className="p-3">
      <div className="text-[9px] text-primary font-bold tracking-wider uppercase mb-1.5">Time to Feedback (s)</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatMini label="Min" value={ss.min} unit="s" />
        <StatMini label="Median" value={ss.median} unit="s" />
        <StatMini label="Max" value={ss.max} unit="s" />
      </div>
      <div className="text-[9px] text-green-600 font-bold tracking-wider uppercase mb-1.5">Response Length (chars)</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatMini label="Min" value={rs.min} unit="ch" color="text-green-600" />
        <StatMini label="Median" value={rs.median} unit="ch" color="text-green-600" />
        <StatMini label="Max" value={rs.max} unit="ch" color="text-green-600" />
      </div>
      <div className="text-[9px] text-foreground font-bold tracking-wider uppercase mb-1.5">Queries per Session</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <StatMini label="Min" value={sqs.min} color="text-foreground" />
        <StatMini label="Median" value={sqs.median} color="text-foreground" />
        <StatMini label="Max" value={sqs.max} color="text-foreground" />
      </div>
      {raw.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="bg-secondary border border-border rounded-lg p-3">
            <div className="text-[10px] uppercase font-bold mb-2">Spend Time / Query (s)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="value" fill="hsl(36 92% 50%)" radius={[3, 3, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-secondary border border-border rounded-lg p-3">
            <div className="text-[10px] uppercase font-bold mb-2">Response Length / Query (chars)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={respData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 8 }} />
                <YAxis tick={{ fontSize: 8 }} />
                <Tooltip contentStyle={{ fontSize: 10 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {sessData.length > 0 && (
        <div className="bg-secondary border border-border rounded-lg p-3 mt-3">
          <div className="text-[10px] uppercase font-bold mb-2">Queries per Session</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={sessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 8 }} />
              <YAxis tick={{ fontSize: 8 }} />
              <Tooltip contentStyle={{ fontSize: 10 }} />
              <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const QueryDetail = ({ data }: QueryDetailProps) => {
  const senseDev = data.sense_dev || {};
  const uids = Object.keys(senseDev);

  if (!uids.length) return <div className="text-center py-6 text-muted-foreground text-xs">No data in selected range</div>;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-[hsl(213,50%,24%)] to-[hsl(var(--primary))] px-5 py-3.5 flex items-center gap-3">
        <span className="text-base">🔍</span>
        <span className="text-xs tracking-[2px] text-white uppercase font-bold">Zoom-In · Query Detail</span>
      </div>
      <div className="bg-secondary p-3">
        <Accordion type="multiple" defaultValue={uids.length ? [uids[0]] : []}>
          {uids.map((uid, ui) => {
            const ud = senseDev[uid];
            return (
              <AccordionItem key={uid} value={uid} className="border border-border rounded-lg mb-1.5 bg-card overflow-hidden">
                <AccordionTrigger className="px-3.5 py-2.5 text-xs hover:bg-blue-50">
                  <span className="text-primary font-bold text-[13px]">◆ {uid}</span>
                </AccordionTrigger>
                <AccordionContent className="p-2.5">
                  <Accordion type="multiple">
                    {/* Time Elapsed */}
                    <AccordionItem value="time-elapsed" className="border border-border rounded-lg mb-1.5 bg-card">
                      <AccordionTrigger className="px-3.5 py-2 text-[11px] font-semibold hover:bg-blue-50">
                        ⏱ TIME ELAPSED
                      </AccordionTrigger>
                      <AccordionContent className="p-2">
                        <Accordion type="multiple">
                          {BUCKETS.map((b) => {
                            const items = (ud as any)?.[b] || [];
                            return (
                              <AccordionItem key={b} value={b} className="border border-border rounded-lg mb-1 bg-card">
                                <AccordionTrigger className="px-3 py-1.5 text-[11px] hover:bg-blue-50">
                                  <span className="text-amber-600 font-semibold">▶ {b}</span>
                                  <span className="text-[9px] text-muted-foreground ml-2">{items.length} queries</span>
                                </AccordionTrigger>
                                <AccordionContent className="p-2.5">
                                  {items.length === 0 ? (
                                    <div className="text-center py-4 text-muted-foreground text-xs">No queries in this bucket</div>
                                  ) : (
                                    <div className="flex flex-col gap-2.5">
                                      {items.map((q: QueryItem, i: number) => <QueryCard key={i} q={q} showElapsed />)}
                                    </div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Empty Response */}
                    <AccordionItem value="empty" className="border border-border rounded-lg mb-1.5 bg-card">
                      <AccordionTrigger className="px-3.5 py-2 text-[11px] font-semibold hover:bg-blue-50">
                        ⚠ EMPTY RESPONSE
                        <span className="text-[9px] text-destructive ml-2">{(ud.empty || []).length} queries</span>
                      </AccordionTrigger>
                      <AccordionContent className="p-2.5">
                        {!(ud.empty || []).length ? (
                          <div className="text-center py-4 text-muted-foreground text-xs">No empty responses ✓</div>
                        ) : (
                          <div className="flex flex-col gap-2.5">
                            {(ud.empty || []).map((q: QueryItem, i: number) => <QueryCard key={i} q={q} showElapsed={false} />)}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Spend vs Resp */}
                    <AccordionItem value="spend" className="border border-border rounded-lg mb-1.5 bg-card">
                      <AccordionTrigger className="px-3.5 py-2 text-[11px] font-semibold hover:bg-blue-50">
                        📊 SPEND TIME vs RESPONSE LENGTH vs QUERIES/SESSION
                      </AccordionTrigger>
                      <AccordionContent>
                        {ud.spend_vs_resp && (ud.spend_vs_resp.raw || []).length > 0 ? (
                          <SpendVsResp svr={ud.spend_vs_resp} userId={ui} />
                        ) : (
                          <div className="text-center py-4 text-muted-foreground text-xs">Insufficient data</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
};

export default QueryDetail;
