import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";

interface AIAssistPanelProps {
  contextSummary: string;
}

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engineering-chat`;

async function streamAssistantResponse({
  messages,
  context,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  context?: string;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (status: number, msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: "Unknown error" }));
    onError(resp.status, body.error || "Unknown error");
    return;
  }

  if (!resp.body) {
    onError(500, "No response body");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(payload) as any;
        const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (delta) {
          onDelta(delta);
        }
      } catch (error) {
        console.error("Failed to parse stream chunk", error);
      }
    }
  }

  onDone();
}

const AIAssistPanel = ({ contextSummary }: AIAssistPanelProps) => {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sendQuery = useCallback(async () => {
    if (!query.trim() || isLoading) return;

    const userMessage: Msg = { role: "user", content: query.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);
    setError(null);

    let assistantSoFar = "";
    const appendAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((msg, idx) => (idx === prev.length - 1 ? { ...msg, content: assistantSoFar } : msg));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamAssistantResponse({
      messages: [userMessage],
      context: contextSummary,
      onDelta: appendAssistant,
      onDone: () => setIsLoading(false),
      onError: (status, msg) => {
        setIsLoading(false);
        setError(msg);
      },
    });
  }, [contextSummary, isLoading, query]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="h-full rounded-3xl border border-card-border bg-background">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>AI Assist</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ask engineering questions in natural language and get contextual answers based on the electrical load calculator.
            </p>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Anthropic-ready
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-72px)] flex-col gap-4 pb-0">
        <div className="rounded-3xl border border-card-border bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-slate-900">Current calculator context</p>
          <p className="mt-1 whitespace-pre-wrap">{contextSummary}</p>
        </div>

        <ScrollArea className="flex-1 rounded-3xl border border-card-border bg-background p-3">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">Type one of the sample questions or ask something specific like “What live load should I use for an office floor?”</div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`rounded-2xl p-3 ${message.role === "user" ? "bg-primary text-primary-foreground self-end" : "bg-muted text-foreground"}`}>
                  {message.role === "assistant" ? <ReactMarkdown>{message.content}</ReactMarkdown> : <p>{message.content}</p>}
                </div>
              ))
            )}
            {isLoading && (
              <div className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">Thinking…</div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {error && <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

        <div className="space-y-3">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about live loads, safety factors, LRFD vs ASD, or code guidance…"
            rows={4}
            disabled={isLoading}
          />
          <div className="flex items-center gap-2">
            <Button onClick={sendQuery} disabled={isLoading || !query.trim()}>
              <Send className="w-4 h-4 mr-2" /> Ask AI
            </Button>
            <Button variant="outline" onClick={() => setMessages([])} disabled={isLoading}>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistPanel;
