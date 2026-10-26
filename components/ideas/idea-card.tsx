"use client";

import { Pin, PinOff, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IDEA_TYPE_LABELS } from "@/lib/constants";
import { useStore } from "@/components/providers/store-provider";
import type { Idea } from "@/types/idea";
import { cn } from "@/lib/utils";

export function IdeaCard({ eventId, idea }: { eventId: string; idea: Idea }) {
  const { updateIdea, deleteIdea } = useStore();

  return (
    <div
      className={cn(
        "rounded-md border bg-surface2 p-3.5",
        idea.pinned ? "border-accent/40" : "border-border"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Badge tone="neutral">{IDEA_TYPE_LABELS[idea.type]}</Badge>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => updateIdea(eventId, idea.id, { pinned: !idea.pinned })}
            aria-label={idea.pinned ? "Unpin idea" : "Pin idea"}
            className={cn(
              "rounded p-1.5 hover:bg-surface",
              idea.pinned ? "text-accent" : "text-muted hover:text-foreground"
            )}
          >
            {idea.pinned ? <Pin size={13} /> : <PinOff size={13} />}
          </button>
          <button
            onClick={() => deleteIdea(eventId, idea.id)}
            aria-label="Delete idea"
            className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{idea.title}</p>
      <p className="mt-1 text-sm text-muted">{idea.body}</p>
    </div>
  );
}
