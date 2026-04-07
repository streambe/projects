"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  content_sanitized: string | null;
  model: string | null;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
};

type ChatPanelProps = {
  projectId: string;
  canEdit: boolean;
  isBlocked: boolean;
  currentCap: number;
};

export function ChatPanel({
  projectId,
  canEdit,
  isBlocked,
  currentCap,
}: ChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [newCap, setNewCap] = useState(String(Math.max(currentCap * 2, 100)));
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  // Load initial history.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/messages`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (!alive) return;
        if (res.ok) {
          setMessages(json.data ?? []);
        } else {
          setError(json.error ?? "No pude cargar la conversación.");
        }
      } catch {
        if (alive) setError("No pude cargar la conversación.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [projectId]);

  // Auto-scroll when new content arrives, unless the user scrolled up.
  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stickToBottomRef.current = nearBottom;
  };

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !canEdit || isBlocked) return;
    setSending(true);
    setError(null);
    setStreamingText("");
    stickToBottomRef.current = true;

    // Optimistic user message.
    const optimistic: MessageRow = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: text,
      content_sanitized: null,
      model: null,
      input_tokens: 0,
      output_tokens: 0,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    setDraft("");

    try {
      const res = await fetch(`/api/projects/${projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (res.status === 402 || json.error === "cost_blocked") {
          setError(
            json.message ?? "El proyecto alcanzó el tope de costo.",
          );
          setOverrideOpen(true);
        } else {
          setError(json.error ?? "Error al enviar el mensaje.");
        }
        setStreamingText(null);
        setSending(false);
        return;
      }

      if (!res.body) {
        setError("No hay stream de respuesta.");
        setStreamingText(null);
        setSending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamingText(acc);
      }

      // Refetch full history to pick up canonical server-side ids + sanitization.
      const refreshed = await fetch(`/api/projects/${projectId}/messages`, {
        cache: "no-store",
      });
      const json = await refreshed.json();
      if (refreshed.ok) {
        setMessages(json.data ?? []);
      }
      setStreamingText(null);
      // Refresh server components (cost meter, status).
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red.");
      setStreamingText(null);
    } finally {
      setSending(false);
    }
  }, [draft, sending, canEdit, isBlocked, projectId, router]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const submitOverride = async () => {
    const parsed = Number(newCap);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setOverrideSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/cost-override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_cap_usd: parsed }),
      });
      if (res.ok) {
        setOverrideOpen(false);
        setError(null);
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "No se pudo extender el tope.");
      }
    } finally {
      setOverrideSubmitting(false);
    }
  };

  if (!canEdit) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 px-6 py-12 text-center text-sm text-muted-foreground">
        Modo solo lectura. Tomá el proyecto para interactuar.
      </div>
    );
  }

  const hasAnyMessages = messages.length > 0 || streamingText !== null;

  return (
    <div className="flex h-[min(70vh,640px)] flex-col gap-3">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/10 p-4"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando conversación…
          </div>
        ) : !hasAnyMessages ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
            Escribí el primer mensaje para que Alan Turing arranque el
            relevamiento.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content_sanitized ?? m.content}
              />
            ))}
            {streamingText !== null && (
              <MessageBubble
                role="assistant"
                content={streamingText || "…"}
                streaming
              />
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {isBlocked && !overrideOpen && (
        <div className="flex items-center justify-between rounded border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs">
          <span className="text-destructive">
            Proyecto bloqueado por tope de costo.
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOverrideOpen(true)}
          >
            Extender tope
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            isBlocked
              ? "Proyecto bloqueado — extendé el tope para continuar."
              : "Escribí tu mensaje… (Enter para enviar, Shift+Enter para nueva línea)"
          }
          disabled={sending || isBlocked}
          rows={2}
          className="min-h-[60px] flex-1 resize-none"
        />
        <Button
          onClick={send}
          disabled={sending || isBlocked || !draft.trim()}
          size="icon"
          className="h-[60px] w-[60px]"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Dialog open={overrideOpen} onOpenChange={setOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extender tope de costo</DialogTitle>
            <DialogDescription>
              El proyecto alcanzó el tope actual de USD {currentCap.toFixed(2)}.
              Definí un nuevo tope para desbloquear el chat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs uppercase tracking-wide text-muted-foreground">
              Nuevo tope (USD)
            </label>
            <Input
              type="number"
              min={1}
              step={1}
              value={newCap}
              onChange={(e) => setNewCap(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOverrideOpen(false)}
              disabled={overrideSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={submitOverride} disabled={overrideSubmitting}>
              {overrideSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}) {
  if (role === "system") {
    return (
      <div className="mx-auto max-w-md rounded border border-border/40 bg-muted/20 px-3 py-2 text-center text-xs text-muted-foreground">
        {content}
      </div>
    );
  }

  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex gap-3",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-[11px] font-semibold",
            isUser
              ? "bg-primary/20 text-primary"
              : "bg-blue-500/20 text-blue-400",
          )}
        >
          {isUser ? "YO" : "AT"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] space-y-1 rounded-lg px-3 py-2 text-sm",
          isUser
            ? "bg-primary/10 text-foreground"
            : "border border-border/60 bg-background",
        )}
      >
        {!isUser && (
          <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">
            Alan Turing — PM
          </div>
        )}
        <div className="whitespace-pre-wrap leading-relaxed">
          {content}
          {streaming && (
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-current align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
