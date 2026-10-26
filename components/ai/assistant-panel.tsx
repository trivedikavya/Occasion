"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Trash2, ArrowUp } from "lucide-react";
import { Sheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { InlineError } from "@/components/ui/error-state";
import { ProposalReview } from "./proposal-review";
import { MicButton } from "./mic-button";
import { useStore } from "@/components/providers/store-provider";
import { useApplyProposals } from "@/lib/hooks/use-apply-proposals";
import { streamAssistant, AiClientError } from "@/lib/ai-client";
import { loadChatHistory, saveChatHistory, clearChatHistory, newChatMessage, type ChatMessage } from "@/lib/chat-store";
import type { Event } from "@/types/event";
import { cn } from "@/lib/utils";

interface AssistantPanelProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssistantPanel({ event, open, onOpenChange }: AssistantPanelProps) {
  const { styleProfile } = useStore();
  const { applyProposals } = useApplyProposals(event);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadChatHistory(event.id));
  }, [event.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streamingText]);

  function persist(next: ChatMessage[]) {
    setMessages(next);
    saveChatHistory(event.id, next);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streamingText !== null) return;
    setInput("");
    setError(null);

    const userMsg = newChatMessage("user", text);
    const withUser = [...messages, userMsg];
    persist(withUser);
    setStreamingText("");

    try {
      const history = withUser.slice(0, -1).map((m) => ({
        role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
        text: m.text,
      }));

      let accumulated = "";
      const payload = await streamAssistant({ event, styleProfile, message: text, history }, (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      });

      const assistantMsg = newChatMessage("assistant", accumulated.trim(), payload.proposals);
      persist([...withUser, assistantMsg]);
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setStreamingText(null);
    }
  }

  function handleApply(message: ChatMessage, selected: ChatMessage["proposals"]) {
    applyProposals(selected);
    persist(
      messages.map((m) => (m.id === message.id ? { ...m, appliedAt: new Date().toISOString() } : m))
    );
  }

  function handleClear() {
    clearChatHistory(event.id);
    setMessages([]);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Assistant"
      description={`Knows everything about ${event.name}.`}
      widthClassName="w-[min(440px,100vw)]"
    >
      <div className="flex h-full flex-col">
        <div className="mb-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={messages.length === 0}>
            <Trash2 size={13} />
            Clear chat
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && streamingText === null ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
              <Sparkles size={22} className="text-muted" />
              <p className="text-sm text-foreground">Ask about {event.name}</p>
              <p className="max-w-[240px] text-xs text-muted">
                Try &ldquo;what&apos;s overdue?&rdquo;, &ldquo;how much is left for decor?&rdquo;, or
                &ldquo;add tasks for DJ and mehendi artist due next month&rdquo;.
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div className={cn("max-w-[88%] space-y-2", message.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "whitespace-pre-wrap rounded-md px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface2 text-foreground"
                  )}
                >
                  {message.text}
                </div>
                {message.proposals.length > 0 && !message.appliedAt ? (
                  <ProposalReview
                    proposals={message.proposals}
                    onApply={(selected) => handleApply(message, selected)}
                  />
                ) : null}
                {message.appliedAt ? (
                  <p className="text-xs text-success">Applied.</p>
                ) : null}
              </div>
            </div>
          ))}

          {streamingText !== null ? (
            <div className="flex justify-start">
              <div className="max-w-[88%] whitespace-pre-wrap rounded-md bg-surface2 px-3 py-2 text-sm text-foreground">
                {streamingText}
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-muted/60 align-middle" />
              </div>
            </div>
          ) : null}
        </div>

        {error ? <InlineError message={error} /> : null}

        <div className="mt-3 flex items-end gap-2 border-t border-border pt-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask or tell the assistant what to change..."
            rows={2}
            aria-label="Message the assistant"
            className="text-sm"
          />
          <MicButton onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))} />
          <Button
            variant="primary"
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || streamingText !== null}
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
