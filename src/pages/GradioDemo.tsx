import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, Mail, Boxes, X, Check, Globe, Building2, Search, CornerDownRight, Pencil, FolderOpen, Eye, Archive, FileText, BarChart3, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useGradioDemo } from "@/contexts/GradioDemoContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SplitPanelWrapper, FieldBlock, SectionBlock, ValueOnlyBlock } from "@/components/grounding/SplitDetailPanel";
import GeneratedChart from "@/components/GeneratedChart";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export interface StatusMessage {
  icon?: string;
  message: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  moduleOutputs?: ModuleOutputs;
  emailDraft?: EmailDraft;
  followUp?: string[];
  statusMessages?: StatusMessage[];
  chartData?: {
    type: string;
    data: any;
    options?: any;
  };
  queryId?: string;
  feedback?: {
    status: "like" | "dislike";
    rating_stars: string;
    comments?: string;
  };
}

interface EmailDraft {
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
}

type ModuleOutputs = any;

const MODULE_OUTPUT_KEY_ORDER = [
  "ref_id",
  "query_id",
  "session_uuid",
  "user_query",
  "rewritten_user_query",
  "found_ground_truth",
  "retrieved_knowledges",
  "retrieved_queries",
  "tool_response",
  "filtered_knowledges",
  "final_pipeline_json",
  "emails",
  "context_pack",
  "metrics",
  "follow_up_queries"
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(isoStr?: string) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    }).format(d);
  } catch {
    return "";
  }
}

// ── Markdown component definitions ──────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  // ── Code ──
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");

    if (!inline && match) {
      return (
        <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1b26] border-b border-white/10">
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{match[1]}</span>
            <CopyButton text={codeString} />
          </div>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: 0,
              padding: "1rem 1.25rem",
              fontSize: "0.78rem",
              lineHeight: "1.65",
              background: "#1e1f2e",
            }}
            {...props}
          >
            {codeString}
          </SyntaxHighlighter>
        </div>
      );
    }

    // Inline code
    return (
      <code
        className="bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[0.78em] font-mono border border-primary/20"
        {...props}
      >
        {children}
      </code>
    );
  },

  // ── Pre (wraps fenced code — handled above via code component) ──
  pre({ children }) {
    return <>{children}</>;
  },

  // ── Tables ──
  table({ children }) {
    return (
      <div className="overflow-x-auto my-4 rounded-xl border border-border shadow-sm">
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return (
      <thead className="bg-muted/70 border-b border-border">
        {children}
      </thead>
    );
  },
  tbody({ children }) {
    return <tbody className="divide-y divide-border/60">{children}</tbody>;
  },
  tr({ children }) {
    return (
      <tr className="hover:bg-muted/40 transition-colors even:bg-muted/20">
        {children}
      </tr>
    );
  },
  th({ children }) {
    return (
      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground whitespace-nowrap">
        {children}
      </th>
    );
  },
  td({ children }) {
    return (
      <td className="px-4 py-2.5 text-sm align-top leading-relaxed">
        {children}
      </td>
    );
  },

  // ── Headings ──
  h1({ children }) {
    return <h1 className="text-lg font-bold mt-1 mb-2 text-foreground tracking-tight border-b border-border pb-1">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-base font-semibold mt-1 mb-1.5 text-foreground tracking-tight">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-sm font-semibold mt-1 mb-1 text-foreground">{children}</h3>;
  },
  h4({ children }) {
    return <h4 className="text-sm font-medium mt-1 mb-0.5 text-foreground">{children}</h4>;
  },

  // ── Paragraph ──
  p({ children }) {
    return <p className="text-sm leading-relaxed text-foreground/90">{children}</p>;
  },

  // ── Lists ──
  ul({ children }) {
    return <ul className="my-2 space-y-1 list-none pl-0">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="my-2 space-y-1 list-decimal list-outside pl-5">{children}</ol>;
  },
  li({ children, ordered }: any) {
    return (
      <li className="text-sm leading-relaxed flex gap-2 items-start">
        {!ordered && (
          <span className="mt-2 shrink-0 w-1.5 h-1.5 rounded-full bg-primary/60 inline-block" />
        )}
        <span>{children}</span>
      </li>
    );
  },

  // ── Blockquote ──
  blockquote({ children }) {
    return (
      <blockquote className="my-3 pl-4 border-l-2 border-primary/50 bg-primary/5 rounded-r-lg py-2 pr-3 text-muted-foreground italic text-sm">
        {children}
      </blockquote>
    );
  },

  // ── Links ──
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
      >
        {children}
      </a>
    );
  },

  // ── Horizontal rule ──
  hr() {
    return <hr className="my-4 border-border" />;
  },

  // ── Strong / Em ──
  strong({ children }) {
    return <strong className="font-semibold text-foreground">{children}</strong>;
  },
  em({ children }) {
    return <em className="italic text-foreground/80">{children}</em>;
  },
};

// ── FeedbackModal component ──────────────────────────────────────────────────
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "like" | "dislike" | null;
  onSubmit: (rating: number, comment: string) => void;
}

function FeedbackModal({ isOpen, onClose, type, onSubmit }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl p-6 gap-6" aria-describedby={undefined}>
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {type === "like" ? (
              <ThumbsUp className="w-5 h-5 text-emerald-500" />
            ) : (
              <ThumbsDown className="w-5 h-5 text-amber-500" />
            )}
            {type === "like" ? "Tell us what you liked" : "Help us improve"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your feedback helps us make the assistant better for everyone.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Rating</label>
            <div className="flex items-center gap-1.5 px-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Star
                    className={cn(
                      "w-8 h-8 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Comments (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us more about your experience..."
              className="resize-none h-24 rounded-2xl bg-secondary/30 border-border/40 focus:bg-background transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="rounded-xl px-6 bg-primary hover:bg-primary/90"
          >
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── AssistantMessage component ───────────────────────────────────────────────

function AssistantMessage({
  content,
  isStreaming,
  isLast,
  moduleOutputs,
  emailDraft,
  timestamp,
  followUp,
  statusMessages,
  chartData,
  onShowModules,
  onShowEmail,
  onFollowUpClick,
  onFeedback,
  feedback,
}: {
  content: string;
  isStreaming: boolean;
  isLast: boolean;
  moduleOutputs: ModuleOutputs | null;
  emailDraft?: EmailDraft;
  timestamp?: string;
  followUp?: string[];
  statusMessages?: StatusMessage[];
  chartData?: any;
  onShowModules: () => void;
  onShowEmail: () => void;
  onFollowUpClick: (text: string) => void;
  onFeedback: (type: "like" | "dislike") => void;
  feedback?: ChatMessage["feedback"];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show action bar on all completed assistant messages, not just the last
  const showActionBar = !(isStreaming && isLast);

  // Always show the full content as-is — the email banner renders below it separately.
  const displayContent = content;

  // Show status timeline: while streaming with no content yet, show all steps.
  // Once content arrives, collapse to a single "Done" row.
  const hasStatus = statusMessages && statusMessages.length > 0;
  const showStatusTimeline = hasStatus && isStreaming && isLast && !content;
  const showStatusDone = hasStatus && (!isStreaming || !!content);

  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
        <img
          src="/bp.png"
          alt="Assistant"
          className={`h-6 w-6 object-contain transition-transform ${isStreaming && !content ? "animate-spin" : ""}`}
        />
      </div>

      <div className="max-w-[80%] min-w-0 flex flex-col">

        {/* Status Phase — strictly visible only BEFORE the main content chunks arrive */}
        {hasStatus && !content && (
          <div className="mb-4 mt-2 relative animate-fade-in flex flex-col gap-3">
            {/* The single continuous vertical line */}
            <div className="absolute left-[8px] top-[20px] bottom-[10px] w-px bg-border/60 z-0" />

            {/* The individual statuses pulled from SSE objects */}
            {statusMessages!.map((status, idx) => {
              // Map standard backend names to Lucide icons
              let IconComp = Search;
              if (status.icon === "pencil") IconComp = Pencil;
              else if (status.icon === "folder-open") IconComp = FolderOpen;
              else if (status.icon === "eye") IconComp = Eye;
              else if (status.icon === "archive") IconComp = Archive;
              else if (status.icon === "file-text") IconComp = FileText;

              return (
                <div key={idx} className="flex items-start gap-4 relative z-10 transition-colors">
                  <div className="shrink-0 w-[17px] h-[17px] flex items-center justify-center bg-background mt-0.5">
                    <IconComp className="w-[17px] h-[17px] text-muted-foreground/75" strokeWidth={1.5} />
                  </div>
                  <span className="text-[15px] font-medium text-muted-foreground">
                    {status.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Message bubble */}
        <div className="text-sm leading-relaxed overflow-hidden">
          {displayContent && (
            <div className="prose-reset max-w-none break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={markdownComponents}
              >
                {displayContent}
              </ReactMarkdown>
            </div>
          )}

          {/* Generated Chart */}
          {chartData && (
            <GeneratedChart
              type={chartData.type}
              data={chartData.data}
              options={chartData.options}
            />
          )}

          {/* Streaming cursor */}
          {isStreaming && isLast && (
            <span className="inline-block w-2 h-4 bg-primary/70 animate-pulse ml-0.5 rounded-sm align-middle" />
          )}

          {/* Email draft banner — inline, below the streamed text, only when draft is ready */}
          {emailDraft && !isStreaming && (
            <button
              type="button"
              onClick={onShowEmail}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group text-left",
                "border-border/60 bg-background/60 hover:bg-background hover:border-primary/30 hover:shadow-sm",
                displayContent ? "mt-3" : ""
              )}
            >
              {/* Mail icon */}
              <div className="shrink-0 h-8 w-8 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4 text-primary" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug">
                  An email draft has been generated
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You can review or edit it before sending · <span className="text-primary">Click to preview</span>
                </p>
              </div>

              {/* Chevron */}
              <div className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )}
        </div>

        {/* Action bar — shown on every completed assistant message */}
        {showActionBar && (
          <div className={cn("mt-1.5 flex items-center justify-between", !followUp?.length && "mb-2")}>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={() => onFeedback("like")}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all",
                  feedback?.status === "like"
                    ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <ThumbsUp className={cn("w-3 h-3", feedback?.status === "like" && "fill-emerald-500")} />
                <span>Like</span>
              </button>
              <button
                type="button"
                onClick={() => onFeedback("dislike")}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all",
                  feedback?.status === "dislike"
                    ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <ThumbsDown className={cn("w-3 h-3", feedback?.status === "dislike" && "fill-amber-500")} />
                <span>Dislike</span>
              </button>

              {feedback?.rating_stars && (
                <div className="flex items-center gap-0.5 ml-1 border-l border-border/40 pl-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ratingValue = parseInt(feedback.rating_stars.split("/")[0]) || 0;
                    return (
                      <Star
                        key={i}
                        className={cn(
                          "w-2.5 h-2.5 transition-colors",
                          i < ratingValue ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
                        )}
                      />
                    );
                  })}
                </div>
              )}
              {moduleOutputs && (
                <button
                  type="button"
                  onClick={onShowModules}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <Boxes className="w-3 h-3" />
                  <span>Module outputs</span>
                </button>
              )}
            </div>

            {timestamp && !isStreaming && (
              <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap ml-4">
                {formatTime(timestamp)}
              </span>
            )}
          </div>
        )}

        {/* Follow-up suggestions */}
        {followUp && followUp.length > 0 && !(isStreaming && isLast) && (
          <div className="mt-2 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 mb-2 px-1">
              <h3 className="text-sm font-semibold text-foreground/90">Follow-ups</h3>
            </div>
            <div className="flex flex-col">
              {followUp.map((query, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFollowUpClick(query)}
                  className={cn(
                    "group w-full flex items-center gap-3 py-3 px-2 text-left transition-all border-b border-white/5 last:border-0 rounded-lg",
                    "hover:bg-white/[0.02] hover:pl-3"
                  )}
                >
                  <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  <span className="text-sm text-foreground/70 group-hover:text-foreground transition-colors line-clamp-1">
                    {query}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main GradioDemo component ────────────────────────────────────────────────

const GradioDemo = () => {
  const ALLOWED_CONTEXT_TYPES = ["page_summary", "chunk_summary", "section_summary"] as const;
  type ContextType = typeof ALLOWED_CONTEXT_TYPES[number];

  const { user } = useAuth();
  const { selectedInsured, sessionId, setSessionId, setSessions, updateSessionName, referenceQueries } = useGradioDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-6");
  const [generateChart, setGenerateChart] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [contextType, setContextType] = useState<ContextType>("page_summary");
  // activeDetail: which message index's module/email panel is open
  const [activeDetail, setActiveDetail] = useState<{ type: "email" | "modules"; msgIndex: number } | null>(null);
  const [feedbackState, setFeedbackState] = useState<{ isOpen: boolean; type: "like" | "dislike" | null; msgIndex: number | null }>({
    isOpen: false,
    type: null,
    msgIndex: null,
  });

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skipHistoryLoadRef = useRef(false);

  // Auto-scroll to bottom on message or container size change
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
    if (!viewport) return;

    const scrollToBottom = () => {
      // 1. Safest way for Radix ScrollArea
      viewport.scrollTop = viewport.scrollHeight;
      // 2. Also try scrollIntoView if end ref is available
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "end" });
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);

    const observer = new ResizeObserver(() => requestAnimationFrame(scrollToBottom));
    observer.observe(viewport);

    const content = viewport.firstElementChild;
    if (content) {
      observer.observe(content);
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [messages, isStreaming, activeDetail]);

  // Load chat history when session changes
  useEffect(() => {
    if (skipHistoryLoadRef.current) {
      skipHistoryLoadRef.current = false;
      return;
    }

    if (!sessionId || sessionId === "default_session") {
      setMessages([]);
      return;
    }
    setMessages([]);
    setActiveDetail(null);
    (async () => {
      if (!user?.email) return;
      try {
        const emailStr = encodeURIComponent(user.email);
        const res = await fetch(`${API_BASE}/gradio_demo/chats/${sessionId}?email=${emailStr}`);
        if (!res.ok) return;
        const data = await res.json();
        const loaded: ChatMessage[] = [];

        for (const chat of data.chats || []) {
          if (chat.user_query) {
            loaded.push({
              role: "user",
              content: chat.user_query,
              timestamp: chat.request_received_at || chat.created_at || ""
            });
          }

          // bot_response_text can be:
          //   1. A plain string  → normal markdown response
          //   2. An object (email payload) → email-only response; content comes from context_pack status
          //   3. Missing/null   → skip
          const rawBotResponse = chat.bot_response_text;
          if (!rawBotResponse) continue;

          // ── Resolve display text ──────────────────────────────────────────
          let displayContent = "";
          if (typeof rawBotResponse === "string") {
            displayContent = rawBotResponse;
          } else {
            // bot_response_text is the email object itself.
            // Try to get a human-readable status from context_pack["email-composer"]
            const contextPack: any[] = chat.context_pack || [];
            const emailComposerPack = contextPack.find((p: any) => p.name === "email-composer");
            displayContent = emailComposerPack?.status || "";
          }

          // ── Resolve email draft ───────────────────────────────────────────
          // The emails array items have the shape: { name, email_result: { subject, body, to, cc, bcc, ... } }
          // Fallback: if bot_response_text itself is the email object, use it directly.
          let emailDraft: EmailDraft | undefined;

          const emails: any[] = chat.emails || [];
          if (emails.length > 0) {
            // Support both { email_result: {...} } and flat { subject, body, to, ... }
            const emailEntry = emails[0];
            const emailData = emailEntry?.email_result ?? emailEntry;
            if (emailData && (emailData.subject || emailData.body || emailData.to)) {
              emailDraft = {
                subject: emailData.subject || "",
                body: emailData.body || "",
                to: Array.isArray(emailData.to) ? emailData.to : [],
                cc: Array.isArray(emailData.cc) ? emailData.cc : [],
                bcc: Array.isArray(emailData.bcc) ? emailData.bcc : [],
              };
            }
          }

          // If still no emailDraft but bot_response_text looks like an email object, use it
          if (!emailDraft && typeof rawBotResponse === "object" && rawBotResponse !== null) {
            const e = rawBotResponse as any;
            if (e.subject || e.body || e.to) {
              emailDraft = {
                subject: e.subject || "",
                body: e.body || "",
                to: Array.isArray(e.to) ? e.to : [],
                cc: Array.isArray(e.cc) ? e.cc : [],
                bcc: Array.isArray(e.bcc) ? e.bcc : [],
              };
            }
          }

          // ── Build assistant message with small offset ────────────────────
          let assistantTime = chat.request_completed_at || chat.created_at || "";

          const { bot_response_text: _omit, ...rest } = chat;

          loaded.push({
            role: "assistant",
            content: displayContent,
            timestamp: assistantTime,
            moduleOutputs: Object.keys(rest).length > 0 ? rest : undefined,
            emailDraft,
            followUp: chat.follow_up_queries || chat.follow_up || chat.chat_response?.follow_up || [],
            chartData: chat.genrated_chart || chat.chart_data || chat.chat_response?.genrated_chart || chat.chat_response?.chart_data || undefined,
            queryId: chat.query_id,
            feedback: chat.feedback,
          });
        }

        setMessages(loaded);
      } catch {
        // ignore
      }
    })();
  }, [sessionId]);

  const sendMessage = useCallback(async (overrideInput?: string | any) => {
    const text = typeof overrideInput === "string" ? overrideInput.trim() : input.trim();
    if (!text || isStreaming || !selectedInsured) return;

    let activeSessionId = sessionId;
    if (activeSessionId === "default_session") {
      activeSessionId = crypto.randomUUID();
      skipHistoryLoadRef.current = true;
      setSessionId(activeSessionId);

      // Fire-and-forget session creation in backend
      if (user?.email) {
        const emailStr = encodeURIComponent(user.email);
        fetch(`${API_BASE}/gradio_demo/session/${activeSessionId}?email=${emailStr}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_name: text.slice(0, 50) }),
        })
          .then(async () => {
            // Refresh session list in sidebar
            const sRes = await fetch(`${API_BASE}/gradio_demo/sessions?email=${emailStr}`);
            if (sRes.ok) {
              const sData = await sRes.json();
              setSessions(sData.sessions || []);
            }
          })
          .catch(() => { });
      }
    }

    const now = new Date().toISOString();
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: now };
    setMessages((prev) => {
      if (prev.length === 0) {
        updateSessionName(activeSessionId, text.slice(0, 50));
      }
      return [...prev, userMsg];
    });
    setInput("");
    setIsStreaming(true);

    const queryId = crypto.randomUUID();
    const assistantMsg: ChatMessage = { role: "assistant", content: "", queryId };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      if (!user?.email) throw new Error("User email is required to send messages");

      const formData = new FormData();
      formData.append("text", text);
      formData.append("session_id", activeSessionId);
      formData.append("email", user.email);
      formData.append("query_id", queryId);
      formData.append("chat_history", JSON.stringify(history));
      formData.append("insured_name", selectedInsured?.insured_name || "");
      formData.append("ref_id", selectedInsured?.ref_id === "landing_page" ? "" : (selectedInsured?.ref_id || ""));
      formData.append("web_search", String(webSearch));
      formData.append("request_received_at", now);
      formData.append("chart_mode", String(generateChart));
      formData.append("web_search_model", selectedModel);
      if (selectedPdf) {
        formData.append("file", selectedPdf);
        formData.append("context_type", contextType);
      }

      const res = await fetch(`${API_BASE}/gradio_demo/stream`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Stream request failed");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(line.slice(6));

              if (parsed.error) {
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: `Error: ${parsed.error}` };
                  return updated;
                });
                break;
              }

              const event = parsed.event as string | undefined;
              const responseType = parsed.response_type as string | undefined;

              if (event === "chunk") {
                const chunk =
                  parsed.chat_response?.content ??
                  parsed.text ??
                  parsed.content ??
                  parsed.answer ??
                  "";
                if (chunk) {
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + chunk,
                    };
                    return updated;
                  });
                }
              }

              // "end" with response_type "markdown" — use the full assembled text as the final content
              if (event === "end" && responseType === "markdown") {
                const finalText = parsed.chat_response?.content;
                if (finalText) {
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: finalText,
                      timestamp: new Date().toISOString(),
                    };
                    return updated;
                  });
                }
              }

              // "end" with response_type "email" — attach draft to message, preserve existing text content
              if (event === "end" && responseType === "email") {
                const email = parsed.chat_response?.data ?? parsed.chat_response?.content ?? {};
                if (email && (email.subject || email.body || email.to)) {
                  const draft: EmailDraft = {
                    subject: email.subject || "",
                    body: email.body || "",
                    to: Array.isArray(email.to) ? email.to : [],
                    cc: Array.isArray(email.cc) ? email.cc : [],
                    bcc: Array.isArray(email.bcc) ? email.bcc : [],
                  };
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      emailDraft: draft,
                      timestamp: new Date().toISOString(),
                    };
                    return updated;
                  });
                }
              }

              // Attach module outputs directly to the assistant message
              if (event === "metadata") {
                const content = parsed.chat_response?.content;
                if (content) {
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      moduleOutputs: content,
                    };
                    return updated;
                  });
                }
              }

              // Handle follow-up queries event
              if (event === "follow_up") {
                const suggestions = parsed.chat_response?.content;
                if (Array.isArray(suggestions)) {
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      followUp: suggestions,
                    };
                    return updated;
                  });
                }
              }

              // Handle status event — push message to the active assistant msg
              if (event === "status") {
                const statusData = parsed.chat_response?.content?.message;
                // Normalize to objects regardless of if backend sends string or { icon, message }
                const normalizedStatus = typeof statusData === "string"
                  ? { message: statusData }
                  : statusData;

                if (normalizedStatus && normalizedStatus.message) {
                  setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                      ...last,
                      statusMessages: [...(last.statusMessages ?? []), normalizedStatus],
                    };
                    return updated;
                  });
                }
              }

              // Handle generated chart event
              if (event === "generated_chart") {
                const chartInfo = parsed.chat_response?.content || parsed.chat_response;
                if (chartInfo && chartInfo.type && chartInfo.data) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                      ...last,
                      chartData: {
                        type: chartInfo.type,
                        data: chartInfo.data,
                        options: chartInfo.options || {}
                      }
                    };
                    return updated;
                  });
                }
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [
    input,
    isStreaming,
    messages,
    selectedInsured,
    sessionId,
    webSearch,
    selectedModel,
    generateChart,
    selectedPdf,
    contextType,
    setSessionId,
    setSessions,
    updateSessionName,
    user?.email,
  ]);

  // ── Similarity Matcher ─────────────────────────────────────────────────────
  const getSimilarity = (inputStr: string, refStr: string) => {
    const input = inputStr.toLowerCase().trim();
    const ref = refStr.toLowerCase().trim();
    if (!input || !ref) return 0;
    if (input === ref) return 1.1; // Bonus for exact match

    // 1. Check for immediate substring/prefix matching (High priority)
    if (ref.startsWith(input)) return 0.9 + (input.length / ref.length);
    if (ref.includes(input)) return 0.7 + (input.length / ref.length);

    // 2. Dice Coefficient for fuzzy matching
    const left = input.replace(/\s+/g, "");
    const right = ref.replace(/\s+/g, "");
    if (left.length < 2 || right.length < 2) return 0;

    const leftBigrams = new Map();
    for (let i = 0; i < left.length - 1; i++) {
      const bigram = left.substring(i, i + 2);
      const count = leftBigrams.get(bigram) ?? 0;
      leftBigrams.set(bigram, count + 1);
    }

    let intersectionSize = 0;
    for (let i = 0; i < right.length - 1; i++) {
      const bigram = right.substring(i, i + 2);
      const count = leftBigrams.get(bigram) ?? 0;
      if (count > 0) {
        leftBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2.0 * intersectionSize) / (left.length + right.length - 2);
  };

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length < 2 || referenceQueries.length === 0) {
      setSuggestions([]);
      if (trimmed.length >= 2) {
        console.warn("[Suggestions] referenceQueries is empty – cannot suggest. Length:", referenceQueries.length);
      }
      return;
    }

    // Debug: log sample reference query structure
    if (referenceQueries.length > 0) {
      console.log("referenceQueries", referenceQueries);
      console.log("[Suggestions] Sample reference query keys:", Object.keys(referenceQueries[0]), "user_query:", referenceQueries[0].user_query);
    }

    const matches = referenceQueries
      .map((q: any) => {
        // Handle both plain strings AND objects
        const queryText =
          typeof q === "string"
            ? q
            : q.user_query || q.query || q.question || q.text || "";

        return {
          ...(typeof q === "object" ? q : {}),
          _matchedText: queryText,
          score: getSimilarity(trimmed, queryText),
        };
      })
      .filter((q: any) => q.score > 0.08)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3);

    console.log("[Suggestions] Input:", trimmed, "| Total refs:", referenceQueries.length, "| Matches:", matches.length);
    setSuggestions(matches);
  }, [input, referenceQueries]);

  const handleSelectSuggestion = (text: string) => {
    setInput("");
    setSuggestions([]);
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast({
        title: "Invalid file type",
        description: "Only PDF files are supported for document search.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    setSelectedPdf(file);
    setContextType("page_summary");
    toast({
      title: "PDF attached",
      description: `${file.name} attached. Document search is now on.`,
    });
    e.target.value = "";
  };

  // ── List pane ──────────────────────────────────────────────────────────────

  const listPane = (
    <div className="flex flex-col h-full w-full min-h-0 bg-background relative isolate">

      {/* Messages */}
      <ScrollArea
        className="flex-1 min-h-0 [&>[data-radix-scroll-area-viewport]>div]:!block [&>[data-radix-scroll-area-viewport]>div]:min-w-full"
        ref={scrollRef as any}
      >
        <div className="w-full px-6 lg:px-12 py-8 space-y-6 transition-all duration-300">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <Bot className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Select an insured name from the sidebar and ask a question.</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isLast = i === messages.length - 1;

            if (msg.role === "user") {
              return (
                <div key={i} className="flex gap-3 justify-end animate-fade-in group w-full">
                  <div className="flex flex-col items-end gap-1.5 max-w-[75%] min-w-0">
                    <div className="rounded-2xl rounded-tr-md rounded-br-md px-4 py-2.5 text-sm leading-relaxed bg-primary text-primary-foreground text-left break-words overflow-hidden">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.timestamp && (
                      <div className="pr-1 text-[10px] text-muted-foreground/60 font-medium">
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mt-1">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              );
            }

            return (
              <AssistantMessage
                key={i}
                content={msg.content}
                timestamp={msg.timestamp}
                isStreaming={isStreaming}
                isLast={isLast}
                moduleOutputs={msg.moduleOutputs ?? null}
                emailDraft={msg.emailDraft}
                onShowModules={() => setActiveDetail({ type: "modules", msgIndex: i })}
                onShowEmail={() => setActiveDetail({ type: "email", msgIndex: i })}
                followUp={msg.followUp}
                statusMessages={msg.statusMessages}
                chartData={msg.chartData}
                onFollowUpClick={(text) => handleSelectSuggestion(text)}
                onFeedback={(type) => setFeedbackState({ isOpen: true, type, msgIndex: i })}
                feedback={msg.feedback}
              />
            );
          })}
          <div ref={messagesEndRef} className="h-px w-full shrink-0" />
        </div>
      </ScrollArea>

      {/* Bottom area */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
        <div className="p-4 w-full">
          <div className="w-full px-2 lg:px-8 transition-all duration-300">

            {/* Input box wrapper */}
            <div className={cn(
              "rounded-2xl border transition-colors",
              !selectedInsured
                ? "bg-muted/40 border-border/60 opacity-80"
                : "bg-secondary/30 focus-within:bg-background focus-within:border-border/80",
              selectedInsured && webSearch && "border-blue-500/30",
              selectedInsured && selectedPdf && "border-amber-500/30"
            )}>

              {/* Suggestions Panel (Inline) */}
              {suggestions.length > 0 && (
                <div className="border-b border-border/40 bg-background/60 p-2 rounded-t-2xl animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto custom-scrollbar px-1 pb-1">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(s._matchedText)}
                        className="w-full text-left px-3 py-2 text-xs rounded-xl bg-card border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group flex items-center justify-between shadow-sm hover:shadow"
                      >
                        <span className="truncate flex-1 pr-4 font-medium text-muted-foreground group-hover:text-foreground transition-colors">{s._matchedText}</span>

                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No insured selected — amber warning banner */}
              {!selectedInsured && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1 animate-fade-in">
                  <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Select an insured from the sidebar to start chatting
                  </span>
                </div>
              )}

              {/* Active mode status banner */}
              {selectedInsured && (webSearch || generateChart || selectedPdf) && (
                <div className="flex flex-wrap items-center gap-x-4 px-4 pt-3 pb-1 animate-fade-in">
                  {webSearch && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-xs font-medium text-blue-500">
                        Web search is on — your message will search the web
                      </span>
                    </div>
                  )}
                  {generateChart && (
                    <div className={cn(
                      "flex items-center gap-2",
                      webSearch && "border-l border-border/40 pl-4"
                    )}>
                      <BarChart3 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-xs font-medium text-emerald-500/80">
                        Chart Mode is on
                      </span>
                    </div>
                  )}
                  {selectedPdf && (
                    <div className={cn(
                      "flex items-center gap-2",
                      (webSearch || generateChart) && "border-l border-border/40 pl-4"
                    )}>
                      <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-xs font-medium text-amber-500">
                        Doc search is on - {selectedPdf.name}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Textarea */}
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedInsured ? "Ask a question..." : "Choose an insured to begin..."}
                disabled={!selectedInsured}
                className={cn(
                  "min-h-[52px] max-h-[160px] resize-none border-0 shadow-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 text-sm",
                  !selectedInsured && "cursor-not-allowed text-muted-foreground"
                )}
                rows={1}
              />

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3 pt-1">

                {/* Left side: + and web search */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => selectedInsured && fileInputRef.current?.click()}
                    title="More options"
                    disabled={!selectedInsured}
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                      !selectedInsured
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <span className="text-lg leading-none mb-0.5">+</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfSelect}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => selectedInsured && setWebSearch((v) => !v)}
                    title={webSearch ? "Disable web search" : "Enable web search"}
                    disabled={!selectedInsured}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border transition-all",
                      !selectedInsured
                        ? "border-transparent text-muted-foreground/40 cursor-not-allowed"
                        : webSearch
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20"
                          : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>

                  {webSearch && (
                    <>
                      <div className="h-4 w-px bg-border/40 mx-1" />

                      {/* Model Selector */}
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="h-8 w-fit bg-transparent border-transparent hover:bg-muted text-xs font-medium gap-1.5 focus:ring-0 focus:ring-offset-0 px-2.5">
                          <Sparkles className="w-3 h-3 text-purple-500" />
                          <SelectValue placeholder="Model" />
                        </SelectTrigger>
                        <SelectContent align="start" className="w-[160px]">
                          <SelectItem value="gpt-5.2" className="text-xs">GPT 5.2</SelectItem>
                          <SelectItem value="claude-sonnet-4-6" className="text-xs">Claude Sonnet 4.6</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}

                  {selectedPdf && (
                    <>
                      <div className="h-4 w-px bg-border/40 mx-1" />
                      <Select value={contextType} onValueChange={(v) => setContextType(v as ContextType)}>
                        <SelectTrigger className="h-8 w-fit bg-transparent border-transparent hover:bg-muted text-xs font-medium gap-1.5 focus:ring-0 focus:ring-offset-0 px-2.5">
                          <FileText className="w-3 h-3 text-amber-500" />
                          <SelectValue placeholder="Context" />
                        </SelectTrigger>
                        <SelectContent align="start" className="w-[170px]">
                          <SelectItem value="page_summary" className="text-xs">page_summary</SelectItem>
                          <SelectItem value="chunk_summary" className="text-xs">chunk_summary</SelectItem>
                          <SelectItem value="section_summary" className="text-xs">section_summary</SelectItem>
                        </SelectContent>
                      </Select>
                      <button
                        type="button"
                        onClick={() => setSelectedPdf(null)}
                        title="Remove attached PDF"
                        className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Generate Chart Toggle */}
                  <button
                    type="button"
                    onClick={() => setGenerateChart(!generateChart)}
                    title={generateChart ? "Chart generation enabled" : "Enable chart generation"}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium border transition-all",
                      generateChart
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 shadow-sm"
                        : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Chart</span>
                  </button>
                </div>

                {/* Right side: Send button */}
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming || !selectedInsured}
                  className="h-9 w-9 rounded-xl shrink-0 shadow-sm"
                >
                  {isStreaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  // ── Detail pane ────────────────────────────────────────────────────────────

  const activeMsg = activeDetail !== null ? messages[activeDetail.msgIndex] : null;
  const activeEmailDraft = activeDetail?.type === "email" ? activeMsg?.emailDraft ?? null : null;
  const activeModuleOutputs = activeDetail?.type === "modules" ? activeMsg?.moduleOutputs ?? null : null;

  const detail =
    activeDetail?.type === "email" && activeEmailDraft
      ? {
        header: (
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  Drafted email
                </span>
                <span className="text-sm font-medium truncate max-w-[220px]">
                  {activeEmailDraft.subject || "No subject"}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
              onClick={() => setActiveDetail(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ),
        body: (
          <div className="pt-4 space-y-4">
            <FieldBlock label="To" value={activeEmailDraft.to?.join(", ") || "—"} />
            {activeEmailDraft.cc && activeEmailDraft.cc.length > 0 && (
              <FieldBlock label="CC" value={activeEmailDraft.cc.join(", ")} />
            )}
            {activeEmailDraft.bcc && activeEmailDraft.bcc.length > 0 && (
              <FieldBlock label="BCC" value={activeEmailDraft.bcc.join(", ")} />
            )}
            <FieldBlock label="Subject" value={activeEmailDraft.subject || "—"} />
            <FieldBlock label="Body" value={activeEmailDraft.body || "No body content."} />
          </div>
        ),
      }
      : activeDetail?.type === "modules" && activeModuleOutputs
        ? {
          header: (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    Module outputs
                  </span>
                  <span className="text-sm font-medium truncate max-w-[220px]">
                    Grounding / pipeline details
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                onClick={() => setActiveDetail(null)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ),
          body: (
            <div className="pt-4 space-y-3 px-1">
              {(() => {
                if (
                  !activeModuleOutputs ||
                  typeof activeModuleOutputs !== "object" ||
                  Array.isArray(activeModuleOutputs)
                ) {
                  return (
                    <FieldBlock
                      label="module_outputs"
                      value={activeModuleOutputs ?? "No module outputs available."}
                    />
                  );
                }

                const usedKeys = new Set<string>();
                const outputs = activeModuleOutputs as Record<string, any>;

                const getFields = (mapping: Record<string, string>) => {
                  return Object.entries(mapping).map(([key, label]) => {
                    if (outputs[key] !== undefined) {
                      usedKeys.add(key);
                      return <FieldBlock key={key} label={label} value={outputs[key]} defaultOpen={false} />;
                    }
                    return null;
                  }).filter(Boolean);
                };

                const sections = [
                  {
                    id: 2,
                    label: "Query Decomposer Agent",
                    content: getFields({
                      'resolvable': 'Query Resolvable',
                      'rewritten_user_query': 'Rewritten Query'
                    })
                  },
                    {
                      id: 3,
                      label: "Grounding Agent",
                      content: (
                        <div className="space-y-1">
                          {getFields({ 'filtered_knowledges': 'Knowledges' })}
                          {outputs['retrieved_queries'] !== undefined && (
                            <FieldBlock
                              label="Queries"
                              value={
                                Array.isArray(outputs['retrieved_queries'])
                                  ? outputs['retrieved_queries'].slice(0, 3).map((q: any) => ({
                                      query: q.user_query || q.query,
                                      knowledge_ids: q.knowledge_ids,
                                      intent_tags: q.intent_tags
                                    }))
                                  : outputs['retrieved_queries']
                              }
                              defaultOpen={true}
                            />
                          )}
                        </div>
                      )
                    },
                    {
                      id: 4,
                      label: "Intent Agent",
                      content: outputs['tool_response'] !== undefined ? (
                        <div className="py-2">
                          <ValueOnlyBlock value={outputs['tool_response']} />
                        </div>
                      ) : null
                    },
                    {
                      id: 5,
                      label: "Task Planning Agent",
                      content: outputs['final_pipeline_json'] !== undefined ? (
                        <div className="py-2">
                          <ValueOnlyBlock value={outputs['final_pipeline_json']} />
                        </div>
                      ) : null
                    },
                    {
                      id: 6,
                      label: "Execution Agent",
                      content: outputs['context_pack'] !== undefined ? (
                        <div className="py-2">
                          <ValueOnlyBlock value={outputs['context_pack']} />
                        </div>
                      ) : null
                    },
                    {
                      id: 7,
                      label: "Meta Data",
                      content: (
                        <div className="space-y-1">
                          {Object.entries(outputs)
                            .filter(([k]) => !usedKeys.has(k))
                            .map(([k, v]) => <FieldBlock key={`meta-${k}`} label={k} value={v} defaultOpen={false} />)
                          }
                        </div>
                      )
                    }
                  ];

                  // Mark keys as used for Intent, Planning, and Execution since we show them directly
                  if (outputs['tool_response'] !== undefined) usedKeys.add('tool_response');
                  if (outputs['final_pipeline_json'] !== undefined) usedKeys.add('final_pipeline_json');
                  if (outputs['context_pack'] !== undefined) usedKeys.add('context_pack');

                  return (
                    <>
                      {outputs['user_query'] !== undefined && (
                        <FieldBlock
                          label="User Query"
                          value={outputs['user_query']}
                          defaultOpen={true}
                        />
                      )}
                      {sections.map(section => (
                        <SectionBlock key={section.id} label={section.label} defaultOpen={section.label !== "Meta Data"}>
                          {section.content}
                        </SectionBlock>
                      ))}
                    </>
                  );
              })()}
            </div>
          ),
        }
        : null;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background relative isolate">
      <SplitPanelWrapper
        listPane={listPane}
        detail={detail}
        listPaneClassName="flex flex-col h-full w-full overflow-hidden bg-background"
      />

      <FeedbackModal
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState({ ...feedbackState, isOpen: false })}
        type={feedbackState.type}
        onSubmit={async (rating, comment) => {
          const msg = messages[feedbackState.msgIndex!];
          if (!msg || !msg.queryId) {
            console.error("[Feedback] No queryId found for message:", msg);
            return;
          }

          try {
            const res = await fetch(`${API_BASE}/gradio_demo/feedback`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user?.email,
                query_id: msg.queryId,
                session_id: sessionId || "default_session",
                status: feedbackState.type,
                rating_stars: `${rating}/5`,
                comments: comment
              })
            });

            if (!res.ok) throw new Error("Failed to submit feedback");

            // Update local state to show feedback immediately
            setMessages((prev) => {
              const updated = [...prev];
              updated[feedbackState.msgIndex!] = {
                ...updated[feedbackState.msgIndex!],
                feedback: {
                  status: feedbackState.type as "like" | "dislike",
                  rating_stars: `${rating}/5`,
                  comments: comment,
                },
              };
              return updated;
            });

            toast({
              title: "Thank you for your feedback!",
              description: "Your rating helps us improve the assistant.",
            });
          } catch (err) {
            console.error("[Feedback] Error:", err);
            toast({
              title: "Error",
              description: "Could not save feedback. Please try again.",
              variant: "destructive"
            });
          }
        }}
      />
    </div>
  );
};

export default GradioDemo;
