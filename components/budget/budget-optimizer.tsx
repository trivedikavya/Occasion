"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error-state";
import { ProposalReview } from "@/components/ai/proposal-review";
import { useStore } from "@/components/providers/store-provider";
import { useApplyProposals } from "@/lib/hooks/use-apply-proposals";
import { requestBudgetOptimizer, AiClientError } from "@/lib/ai-client";
import type { Event } from "@/types/event";
import type { AssistantProposal } from "@/lib/schemas/ai";

export function BudgetOptimizer({ event }: { event: Event }) {
  const { styleProfile } = useStore();
  const { applyProposals } = useApplyProposals(event);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [proposals, setProposals] = useState<AssistantProposal[] | null>(null);

  async function handleOptimize() {
    setLoading(true);
    setError(null);
    setProposals(null);
    setSummary(null);
    try {
      const result = await requestBudgetOptimizer(event, styleProfile);
      setSummary(result.summary || null);
      setProposals(
        result.changes.map((c) => ({
          type: "update_budget_item" as const,
          category: c.category,
          planned: c.suggestedPlanned,
          actual: null,
          reason: c.reason,
        }))
      );
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 size={15} className="text-accent" />
          <h2 className="text-sm font-medium text-foreground">Budget optimizer</h2>
        </div>
        <Button variant="secondary" size="sm" onClick={handleOptimize} disabled={loading}>
          {loading ? "Analyzing..." : "Suggest reallocations"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Suggests moving planned amounts between categories, within the same total budget.
      </p>

      {error ? <InlineError message={error} className="mt-3" /> : null}
      {summary ? <p className="mt-3 text-xs text-muted">{summary}</p> : null}

      {proposals && proposals.length > 0 ? (
        <ProposalReview
          className="mt-3"
          proposals={proposals}
          onApply={(selected) => {
            applyProposals(selected);
            setProposals(null);
            setSummary(null);
          }}
          onDismiss={() => setProposals(null)}
        />
      ) : null}
    </div>
  );
}
