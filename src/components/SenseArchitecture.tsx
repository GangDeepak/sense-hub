import React from "react";

/* ------------------------------------------------------------------
   Tiny helpers
------------------------------------------------------------------ */
const Connector = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center relative z-10">
    <div className="w-px h-8 bg-border" />
    {label && (
      <span className="absolute left-3 top-3 text-[9px] font-semibold tracking-widest text-muted-foreground uppercase whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);

const Arrow = ({ label }: { label?: string }) => (
  <div className="flex flex-col items-center relative z-10">
    <div className="w-px h-6 bg-border" />
    <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px] border-t-border" />
    {label && (
      <span className="mt-1 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);

type NodeVariant = "start" | "process" | "decision" | "end";

const Node = ({
  label,
  variant = "process",
  sub,
}: {
  label: string | React.ReactNode;
  variant?: NodeVariant;
  sub?: string;
}) => {
  const styles: Record<NodeVariant, string> = {
    start:
      "bg-gradient-to-r from-green-400 to-lime-400 text-slate-900 rounded-full px-8 py-2.5 font-bold text-sm shadow-md",
    process:
      "bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 text-white rounded-xl px-6 py-3.5 font-bold text-sm shadow-lg min-w-[160px] text-center leading-snug",
    decision:
      "bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-full px-6 py-2.5 font-bold text-sm shadow-md whitespace-nowrap",
    end:
      "bg-gradient-to-r from-green-400 to-lime-400 text-slate-900 rounded-full px-8 py-2.5 font-bold text-sm shadow-md",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={styles[variant]}>{label}</div>
      {sub && <p className="mt-1 text-[9px] text-slate-400 tracking-wide text-center">{sub}</p>}
    </div>
  );
};

const DB = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <svg viewBox="0 0 32 24" className="w-8 h-6" fill="none">
      <ellipse cx="16" cy="5" rx="13" ry="4" fill="#f59e0b" />
      <rect x="3" y="5" width="26" height="12" fill="#fbbf24" />
      <ellipse cx="16" cy="17" rx="13" ry="4" fill="#f59e0b" />
    </svg>
    <span className="text-[9px] font-bold text-slate-500 text-center tracking-wide uppercase leading-tight max-w-[90px]">
      {label}
    </span>
  </div>
);

const DotLine = () => (
  <div className="flex-1 border-t border-dashed border-border mx-2 mt-2 animate-pulse" />
);

/* ------------------------------------------------------------------
   Main component
------------------------------------------------------------------ */
export const SenseArchitecture: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto py-10">
      <div className="relative mx-auto" style={{ width: "860px" }}>

        {/* ============================================================
            ROW 1  ·  User Query   +   Prompt DB (right)
        ============================================================ */}
        <div className="flex items-start justify-center gap-0 relative">
          {/* center column */}
          <div className="flex flex-col items-center">
            <Node label="USER QUERY" variant="start" />
          </div>
          {/* right side: PROMPT DB */}
          <div className="absolute right-0 top-0 flex flex-col items-center">
            <DB label="Prompt DB" />
          </div>
        </div>

        {/* ARROW */}
        <div className="flex justify-center">
          <Arrow />
        </div>

        {/* ============================================================
            ROW 2  ·  Query Rewriter  ◄---  Chat-History DB
        ============================================================ */}
        <div className="relative flex items-center justify-center">
          <Node label={<>QUERY<br />REWRITER</>} variant="process" />
          {/* Right side DB with dashed link */}
          <div className="absolute right-0 flex items-center gap-0">
            <DotLine />
            <DB label="Chat‑History" />
          </div>
        </div>

        {/* ARROW + label */}
        <div className="flex justify-center">
          <Arrow label="RQ / Rewritten Query" />
        </div>

        {/* ============================================================
            ROW 3  ·  RESOLVABLE? decision
        ============================================================ */}
        <div className="relative flex items-center justify-center">
          <Node label="RESOLVABLE?" variant="decision" />
          {/* YES label going down */}
        </div>

        {/* Split: NO → left bypass, YES → down */}
        <div className="relative flex justify-center">
          {/* vertical down (YES path) */}
          <div className="flex flex-col items-center">
            <div className="flex items-center">
              {/* NO — left bypass line */}
              <div className="flex flex-col items-end w-16 mr-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">No</span>
                <div className="w-px h-28 border-r-2 border-dashed border-slate-300 self-end" />
              </div>
              {/* YES path */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">Yes · RQ</span>
                <Arrow />
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            ROW 4  ·  Grounding Module  ◄---  Knowledge Ground Truth
        ============================================================ */}
        <div className="relative flex items-center justify-center">
          <Node label={<>GROUNDING<br />MODULE</>} variant="process" />
          <div className="absolute right-0 flex items-center">
            <DotLine />
            <DB label="Knowledge / Query Ground Truth" />
          </div>
        </div>

        <div className="flex justify-center">
          <Arrow />
        </div>

        {/* ============================================================
            ROW 5  ·  FOUND GROUND TRUTH? decision
        ============================================================ */}
        <div className="flex items-center justify-center">
          <Node label="FOUND GROUND TRUTH?" variant="decision" />
        </div>

        {/* Split NO → two branches */}
        <div className="flex justify-center mt-2 mb-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase">No ↓</span>
        </div>

        {/* ============================================================
            ROW 6  ·  Intent Engine  |  Submission Finder
        ============================================================ */}
        <div className="flex items-start justify-center gap-20">
          {/* Intent Engine */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">RQ</span>
            <Arrow />
            <Node label={<>INTENT<br />ENGINE</>} variant="process" />
          </div>
          {/* Submission Finder */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">RQ</span>
            <Arrow />
            <Node label={<>SUBMISSION<br />FINDER</>} variant="process" />
          </div>
        </div>

        {/* Converge arrows down to Task Engine */}
        <div className="relative flex justify-center mt-2">
          <div className="w-52 h-px border-t-2 border-slate-400" />
        </div>
        <div className="flex justify-center">
          <Arrow label="RQ" />
        </div>

        {/* ============================================================
            ROW 7  ·  Task Planning Engine  ↔  Execution Engine
        ============================================================ */}
        <div className="relative flex items-center justify-center gap-12">
          {/* Task Planning */}
          <Node label={<>TASK PLANNING<br />ENGINE</>} variant="process" />

          {/* Bidirectional arrows & labels */}
          <div className="flex flex-col items-center text-[9px] font-bold text-slate-500 gap-1">
            <span>PAYLOAD →</span>
            <div className="flex gap-1">
              <div className="w-10 h-0.5 bg-cyan-500" />
              <div className="w-10 h-0.5 bg-cyan-500" />
            </div>
            <span>← DATA</span>
          </div>

          {/* Execution Engine */}
          <div className="flex flex-col items-center">
            <Node label={<>EXECUTION<br />ENGINE</>} variant="process" />
            {/* External APIs / Internal functions float to the right */}
            <div className="absolute right-0 top-0 flex flex-col gap-4">
              {/* APIs (External) */}
              <div className="relative rounded-xl border-2 border-primary/30 bg-background p-3 shadow-sm w-52">
                <div className="absolute top-0 inset-x-0 h-5 rounded-t-xl bg-gradient-to-r from-cyan-400 to-amber-300" />
                <p className="text-[9px] font-bold text-foreground text-center mt-5 mb-2">APIs (EXTERNAL)</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] text-muted-foreground font-semibold">
                  <span>LOSS‑RUN</span><span>INSURED INSIGHT</span>
                  <span>PRICING</span><span>BROKER‑TARGET</span>
                  <span>SUBMISSION SUMMARY</span><span>EXPOSURE‑PROFILE</span>
                  <span className="col-span-2 text-center">FETCH POTENTIAL MAX‑LINE</span>
                </div>
              </div>
              {/* Functions (Internal) */}
              <div className="relative rounded-xl border-2 border-primary/30 bg-background p-3 shadow-sm w-52">
                <div className="absolute top-0 inset-x-0 h-5 rounded-t-xl bg-gradient-to-r from-cyan-400 to-amber-300" />
                <p className="text-[9px] font-bold text-foreground text-center mt-5 mb-2">FUNCTIONS (INTERNAL)</p>
                <div className="flex flex-col gap-1 text-[8px] text-muted-foreground font-semibold text-center">
                  <span>EMAIL COMPOSER</span>
                  <span>FILTERING</span>
                  <span>CONDITION‑CHECKER</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ARROW + context-pack label */}
        <div className="flex justify-center">
          <Arrow label="Context‑Pack" />
        </div>

        {/* ============================================================
            ROW 8  ·  Response Handler Engine
        ============================================================ */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase mb-1">RQ</span>
            <Node label={<>RESPONSE HANDLER<br />ENGINE</>} variant="process" />
          </div>
        </div>

        <div className="flex justify-center">
          <Arrow />
        </div>

        {/* ============================================================
            ROW 9  ·  Stream Response
        ============================================================ */}
        <div className="flex justify-center">
          <Node label="STREAM RESPONSE" variant="end" />
        </div>

        {/* Animated flowing data dots overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px pointer-events-none">
          {[0, 1.5, 3].map((d) => (
            <div
              key={d}
              className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.7)]"
              style={{
                top: 0,
                animation: `flowDown 3s linear ${d}s infinite`,
              }}
            />
          ))}
        </div>

      </div>

      {/* Keyframe for flowing dots */}
      <style>{`
        @keyframes flowDown {
          0%   { top: 0;    opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};
