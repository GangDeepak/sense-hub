import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, Mail, Boxes, X, Check, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGradioDemo } from "@/contexts/GradioDemoContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { SplitPanelWrapper, FieldBlock } from "@/components/grounding/SplitDetailPanel";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  moduleOutputs?: ModuleOutputs;
  emailDraft?: EmailDraft;
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
  "final_pipeline_json",
  "emails",
  "context_pack",
  "bot_response_text",
  "metrics",
  "created_at",
  "_id",
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
    return <p className="text-sm leading-relaxed my-1.5 text-foreground/90">{children}</p>;
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

// ── AssistantMessage component ───────────────────────────────────────────────

function AssistantMessage({
  content,
  isStreaming,
  isLast,
  moduleOutputs,
  emailDraft,
  timestamp,
  onShowModules,
  onShowEmail,
}: {
  content: string;
  isStreaming: boolean;
  isLast: boolean;
  moduleOutputs: ModuleOutputs | null;
  emailDraft?: EmailDraft;
  timestamp?: string;
  onShowModules: () => void;
  onShowEmail: () => void;
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

  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
        <Bot className="h-4 w-4 text-primary" />
      </div>

      <div className="max-w-[80%] min-w-0 flex flex-col">
        {/* Message bubble */}
        <div className="px-4 text-sm leading-relaxed overflow-hidden">
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
          <div className="mt-1.5 flex items-center justify-between px-1">
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
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Like</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <ThumbsDown className="w-3 h-3" />
                <span>Dislike</span>
              </button>
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
      </div>
    </div>
  );
}

// ── Main GradioDemo component ────────────────────────────────────────────────

const GradioDemo = () => {
  const { selectedInsured, sessionId, updateSessionName } = useGradioDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  // activeDetail: which message index's module/email panel is open
  const [activeDetail, setActiveDetail] = useState<{ type: "email" | "modules"; msgIndex: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on message or container size change
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]");
    if (!viewport) return;

    const scrollToBottom = () => {
      viewport.scrollTop = viewport.scrollHeight;
    };

    // 1. Initial scroll for new messages (synchronous update)
    scrollToBottom();

    // 2. Re-scroll on any layout changes (interactive resizing OR streaming content height changes)
    const observer = new ResizeObserver(() => requestAnimationFrame(scrollToBottom));
    observer.observe(viewport);
    
    // Radix places the actual content in the first child of the viewport
    const content = viewport.firstElementChild;
    if (content) {
      observer.observe(content);
    }

    return () => observer.disconnect();
  }, [messages]);

  // Load chat history when session changes
  useEffect(() => {
    if (!sessionId) return;
    setMessages([]);
    setActiveDetail(null);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/gradio_demo/chats/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        const loaded: ChatMessage[] = [];

        for (const chat of data.chats || []) {
          if (chat.user_query) {
            loaded.push({ 
              role: "user", 
              content: chat.user_query, 
              timestamp: chat.created_at || "" 
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
          let assistantTime = chat.created_at || "";
          if (assistantTime) {
            try {
              const d = new Date(assistantTime);
              d.setSeconds(d.getSeconds() + 2); // 2s offset for visual separation
              assistantTime = d.toISOString();
            } catch { /* fallback */ }
          }

          const { bot_response_text: _omit, ...rest } = chat;

          loaded.push({
            role: "assistant",
            content: displayContent,
            timestamp: assistantTime,
            moduleOutputs: Object.keys(rest).length > 0 ? rest : undefined,
            emailDraft,
          });
        }

        setMessages(loaded);
      } catch {
        // ignore
      }
    })();
  }, [sessionId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming || !selectedInsured) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => {
      if (prev.length === 0) {
        updateSessionName(sessionId, text.slice(0, 50));
      }
      return [...prev, userMsg];
    });
    setInput("");
    setIsStreaming(true);

    const assistantMsg: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/gradio_demo/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          session_id: sessionId || "default_session",
          query_id: crypto.randomUUID(),
          chat_history: history,
          insured_name: selectedInsured?.insured_name || "",
          ref_id: selectedInsured?.ref_id === "landing_page" ? "" : (selectedInsured?.ref_id || ""),
          web_search: webSearch,
        }),
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
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + chunk,
                      // Set timestamp on first chunk if not set
                      timestamp: last.timestamp || new Date().toISOString(),
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
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: finalText,
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
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      emailDraft: draft,
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
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      moduleOutputs: content,
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
  }, [input, isStreaming, messages, selectedInsured, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── List pane ──────────────────────────────────────────────────────────────

  const listPane = (
    <div className="flex flex-col h-full w-full min-h-0 bg-background relative isolate">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Gradio Demo</h1>
        </div>
        {selectedInsured && (
          <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border/50">
            Insured:{" "}
            <span className="font-medium text-foreground">{selectedInsured.insured_name}</span>
          </span>
        )}
      </div>

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
              />
            );
          })}
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
              selectedInsured && webSearch && "border-blue-500/30"
            )}>

              {/* No insured selected — amber warning banner */}
              {!selectedInsured && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1 animate-fade-in">
                  <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Select an insured from the sidebar to start chatting
                  </span>
                </div>
              )}

              {/* Web search active banner — only shown when insured is selected */}
              {selectedInsured && webSearch && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-1 animate-fade-in">
                  <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="text-xs font-medium text-blue-500">
                    Web search is on — your message will search the web
                  </span>
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
            <div className="pt-4 space-y-3">
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

                const entries = Object.entries(activeModuleOutputs as Record<string, unknown>);
                const orderMap = new Map<string, number>(
                  MODULE_OUTPUT_KEY_ORDER.map((k, idx) => [k as string, idx])
                );
                const sortedEntries = [...entries].sort(([a], [b]) => {
                  const ai = orderMap.has(a)
                    ? (orderMap.get(a) as number)
                    : Number.MAX_SAFE_INTEGER;
                  const bi = orderMap.has(b)
                    ? (orderMap.get(b) as number)
                    : Number.MAX_SAFE_INTEGER;
                  if (ai !== bi) return ai - bi;
                  return a.localeCompare(b);
                });

                return sortedEntries.map(([key, value]) => (
                  <FieldBlock key={key} label={key} value={value} />
                ));
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
    </div>
  );
};

export default GradioDemo;