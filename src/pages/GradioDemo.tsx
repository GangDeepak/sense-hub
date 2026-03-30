import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGradioDemo } from "@/contexts/GradioDemoContext";
import { marked } from "marked";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GradioDemo = () => {
  const { selectedInsured, sessionId, updateSessionName } = useGradioDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
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
    setMessages((prev) => [...prev, userMsg]);
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
              // Append text chunk
              const chunk = parsed.text || parsed.content || parsed.answer || "";
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

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center gap-2">
        <Bot className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Gradio Demo</h1>
        {selectedInsured && (
          <span className="ml-auto text-sm text-muted-foreground">
            Insured: <span className="font-medium text-foreground">{selectedInsured.insured_name}</span>
          </span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef as any}>
        <div className="py-4 space-y-4">
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

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2 items-end max-w-4xl mx-auto">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedInsured ? "Ask a question..." : "Select an insured name first..."}
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl"
            rows={1}
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="h-11 w-11 rounded-xl shrink-0"
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
  );
};

export default GradioDemo;
