import React, { useState } from 'react';
import { API_TOOLS, ApiTool } from './apiToolsData';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Info,
  Terminal,
  Settings2,
  ListChecks,
  CheckCircle2,
  XCircle,
  Route,
  Braces
} from "lucide-react";

// ── Expandable Section ────────────────────────────────────────────────────────
const Section = ({
  icon: Icon,
  title,
  accent = "primary",
  defaultOpen = true,
  children,
}: {
  icon: any;
  title: string;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-card transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-md bg-primary/10">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-foreground/80 group-hover:text-foreground transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
          open ? "rotate-180" : ""
        )} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

// ── Bullet List ───────────────────────────────────────────────────────────────
const BulletList = ({ text, color = "bg-primary/60" }: { text: string; color?: string }) => {
  const lines = text
    .split('\n')
    .map(l => l.replace(/^- /, '').trim())
    .filter(Boolean);
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
          <span className={cn("mt-2 w-1.5 h-1.5 rounded-full shrink-0", color)} />
          {line}
        </li>
      ))}
    </ul>
  );
};

// ── Response Field Table ──────────────────────────────────────────────────────
const ResponseFields = ({ text }: { text: string }) => {
  const lines = text
    .split('\n')
    .map(l => l.replace(/^- /, '').trim())
    .filter(Boolean);

  const rows = lines.map(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return { field: line, type: null, desc: '' };
    const left = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();
    // Match "name (type): desc" pattern
    const typeMatch = left.match(/^(.+?)\s+\((.+?)\)$/);
    if (typeMatch) {
      return { field: typeMatch[1], type: typeMatch[2], desc: rest };
    }
    return { field: left, type: null, desc: rest };
  });

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="rounded-lg border border-border/40 bg-secondary/20 px-3 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-[11px] font-mono font-bold text-primary">{row.field}</code>
            {row.type && (
              <Badge variant="outline" className="text-[9px] font-mono h-4 py-0 border-amber-400/30 text-amber-400 bg-amber-400/5">
                {row.type}
              </Badge>
            )}
          </div>
          {row.desc && (
            <p className="text-[11px] text-muted-foreground leading-relaxed">{row.desc}</p>
          )}
        </div>
      ))}
    </div>
  );
};

// ── JSON Block ────────────────────────────────────────────────────────────────
const JsonBlock = ({ data }: { data: any }) => (
  <pre
    className="text-[11px] font-mono bg-black/20 border border-border/40 rounded-lg p-3 overflow-auto max-h-64 leading-relaxed text-foreground/80 whitespace-pre-wrap"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data, null, 2)
        .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="text-green-300">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g, ': <span class="text-amber-400">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-emerald-400">$1</span>')
        .replace(/: null/g, ': <span class="text-muted-foreground/60">null</span>')
    }}
  />
);

// ── Status Chip ───────────────────────────────────────────────────────────────
const StatusChip = ({ enabled, label }: { enabled: boolean; label: string }) => (
  <div className={cn(
    "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border",
    enabled
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-muted/40 text-muted-foreground border-border/40"
  )}>
    {enabled
      ? <CheckCircle2 className="w-3 h-3" />
      : <XCircle className="w-3 h-3" />}
    {label}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
interface ApiToolsViewProps {
  toolId: string;
  toolData?: ApiTool;
}

export function ApiToolsView({ toolId, toolData }: ApiToolsViewProps) {
  const tool = toolData ?? API_TOOLS[toolId];
  if (!tool) return null;

  const displayName = (tool.name || toolId).replace(/_/g, ' ');
  const apiName = tool.parameters?.properties?.api_name?.const ?? null;
  const method = tool.parameters?.properties?.method?.const ?? null;
  const requiredHeaders: string[] = tool.parameters?.properties?.headers?.required ?? [];

  return (
    <div className="h-full overflow-y-auto custom-scrollbar space-y-3 px-4 py-4 animate-in fade-in slide-in-from-right-4 duration-400 pb-20">

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-br from-primary/10 via-card to-card p-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/20 border font-mono text-[10px] py-0">
              {tool.type.toUpperCase()}
            </Badge>
            {method && (
              <Badge variant="outline" className="font-mono text-[10px] py-0 border-emerald-400/30 text-emerald-400">
                {method}
              </Badge>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground capitalize leading-tight">
              {displayName}
            </h2>
            {apiName && (
              <code className="text-[11px] text-primary/70 font-mono mt-0.5 block">{apiName}</code>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {tool.short_description.replace(/^- /, '')}
          </p>
        </div>
      </div>

      {/* ── Definition ────────────────────────────────────────────────────── */}
      <Section icon={Info} title="Definition" defaultOpen={true}>
        <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3 italic">
          {tool.definition.replace(/^- /, '').trim()}
        </p>
      </Section>

      {/* ── When to Use ───────────────────────────────────────────────────── */}
      <Section icon={CheckCircle2} title="When to Use" defaultOpen={true}>
        <BulletList text={tool.use_this_tool_when} color="bg-emerald-500" />
      </Section>

      {/* ── Do Not Use ────────────────────────────────────────────────────── */}
      <Section icon={XCircle} title="Do Not Use When" defaultOpen={true}>
        <BulletList text={tool.do_not_use_this_tool_when} color="bg-rose-500" />
      </Section>

      {/* ── Response Fields ───────────────────────────────────────────────── */}
      <Section icon={ListChecks} title="Response Fields" defaultOpen={true}>
        <ResponseFields text={tool.response_field_description} />
      </Section>

      {/* ── API Parameters (Non-Technical) ────────────────────────────────── */}
      <Section icon={Braces} title="How This Tool Calls the API" defaultOpen={false}>
        <div className="space-y-3">

          {/* Endpoint */}
          {apiName && (
            <div className="rounded-xl border border-border/40 bg-secondary/20 p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">🔗 Endpoint (Where the request goes)</p>
              <code className="text-sm font-mono text-primary block">{apiName}</code>
              <p className="text-[11px] text-muted-foreground">This is the address of the service that provides the data.</p>
            </div>
          )}

          {/* Method */}
          {method && (
            <div className="rounded-xl border border-border/40 bg-secondary/20 p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">📡 Method ({method})</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {method === 'GET'
                  ? 'This tool only reads data — it never changes anything. Think of it like opening a document to view it.'
                  : method === 'POST'
                    ? 'This tool sends data to the server to get a result. Think of it like submitting a form.'
                    : `Uses the ${method} HTTP method.`}
              </p>
            </div>
          )}

          {/* Required Headers */}
          {requiredHeaders.length > 0 && (
            <div className="rounded-xl border border-border/40 bg-secondary/20 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">🪪 Required Identity Headers</p>
              <p className="text-[11px] text-muted-foreground mb-2">
                These are like your ID badge — they tell the system who you are and which client you belong to.
              </p>
              <div className="space-y-1.5">
                {requiredHeaders.map(h => (
                  <div key={h} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    <code className="text-[11px] font-mono text-primary">{h}</code>
                    <span className="text-[11px] text-muted-foreground">
                      {h === 'tenant-id' ? '— identifies your organization'
                        : h === 'app-id' ? '— identifies the application'
                          : h === 'email-id' ? '— identifies the user'
                            : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional: inputs */}
          {tool.parameters?.properties?.inputs && (
            <div className="rounded-xl border border-border/40 bg-secondary/20 p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">📥 Inputs (What you send)</p>
              {(() => {
                const required = tool.parameters.properties.inputs.required ?? [];
                const props = tool.parameters.properties.inputs.properties ?? {};
                const allKeys = Object.keys(props);
                return allKeys.length > 0 ? (
                  <div className="space-y-1.5">
                    {allKeys.map(k => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60 shrink-0" />
                        <code className="text-[11px] font-mono text-amber-400">{k}</code>
                        {required.includes(k) && (
                          <Badge variant="outline" className="text-[9px] border-rose-400/30 text-rose-400 py-0">required</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground">No additional inputs needed — the headers above are enough.</p>
                );
              })()}
            </div>
          )}
        </div>
      </Section>

      {/* ── Prompt Instructions (Readable) ────────────────────────────────── */}
      {tool.prompt_instructions && (
        <Section icon={Terminal} title="AI Guidance" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <span className="text-lg shrink-0 mt-0.5">🤖</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">How the AI uses this tool</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  These are internal instructions that guide the AI on when and how to use this tool correctly.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {tool.prompt_instructions
                .split(/(?<=\.\s)|\n+/)
                .map(s => s.trim())
                .filter(Boolean)
                .map((sentence, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    <p className="text-xs text-foreground/80 leading-relaxed">{sentence}</p>
                  </div>
                ))}
            </div>
          </div>
        </Section>
      )}

      {/* ── Data Path ─────────────────────────────────────────────────────── */}
      <Section icon={Route} title="Data Path" defaultOpen={false}>
        <div className="flex items-center flex-wrap gap-2">
          {tool.data_path_sequence.map((path, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground/40 text-xs">→</span>}
              <code className="text-[11px] font-mono bg-secondary/60 border border-border/40 rounded px-2 py-1 text-primary">
                {path}
              </code>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Pipeline Config ───────────────────────────────────────────────── */}
      <Section icon={Settings2} title="API Data Transformation" defaultOpen={false}>
        <div className="space-y-4">
          {/* Status chips */}
          <div className="flex flex-wrap gap-2">
            <StatusChip enabled={tool.flatten.enabled} label="Flatten" />
            <StatusChip enabled={tool.filter_data.enabled} label="Filter" />
            <StatusChip enabled={tool.sorting.enabled} label="Sort" />
          </div>

          {/* Remove Fields */}
          {tool.remove_fields && tool.remove_fields.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Removed Fields</p>
              <div className="flex flex-wrap gap-1.5">
                {tool.remove_fields.map((f, i) => (
                  <Badge key={i} variant="outline" className="font-mono text-[10px] border-rose-400/30 text-rose-400 bg-rose-400/5">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Flatten details */}
          {tool.flatten.enabled && tool.flatten.child_list_field && (
            <div className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Flatten Config</p>
              <div className="flex gap-2 text-xs">
                <span className="text-muted-foreground">Child Field:</span>
                <code className="text-primary font-mono">{tool.flatten.child_list_field}</code>
              </div>
              {tool.flatten.preserve_parent_fields.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Preserved:</p>
                  <div className="flex flex-wrap gap-1">
                    {tool.flatten.preserve_parent_fields.map((f, i) => (
                      <Badge key={i} variant="secondary" className="font-mono text-[9px]">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sorting details */}
          {tool.sorting.enabled && tool.sorting.column && (
            <div className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sort Config</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Column:</span>
                  <code className="text-primary font-mono">{tool.sorting.column}</code>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground">Order:</span>
                  <code className="text-primary font-mono">{tool.sorting.order}</code>
                </div>
              </div>
            </div>
          )}

          {/* Filter details */}
          {tool.filter_data.enabled && tool.filter_data.char_threshold !== null && (
            <div className="rounded-lg bg-secondary/30 border border-border/30 p-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filter Config</p>
              <div className="flex gap-2 text-xs">
                <span className="text-muted-foreground">Char Threshold:</span>
                <code className="text-amber-400 font-mono">{tool.filter_data.char_threshold}</code>
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
