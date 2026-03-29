import { useRef, useEffect, useCallback, useState } from "react";
import { X, GripVertical, ChevronDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DetailPanelConfig {
  header: React.ReactNode;   // Sticky header (title, subtitle, actions, close)
  body: React.ReactNode;     // Scrollable body content
}

// ── Resizable Split Panel ─────────────────────────────────────────────────────

const MIN_LEFT = 280;
const MIN_RIGHT = 300;
const DEFAULT_RIGHT = 420;

interface SplitPanelWrapperProps {
  listPane: React.ReactNode;
  detail: DetailPanelConfig | null;
}

export const SplitPanelWrapper = ({ listPane, detail }: SplitPanelWrapperProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rightWidth, setRightWidth] = useState(DEFAULT_RIGHT);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startRight = useRef(DEFAULT_RIGHT);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startRight.current = rightWidth;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [rightWidth]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const containerW = containerRef.current.offsetWidth;
      const delta = startX.current - e.clientX;
      const newRight = Math.min(
        containerW - MIN_LEFT - 8,
        Math.max(MIN_RIGHT, startRight.current + delta)
      );
      setRightWidth(newRight);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!detail) {
    return <div className="flex-1 overflow-y-auto">{listPane}</div>;
  }

  return (
    <div ref={containerRef} className="flex flex-1 overflow-hidden bg-background" style={{ minHeight: 0 }}>
      {/* Left — list */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {listPane}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onMouseDown}
        className="flex-shrink-0 w-2 relative flex items-center justify-center cursor-col-resize group z-10 select-none"
      >
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-primary/50 transition-colors" />
        <div className="relative z-10 flex items-center justify-center h-10 w-4 rounded-full bg-card border border-border group-hover:border-primary/50 group-hover:bg-secondary transition-all shadow-sm">
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* Right — detail panel */}
      <div
        className="flex-shrink-0 flex flex-col border-l border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-[-8px_0_24px_-4px_rgba(0,0,0,0.15)] z-20"
        style={{ width: rightWidth }}
      >
        {/* Sticky header */}
        <div className="flex-shrink-0 border-b border-border bg-card/40 backdrop-blur-sm sticky top-0 z-10">
          {detail.header}
        </div>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {detail.body}
        </div>
      </div>
    </div>
  );
};

// ── Generic Field Renderer (re-exported for reuse) ────────────────────────────

export const FieldBlock = ({ label, value }: { label: string; value: unknown }) => {
  const [open, setOpen] = useState(true);

  const isComplex =
    (typeof value === "object" && value !== null) ||
    (typeof value === "string" && (value.length > 100 || value.includes("\n")));

  const renderVal = (val: unknown): React.ReactNode => {
    if (val === null || val === undefined)
      return <span className="text-muted-foreground italic text-xs">null</span>;
    if (typeof val === "boolean")
      return <span className="text-green-400 font-mono text-xs">{String(val)}</span>;
    if (typeof val === "number")
      return <span className="text-amber-400 font-mono text-xs">{val}</span>;
    if (typeof val === "string" && val.length <= 100 && !val.includes("\n"))
      return <span className="text-blue-300 font-mono text-xs break-all">{val}</span>;
    if (typeof val === "string")
      return (
        <pre className="bg-secondary/60 border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed mt-1">
          {val}
        </pre>
      );
    if (Array.isArray(val) && val.length === 0)
      return <span className="text-muted-foreground font-mono text-xs">[]</span>;
    return (
      <pre
        className="bg-secondary/60 border border-border rounded-md p-2.5 font-mono text-xs text-foreground whitespace-pre-wrap break-words leading-relaxed mt-1"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(val, null, 2)
            .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
            .replace(/: "([^"]*)"/g, ': <span class="text-blue-300">"$1"</span>')
            .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
            .replace(/: (true|false)/g, ': <span class="text-green-400">$1</span>')
            .replace(/: null/g, ': <span class="text-muted-foreground">null</span>'),
        }}
      />
    );
  };

  if (!isComplex) {
    return (
      <div className="py-3 border-b border-border/60 last:border-0">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">{label}</div>
        {renderVal(value)}
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-border/60 last:border-0">
      <button className="flex items-center justify-between w-full text-left group" onClick={() => setOpen((p) => !p)}>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-1">{renderVal(value)}</div>}
    </div>
  );
};

export default SplitPanelWrapper;
