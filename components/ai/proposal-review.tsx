"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { describeProposal } from "@/lib/proposal-labels";
import type { AssistantProposal } from "@/lib/schemas/ai";
import { cn } from "@/lib/utils";

interface ProposalReviewProps {
  proposals: AssistantProposal[];
  onApply: (selected: AssistantProposal[]) => void;
  onDismiss?: () => void;
  className?: string;
}

export function ProposalReview({ proposals, onApply, onDismiss, className }: ProposalReviewProps) {
  const [selected, setSelected] = useState<boolean[]>(() => proposals.map(() => true));

  useEffect(() => {
    setSelected(proposals.map(() => true));
  }, [proposals]);

  if (proposals.length === 0) return null;

  const selectedCount = selected.filter(Boolean).length;
  const allSelected = selectedCount === proposals.length;

  function toggle(index: number) {
    setSelected((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  function toggleAll() {
    setSelected(proposals.map(() => !allSelected));
  }

  function handleApply() {
    const chosen = proposals.filter((_, i) => selected[i]);
    onApply(chosen);
  }

  return (
    <div className={cn("rounded-lg border border-accent/30 bg-accent-muted/20 p-3.5", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Proposed changes &middot; review before applying
        </p>
        <button onClick={toggleAll} className="text-xs text-muted hover:text-foreground">
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <ul className="space-y-1.5">
        {proposals.map((proposal, index) => {
          const { title, detail } = describeProposal(proposal);
          const checked = selected[index];
          return (
            <li key={index}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md border border-border bg-surface p-2.5 text-sm hover:border-accent/40">
                <span
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked ? "border-accent bg-accent-solid text-accent-foreground" : "border-border"
                  )}
                >
                  {checked ? <Check size={11} /> : null}
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(index)}
                  className="sr-only"
                  aria-label={title}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-foreground">{title}</span>
                  {detail ? <span className="mt-0.5 block text-xs text-muted">{detail}</span> : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex justify-end gap-2">
        {onDismiss ? (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
        <Button variant="primary" size="sm" onClick={handleApply} disabled={selectedCount === 0}>
          Apply {selectedCount > 0 ? `(${selectedCount})` : ""}
        </Button>
      </div>
    </div>
  );
}
