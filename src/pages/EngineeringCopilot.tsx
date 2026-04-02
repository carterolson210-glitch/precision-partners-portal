import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Plus, MessageSquare, Trash2, Clock, Lock,
  ChevronRight, Paperclip, Sparkles, X,
} from "lucide-react";

/* ───── types ───── */
type Msg = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; created_at: string };

/* ───── prompt library ───── */
const PROMPT_CATEGORIES = [
  {
    discipline: "Structural",
    prompts: [
      "Calculate the required moment of inertia for a simply supported beam with a uniform distributed load.",
      "What are the ASCE 7 load combinations for LRFD design?",
      "Explain the difference between ASD and LRFD design methods.",
      "Help me size a steel W-shape beam for a given span and loading.",
    ],
  },
  {
    discipline: "Civil",
    prompts: [
      "What are the standard steps for a building permit application?",
      "Explain the stormwater management requirements for a 1-acre site.",
      "What are the typical phases of a civil site development project?",
      "Help me estimate earthwork quantities for cut and fill.",
    ],
  },
  {
    discipline: "Mechanical",
    prompts: [
      "How do I size an HVAC system for a 10,000 sq ft commercial space?",
      "What are the ASHRAE 90.1 energy code requirements for mechanical systems?",
      "Explain the differences between VAV and constant volume systems.",
      "Help me calculate the heating and cooling loads for a building zone.",
    ],
  },
  {
    discipline: "Geotechnical",
    prompts: [
      "What soil tests are required for a geotechnical site investigation?",
      "How do I calculate the allowable bearing capacity from SPT N-values?",
      "Explain the Unified Soil Classification System (USCS).",
      "What foundation type is best for expansive clay soils?",
    ],
  },
  {
    discipline: "Environmental",
    prompts: [
      "What triggers a NEPA environmental impact assessment?",
      "Explain SWPPP requirements for construction sites.",
      "What are the EPA stormwater discharge permit requirements?",
      "How do I develop an erosion and sediment control plan?",
    ],
  },
];

/* ───── streaming helper ───── */
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engineering-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (status: number, msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: "Unknown error" }));
    onError(resp.status, body.error || "Unknown error");
    return;
  }

  if (!resp.body) { onError(500, "No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

/* ───── locked preview for Tier 1 ───── */
const LockedPreview = () => (
  <div className="flex-1 flex items-center justify-center p-8">
    <div className="text-center max-w-md space-y-4">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground font-display">Engineering Copilot</h2>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Get instant AI-powered answers to structural calculations, building code questions,
        material selection, cost estimation, and more. Available on Growing and Enterprise plans.
      </p>
      <Button variant="gold" onClick={() => window.location.href = "/pricing"}>
        Upgrade to Unlock
      </Button>
    </div>
  </div>
);

/* ───── main component ───── */
const EngineeringCopilot = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // For now, all authenticated users get access (tier gating placeholder)
  // In production, check subscription tier from a subscriptions table
  const [hasAccess] = useState(true);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* load conversations */
  useEffect(() => {
    if (!user) return;
    supabase
      .from("ai_conversations")
      .select("id, title, created_at")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) setConversations(data);
      });
  }, [user]);

  /* load messages when conversation changes */
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    supabase
      .from("ai_chat_messages")
      .select("role, content")
      .eq("conversation_id", activeConvId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Msg[]);
      });
  }, [activeConvId]);

  /* auto-scroll */
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const createConversation = useCallback(async (firstMsg: string) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: user!.id, title })
      .select("id, title, created_at")
      .single();
    if (error || !data) { toast({ title: "Error", description: "Could not create conversation", variant: "destructive" }); return null; }
    setConversations((prev) => [data, ...prev]);
    setActiveConvId(data.id);
    return data.id;
  }, [user, toast]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading || !user) return;
    setInput("");
    const userMsg: Msg = { role: "user", content: text.trim() };

    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation(text.trim());
      if (!convId) return;
    }

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // persist user message
    await supabase.from("ai_chat_messages").insert({
      conversation_id: convId,
      user_id: user.id,
      role: "user",
      content: text.trim(),
    });

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: [...messages, userMsg],
      onDelta: upsert,
      onDone: async () => {
        setIsLoading(false);
        // persist assistant message
        if (assistantSoFar) {
          await supabase.from("ai_chat_messages").insert({
            conversation_id: convId!,
            user_id: user.id,
            role: "assistant",
            content: assistantSoFar,
          });
          // update conversation timestamp
          await supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId!);
        }
      },
      onError: (status, msg) => {
        setIsLoading(false);
        toast({
          title: status === 429 ? "Rate Limited" : status === 402 ? "Credits Exhausted" : "Error",
          description: msg,
          variant: "destructive",
        });
      },
    });
  }, [activeConvId, messages, isLoading, user, createConversation, toast]);

  const deleteConversation = async (id: string) => {
    await supabase.from("ai_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
  };

  const newChat = () => { setActiveConvId(null); setMessages([]); setInput(""); };

  if (!hasAccess) {
    return (
      <DashboardLayout title="Engineering Copilot">
        <LockedPreview />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Engineering Copilot">
      <div className="flex gap-4 h-[calc(100vh-var(--nav-height)-120px)]">
        {/* ── History sidebar ── */}
        {showHistory && (
          <div className="w-64 flex-shrink-0 bg-background border border-card-border rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-card-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">History</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={newChat}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {conversations.length === 0 && (
                  <p className="text-xs text-muted-foreground p-3 text-center">No conversations yet</p>
                )}
                {conversations.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                      activeConvId === c.id ? "bg-accent text-accent-foreground" : "hover:bg-muted text-muted-foreground"
                    }`}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate flex-1">{c.title}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col bg-background border border-card-border rounded-xl overflow-hidden">
          {/* toolbar */}
          <div className="p-3 border-b border-card-border flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-xs">
              <Clock className="w-3.5 h-3.5 mr-1" /> History
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowPrompts(!showPrompts)} className="text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Prompts
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={newChat} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Chat
            </Button>
          </div>

          {/* messages */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Engineering Copilot</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me about structural calculations, building codes, material selection,
                  cost estimation, permits, scheduling, and more.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                    {m.role === "assistant" && (
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`rounded-xl px-4 py-3 max-w-[80%] text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-muted rounded-xl px-4 py-3">
                      <span className="text-sm text-muted-foreground">Thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          {/* input bar */}
          <div className="p-3 border-t border-card-border">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2 max-w-3xl mx-auto"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about structural loads, building codes, materials…"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Always consult a licensed PE for code compliance decisions. This assistant does not provide legal, medical, or financial advice.
            </p>
          </div>
        </div>

        {/* ── Prompt library ── */}
        {showPrompts && (
          <div className="w-72 flex-shrink-0 bg-background border border-card-border rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-card-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Prompt Library</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPrompts(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-4">
                {PROMPT_CATEGORIES.map((cat) => (
                  <div key={cat.discipline}>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {cat.discipline}
                    </h4>
                    <div className="space-y-1.5">
                      {cat.prompts.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => { setInput(p); setShowPrompts(false); }}
                          className="w-full text-left text-xs text-foreground bg-muted hover:bg-accent rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
                        >
                          <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                          <span className="line-clamp-2">{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EngineeringCopilot;
