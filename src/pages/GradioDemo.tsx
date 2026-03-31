import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Copy, ThumbsUp, ThumbsDown, Mail, Boxes, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGradioDemo } from "@/contexts/GradioDemoContext";
import { marked } from "marked";
import { SplitPanelWrapper, FieldBlock } from "@/components/grounding/SplitDetailPanel";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

const GradioDemo = () => {
  const { selectedInsured, sessionId, updateSessionName } = useGradioDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [emailDraft, setEmailDraft] = useState<EmailDraft | null>(null);
  const [moduleOutputs, setModuleOutputs] = useState<ModuleOutputs | null>(null);
  const [activeDetail, setActiveDetail] = useState<"email" | "modules" | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load chat history when session changes
  useEffect(() => {
    if (!sessionId) return;
    setMessages([]);
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/gradio_demo/chats/${sessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        const loaded: ChatMessage[] = [];
        for (const chat of data.chats || []) {
          if (chat.user_query) loaded.push({ role: "user", content: chat.user_query });
          if (chat.bot_response_text) loaded.push({ role: "assistant", content: chat.bot_response_text });
        }
        setMessages(loaded);
      } catch {
        // ignore
      }
    })();
  }, [sessionId]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => {
      // Set session name from first user message
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
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${API_BASE}/gradio_demo/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          session_id: sessionId || "default_session",
          query_id: crypto.randomUUID(),
          chat_history: history,
          insured_name: selectedInsured?.insured_name || "",
          ref_id: selectedInsured?.ref_id || "",
          web_search: false,
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
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: `Error: ${parsed.error}`,
                  };
                  return updated;
                });
                break;
              }

              const event = parsed.event as string | undefined;
              const responseType = parsed.response_type as string | undefined;

              // Handle streaming markdown chunks
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
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: updated[updated.length - 1].content + chunk,
                    };
                    return updated;
                  });
                }
              }

              // Handle final email payload
              if (event === "end" && responseType === "email") {
                const email = parsed.chat_response?.content ?? parsed.chat_response?.data ?? {};
                const draft: EmailDraft = {
                  subject: email.subject || "",
                  body: email.body || "",
                  to: email.to || [],
                  cc: email.cc || [],
                  bcc: email.bcc || [],
                };
                setEmailDraft(draft);
              }

              // Handle module outputs metadata
              if (event === "metadata") {
                const content = parsed.chat_response?.content;
                if (content) {
                  setModuleOutputs(content);
                }
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (err) {
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
            Insured: <span className="font-medium text-foreground">{selectedInsured.insured_name}</span>
          </span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollRef as any}>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <Bot className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Select an insured name from the sidebar and ask a question.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3 animate-fade-in",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}
              >
                {msg.role === "assistant" ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                {msg.role === "assistant" && i === messages.length - 1 && isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-0.5 rounded-sm" />
                )}

                {/* Action bar below assistant messages (last answer) */}
                {msg.role === "assistant" && i === messages.length - 1 && !isStreaming && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-muted/80"
                      onClick={() => navigator.clipboard.writeText(msg.content).catch(() => {})}
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-muted/80"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Like</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-muted/80"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>Dislike</span>
                    </button>
                    {moduleOutputs && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded hover:bg-muted/80"
                        onClick={() => setActiveDetail("modules")}
                      >
                        <Boxes className="w-3 h-3" />
                        <span>See module outputs</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Fixed bottom area: email hint + chatbox */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
        {emailDraft && (
          <div className="border-b px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            <span>I have drafted an email. Would you like to preview it?</span>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 h-7 px-2.5 text-xs"
              onClick={() => setActiveDetail("email")}
            >
              Preview email
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 w-full">
          <div className="flex gap-2 items-end max-w-4xl mx-auto relative px-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={selectedInsured ? "Ask a question..." : "Select an insured name first..."}
              className="min-h-[52px] max-h-[200px] resize-none rounded-xl pr-14 py-3 bg-secondary/30 focus-visible:bg-background transition-colors"
              rows={1}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              className="absolute right-4 bottom-2 h-9 w-9 rounded-lg shrink-0 touch-none shadow-sm"
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
  );

  const detail =
    activeDetail === "email" && emailDraft
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
                    {emailDraft.subject || "No subject"}
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
              <FieldBlock label="To" value={emailDraft.to?.join(", ") || "—"} />
              {emailDraft.cc && emailDraft.cc.length > 0 && (
                <FieldBlock label="CC" value={emailDraft.cc.join(", ")} />
              )}
              {emailDraft.bcc && emailDraft.bcc.length > 0 && (
                <FieldBlock label="BCC" value={emailDraft.bcc.join(", ")} />
              )}
              <FieldBlock label="Subject" value={emailDraft.subject || "—"} />
              <FieldBlock label="Body" value={emailDraft.body || "No body content."} />
            </div>
          ),
        }
      : activeDetail === "modules" && moduleOutputs
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
                if (!moduleOutputs || typeof moduleOutputs !== "object" || Array.isArray(moduleOutputs)) {
                  return <FieldBlock label="module_outputs" value={moduleOutputs ?? "No module outputs available."} />;
                }

                const entries = Object.entries(moduleOutputs as Record<string, unknown>);
                const orderMap = new Map<string, number>(MODULE_OUTPUT_KEY_ORDER.map((k, idx) => [k as string, idx]));
                const sortedEntries = [...entries].sort(([a], [b]) => {
                  const ai = orderMap.has(a) ? (orderMap.get(a) as number) : Number.MAX_SAFE_INTEGER;
                  const bi = orderMap.has(b) ? (orderMap.get(b) as number) : Number.MAX_SAFE_INTEGER;
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
      <SplitPanelWrapper listPane={listPane} detail={detail} listPaneClassName="flex flex-col h-full w-full overflow-hidden bg-background" />
    </div>
  );
};

export default GradioDemo;
