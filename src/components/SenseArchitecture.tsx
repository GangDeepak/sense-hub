import React, { useEffect, useState } from "react";

/* ─── Animated flow architecture matching the reference diagram ─── */

const ANIM_DELAY = 0.3; // seconds between each step reveal

interface FlowNodeProps {
  x: number; y: number; w: number; h: number;
  label: string; variant: "start" | "process" | "decision" | "end";
  delay: number;
}

const FlowNode: React.FC<FlowNodeProps> = ({ x, y, w, h, label, variant, delay }) => {
  const lines = label.split("\n");
  const fontSize = variant === "decision" ? 10 : 11;

  const gradients: Record<string, [string, string]> = {
    start: ["#4ade80", "#a3e635"],
    process: ["#6366f1", "#22d3ee"],
    decision: ["#fb923c", "#fbbf24"],
    end: ["#4ade80", "#a3e635"],
  };
  const [c1, c2] = gradients[variant];
  const textColor = variant === "start" || variant === "end" ? "#1e293b" : "#ffffff";
  const gId = `g-${label.replace(/\W/g, "")}-${x}-${y}`;

  return (
    <g
      className="flow-node"
      style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease ${delay}s forwards` }}
    >
      <defs>
        <linearGradient id={gId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        {variant === "process" && (
          <filter id={`shadow-${gId}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={c1} floodOpacity="0.3" />
          </filter>
        )}
      </defs>
      {variant === "decision" ? (
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={`url(#${gId})`} />
      ) : variant === "start" || variant === "end" ? (
        <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={`url(#${gId})`} />
      ) : (
        <rect
          x={x} y={y} width={w} height={h} rx={14}
          fill={`url(#${gId})`}
          filter={`url(#shadow-${gId})`}
        />
      )}
      {lines.map((line, i) => (
        <text
          key={i}
          x={x + w / 2} y={y + h / 2 + (i - (lines.length - 1) / 2) * (fontSize + 2)}
          textAnchor="middle" dominantBaseline="central"
          fill={textColor} fontWeight="700" fontSize={fontSize}
          fontFamily="system-ui, sans-serif" letterSpacing="0.5"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

/* Database icon */
const DBIcon: React.FC<{ x: number; y: number; label: string; delay: number }> = ({ x, y, label, delay }) => (
  <g style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease ${delay}s forwards` }}>
    <ellipse cx={x + 18} cy={y + 6} rx={16} ry={5} fill="#f59e0b" />
    <rect x={x + 2} y={y + 6} width={32} height={14} fill="#fbbf24" />
    <ellipse cx={x + 18} cy={y + 20} rx={16} ry={5} fill="#f59e0b" />
    <ellipse cx={x + 18} cy={y + 13} rx={16} ry={5} fill="none" stroke="#f59e0b" strokeWidth="0.5" />
    <text x={x + 18} y={y + 36} textAnchor="middle" fontSize="8" fontWeight="700"
      fill="currentColor" className="text-muted-foreground" letterSpacing="0.8">
      {label}
    </text>
  </g>
);

/* Arrow line */
const ArrowLine: React.FC<{
  points: string; delay: number; dashed?: boolean; label?: string;
  labelX?: number; labelY?: number; markerEnd?: boolean;
}> = ({ points, delay, dashed, label, labelX, labelY, markerEnd = true }) => (
  <g style={{ opacity: 0, animation: `fadeSlideIn 0.4s ease ${delay}s forwards` }}>
    <polyline
      points={points}
      fill="none"
      stroke="currentColor"
      className="text-border"
      strokeWidth="1.5"
      strokeDasharray={dashed ? "4 3" : undefined}
      markerEnd={markerEnd ? "url(#arrowhead)" : undefined}
    />
    {label && (
      <text x={labelX} y={labelY} textAnchor="middle" fontSize="8" fontWeight="700"
        fill="currentColor" className="text-muted-foreground" letterSpacing="0.5">
        {label}
      </text>
    )}
  </g>
);

/* Side panel boxes */
const ApiBox: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => (
  <g style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease ${delay}s forwards` }}>
    <rect x={x} y={y} width={180} height={95} rx={10} fill="var(--background, #fff)"
      stroke="currentColor" className="text-border" strokeWidth="1.5" />
    <rect x={x} y={y} width={180} height={18} rx={10} fill="url(#apiHeader)" />
    <rect x={x} y={y + 10} width={180} height={8} fill="url(#apiHeader)" />
    <text x={x + 90} y={y + 32} textAnchor="middle" fontSize="8" fontWeight="800" fill="currentColor">
      APIs (EXTERNAL)
    </text>
    {[
      ["LOSS-RUN", "INSURED INSIGHT", "EXPOSURE-DATA"],
      ["PRICING", "BROKER-TARGET", ""],
      ["SUBMISSION SUMMARY", "EXPOSURE-PROFILE", ""],
      ["LOSS-PROFILE", "FETCH POTENTIAL MAX-LINE", ""],
    ].map((row, ri) => (
      <g key={ri}>
        {row.map((item, ci) => item && (
          <text key={ci} x={x + 8 + ci * 62} y={y + 46 + ri * 12} fontSize="6.5" fontWeight="600"
            fill="currentColor" className="text-muted-foreground">
            {item}
          </text>
        ))}
      </g>
    ))}
  </g>
);

const FuncBox: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => (
  <g style={{ opacity: 0, animation: `fadeSlideIn 0.5s ease ${delay}s forwards` }}>
    <rect x={x} y={y} width={160} height={70} rx={10} fill="var(--background, #fff)"
      stroke="currentColor" className="text-border" strokeWidth="1.5" />
    <rect x={x} y={y} width={160} height={18} rx={10} fill="url(#apiHeader)" />
    <rect x={x} y={y + 10} width={160} height={8} fill="url(#apiHeader)" />
    <text x={x + 80} y={y + 32} textAnchor="middle" fontSize="8" fontWeight="800" fill="currentColor">
      FUNCTIONs (INTERNAL)
    </text>
    {["EMAIL COMPOSER", "FILTERING", "CONDITION-CHECKER"].map((fn, i) => (
      <text key={i} x={x + 80} y={y + 46 + i * 10} textAnchor="middle" fontSize="7" fontWeight="600"
        fill="currentColor" className="text-muted-foreground">
        {fn}
      </text>
    ))}
  </g>
);

/* Flowing pulse dot along the main path */
const PulseDot: React.FC<{ pathId: string; dur: string; delay: string }> = ({ pathId, dur, delay }) => (
  <circle r="4" fill="#22d3ee" opacity="0.9">
    <animateMotion dur={dur} begin={delay} repeatCount="indefinite">
      <mpath href={`#${pathId}`} />
    </animateMotion>
  </circle>
);

/* ─── Main Component ─── */
export const SenseArchitecture: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(true); }, []);

  // Layout constants
  const CX = 280; // center X for main column
  const svgW = 750;
  const svgH = 1050;

  // Step positions (y)
  const S = {
    userQuery: 30,
    queryRewriter: 110,
    resolvable: 210,
    grounding: 320,
    foundGT: 420,
    intentEngine: 570,
    submissionFinder: 570,
    taskPlanning: 700,
    executionEngine: 700,
    responseHandler: 850,
    streamResponse: 950,
  };

  let step = 0;
  const d = () => (step++ * ANIM_DELAY);

  return (
    <div className="w-full overflow-x-auto py-6">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="mx-auto"
        style={{ maxWidth: "800px", width: "100%", height: "auto" }}
        role="img"
        aria-label="Sense AI Architecture Flow Diagram"
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill="currentColor" className="text-border" />
          </marker>
          <linearGradient id="apiHeader" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>

        {/* ─── Main flow path for animated dots ─── */}
        <path id="mainFlow" d={`M${CX},${S.userQuery + 30} L${CX},${S.streamResponse + 15}`}
          fill="none" stroke="none" />

        {/* ═══ ROW 1: USER QUERY ═══ */}
        <FlowNode x={CX - 65} y={S.userQuery} w={130} h={34} label="USER QUERY" variant="start" delay={d()} />
        <DBIcon x={580} y={S.userQuery - 10} label="PROMPT DB" delay={d()} />

        {/* Arrow down */}
        <ArrowLine points={`${CX},${S.userQuery + 34} ${CX},${S.queryRewriter}`} delay={d()} />

        {/* ═══ ROW 2: QUERY REWRITER ═══ */}
        <FlowNode x={CX - 70} y={S.queryRewriter} w={140} h={55} label={"QUERY\nREWRITER"} variant="process" delay={d()} />
        <DBIcon x={560} y={S.queryRewriter} label="CHAT-HISTORY" delay={d()} />
        {/* Dashed line to Chat-History */}
        <ArrowLine points={`${CX + 70},${S.queryRewriter + 27} ${560},${S.queryRewriter + 20}`}
          delay={d()} dashed />

        {/* Arrow down with label */}
        <ArrowLine points={`${CX},${S.queryRewriter + 55} ${CX},${S.resolvable}`}
          delay={d()} label="RQ / REWRITTEN QUERY" labelX={CX} labelY={S.queryRewriter + 75} />

        {/* ═══ ROW 3: RESOLVABLE? ═══ */}
        <FlowNode x={CX - 65} y={S.resolvable} w={130} h={34} label="RESOLVABLE?" variant="decision" delay={d()} />
        <DBIcon x={560} y={S.resolvable - 10} label="CHAT-TRACE" delay={d()} />

        {/* YES path down */}
        <ArrowLine points={`${CX},${S.resolvable + 34} ${CX},${S.grounding}`}
          delay={d()} label="YES" labelX={CX - 20} labelY={S.resolvable + 55} />
        <text x={CX + 5} y={S.grounding - 8} fontSize="8" fontWeight="700"
          fill="currentColor" className="text-muted-foreground" textAnchor="middle"
          style={{ opacity: 0, animation: `fadeSlideIn 0.4s ease ${d()}s forwards` }}>RQ</text>

        {/* ═══ ROW 4: GROUNDING MODULE ═══ */}
        <FlowNode x={CX - 70} y={S.grounding} w={140} h={55} label={"GROUNDING\nMODULE"} variant="process" delay={d()} />
        <DBIcon x={560} y={S.grounding} label={"KNOWLEDGE / QUERY\nGROUND TRUTH"} delay={d()} />
        <ArrowLine points={`${CX + 70},${S.grounding + 27} ${560},${S.grounding + 20}`}
          delay={d()} dashed />

        {/* Arrow down */}
        <ArrowLine points={`${CX},${S.grounding + 55} ${CX},${S.foundGT}`} delay={d()} />

        {/* ═══ ROW 5: FOUND GROUND TRUTH? ═══ */}
        <FlowNode x={CX - 85} y={S.foundGT} w={170} h={34} label="FOUND GROUND TRUTH?" variant="decision" delay={d()} />

        {/* YES path – left bypass down to Response Handler */}
        <ArrowLine
          points={`${CX - 85},${S.foundGT + 17} 60,${S.foundGT + 17} 60,${S.responseHandler + 25}`}
          delay={d()} label="YES" labelX={45} labelY={S.foundGT + 50} markerEnd={false}
        />
        {/* NO path down */}
        <ArrowLine points={`${CX},${S.foundGT + 34} ${CX},${S.foundGT + 70}`}
          delay={d()} label="NO" labelX={CX + 15} labelY={S.foundGT + 55} markerEnd={false} />

        {/* Split to Intent Engine & Submission Finder */}
        {/* Horizontal line */}
        <ArrowLine
          points={`${CX},${S.foundGT + 70} ${CX - 80},${S.foundGT + 70} ${CX - 80},${S.intentEngine}`}
          delay={d()} markerEnd label="RQ" labelX={CX - 80} labelY={S.intentEngine - 8} />
        <ArrowLine
          points={`${CX},${S.foundGT + 70} ${CX + 80},${S.foundGT + 70} ${CX + 80},${S.submissionFinder}`}
          delay={d()} markerEnd label="RQ" labelX={CX + 80} labelY={S.submissionFinder - 8} />

        {/* ═══ ROW 6: INTENT ENGINE & SUBMISSION FINDER ═══ */}
        <FlowNode x={CX - 150} y={S.intentEngine} w={140} h={55} label={"INTENT\nENGINE"} variant="process" delay={d()} />
        <FlowNode x={CX + 10} y={S.submissionFinder} w={140} h={55} label={"SUBMISSION\nFINDER"} variant="process" delay={d()} />

        {/* NO path from RESOLVABLE going far left, down to Intent Engine */}
        <ArrowLine
          points={`${CX - 65},${S.resolvable + 17} 30,${S.resolvable + 17} 30,${S.intentEngine + 27} ${CX - 150},${S.intentEngine + 27}`}
          delay={d()} label="NO" labelX={15} labelY={S.resolvable + 50} markerEnd
        />

        {/* Converge down to Task Planning */}
        <ArrowLine
          points={`${CX - 80},${S.intentEngine + 55} ${CX - 80},${S.taskPlanning} ${CX - 60},${S.taskPlanning + 27}`}
          delay={d()} markerEnd={false} />
        <ArrowLine
          points={`${CX + 80},${S.submissionFinder + 55} ${CX + 80},${S.taskPlanning} ${CX + 60},${S.taskPlanning + 27}`}
          delay={d()} markerEnd={false} />

        {/* ═══ ROW 7: TASK PLANNING ENGINE ═══ */}
        <FlowNode x={CX - 60} y={S.taskPlanning} w={120} h={55} label={"TASK\nPLANNING\nENGINE"} variant="process" delay={d()} />

        {/* INTENT=='OTHER' label going left back to Response Handler */}
        <ArrowLine
          points={`${CX - 60},${S.taskPlanning + 40} 60,${S.taskPlanning + 40} 60,${S.responseHandler + 25}`}
          delay={d()} label={"INTENT == 'OTHER'"} labelX={100} labelY={S.taskPlanning + 65} markerEnd
        />

        {/* Bidirectional to Execution Engine */}
        <g style={{ opacity: 0, animation: `fadeSlideIn 0.4s ease ${d()}s forwards` }}>
          <line x1={CX + 60} y1={S.taskPlanning + 20} x2={CX + 180} y2={S.executionEngine + 20}
            stroke="currentColor" className="text-border" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
          <line x1={CX + 180} y1={S.executionEngine + 35} x2={CX + 60} y2={S.taskPlanning + 35}
            stroke="currentColor" className="text-border" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
          <text x={CX + 120} y={S.taskPlanning + 14} textAnchor="middle" fontSize="7" fontWeight="700"
            fill="currentColor" className="text-muted-foreground">PAYLOAD</text>
          <text x={CX + 120} y={S.taskPlanning + 50} textAnchor="middle" fontSize="6" fontWeight="700"
            fill="currentColor" className="text-muted-foreground">RAW/POST-PROCESSED</text>
          <text x={CX + 120} y={S.taskPlanning + 58} textAnchor="middle" fontSize="6" fontWeight="700"
            fill="currentColor" className="text-muted-foreground">SUBMISSION DATA</text>
        </g>

        {/* EXECUTION ENGINE */}
        <FlowNode x={CX + 180} y={S.executionEngine} w={120} h={55} label={"EXECUTION\nENGINE"} variant="process" delay={d()} />

        {/* API & Function boxes */}
        <ApiBox x={540} y={S.executionEngine - 20} delay={d()} />
        <FuncBox x={540} y={S.executionEngine + 85} delay={d()} />
        {/* Dashed lines to boxes */}
        <ArrowLine points={`${CX + 300},${S.executionEngine + 27} ${540},${S.executionEngine + 27}`}
          delay={d()} dashed markerEnd={false} />

        {/* Arrow down: Task Planning → Context-Pack → Response Handler */}
        <ArrowLine points={`${CX},${S.taskPlanning + 55} ${CX},${S.responseHandler}`}
          delay={d()} label="CONTEXT-PACK" labelX={CX + 50} labelY={S.taskPlanning + 85} />

        {/* RQ label */}
        <text x={CX + 5} y={S.responseHandler - 8} fontSize="8" fontWeight="700"
          fill="currentColor" className="text-muted-foreground" textAnchor="middle"
          style={{ opacity: 0, animation: `fadeSlideIn 0.4s ease ${d()}s forwards` }}>RQ</text>

        {/* ═══ ROW 8: RESPONSE HANDLER ENGINE ═══ */}
        <FlowNode x={CX - 75} y={S.responseHandler} w={150} h={55} label={"RESPONSE HANDLER\nENGINE"} variant="process" delay={d()} />

        {/* YES merge line into Response Handler from left */}
        <ArrowLine points={`60,${S.responseHandler + 25} ${CX - 75},${S.responseHandler + 25}`}
          delay={d()} markerEnd />

        {/* Arrow down */}
        <ArrowLine points={`${CX},${S.responseHandler + 55} ${CX},${S.streamResponse}`} delay={d()} />

        {/* ═══ ROW 9: STREAM RESPONSE ═══ */}
        <FlowNode x={CX - 75} y={S.streamResponse} w={150} h={34} label="STREAM RESPONSE" variant="end" delay={d()} />

        {/* ─── Animated pulse dots along main path ─── */}
        <path id="pulseMain" d={`M${CX},${S.userQuery + 34} L${CX},${S.streamResponse}`}
          fill="none" stroke="none" />
        {visible && (
          <>
            <PulseDot pathId="pulseMain" dur="6s" delay="0s" />
            <PulseDot pathId="pulseMain" dur="6s" delay="2s" />
            <PulseDot pathId="pulseMain" dur="6s" delay="4s" />
          </>
        )}

        {/* Glow filter for dots */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      <style>{`
        @keyframes fadeSlideIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
