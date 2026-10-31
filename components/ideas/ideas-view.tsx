"use client";

import { useState } from "react";
import { Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { InlineError } from "@/components/ui/error-state";
import { IdeaCard } from "./idea-card";
import { SuggestedIdeaCard } from "./suggested-idea-card";
import { useStore } from "@/components/providers/store-provider";
import { requestIdeas, AiClientError } from "@/lib/ai-client";
import { IDEA_TYPE_LABELS } from "@/lib/constants";
import { IDEA_TYPES, type IdeaType } from "@/types/idea";
import type { IdeaProposal } from "@/lib/schemas/ai";
import type { Event } from "@/types/event";
import { cn } from "@/lib/utils";

export function IdeasView({ event }: { event: Event }) {
  const { styleProfile, addIdea } = useStore();
  const [focus, setFocus] = useState<IdeaType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<IdeaProposal[]>([]);

  function toggleFocus(type: IdeaType) {
    setFocus((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await requestIdeas(event, styleProfile, focus.length > 0 ? focus : undefined);
      setSuggestions(result.ideas);
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const pinned = event.ideas.filter((i) => i.pinned);
  const unpinned = event.ideas.filter((i) => !i.pinned);

  return (
    <div className="space-y-6 p-5">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={15} className="text-accent" />
          <h2 className="text-sm font-medium text-foreground">Generate ideas</h2>
        </div>
        <p className="mb-3 text-xs text-muted">
          Personalized to {event.name}&apos;s guest count, city and budget, in your Style Profile voice.
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {IDEA_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => toggleFocus(type)}
              className={cn(
                "rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors",
                focus.includes(type)
                  ? "border-accent/40 bg-accent-muted text-accent-muted-foreground"
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              {IDEA_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate ideas"}
        </Button>
        {error ? <InlineError message={error} /> : null}

        {suggestions.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {suggestions.map((idea, i) => (
              <SuggestedIdeaCard
                key={i}
                idea={idea}
                onSave={() => addIdea(event.id, { ...idea, pinned: false })}
              />
            ))}
          </div>
        ) : null}
      </div>

      {event.ideas.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={24} />}
          title="No saved ideas yet"
          description="Generate some above, or they'll show up here once you save them."
        />
      ) : (
        <div className="space-y-5">
          {pinned.length > 0 ? (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Pinned</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pinned.map((idea) => (
                  <IdeaCard key={idea.id} eventId={event.id} idea={idea} />
                ))}
              </div>
            </div>
          ) : null}
          {unpinned.length > 0 ? (
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                All ideas
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unpinned.map((idea) => (
                  <IdeaCard key={idea.id} eventId={event.id} idea={idea} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
