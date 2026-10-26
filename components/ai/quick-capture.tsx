"use client";

import { useState } from "react";
import { Sparkles, AlertTriangle, Info, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { InlineError } from "@/components/ui/error-state";
import { ProposalReview } from "./proposal-review";
import { MicButton } from "./mic-button";
import { useStore } from "@/components/providers/store-provider";
import { useApplyProposals } from "@/lib/hooks/use-apply-proposals";
import { requestQuickCapture, AiClientError } from "@/lib/ai-client";
import { quickCaptureToProposals } from "@/lib/quick-capture-mapping";
import type { Event } from "@/types/event";
import type { QuickCaptureResult } from "@/lib/schemas/ai";
import { cn } from "@/lib/utils";

export function QuickCapture({ event }: { event: Event }) {
  const { styleProfile } = useStore();
  const { applyProposals } = useApplyProposals(event);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickCaptureResult | null>(null);
  const [applied, setApplied] = useState(false);

  async function handleCapture() {
    if (!note.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setApplied(false);
    try {
      const data = await requestQuickCapture(event, styleProfile, note);
      setResult(data);
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const proposals = result ? quickCaptureToProposals(result) : [];

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={15} className="text-accent" />
        <h2 className="text-sm font-medium text-foreground">Quick capture</h2>
      </div>
      <p className="mb-3 text-xs text-muted">
        Paste or dictate a messy note — new tasks, costs, vendor updates — and review what Occasion
        picks out before anything changes.
      </p>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={`e.g. "ok so caterer called said per plate cost going up to twelve hundred a plate for the two fifty guests also need to book a mehendi artist follow up..."`}
        rows={4}
        aria-label="Quick capture note"
        className="text-sm"
      />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MicButton onTranscript={(text) => setNote((prev) => (prev ? `${prev} ${text}` : text))} />
          <span className="text-xs text-muted">{note.length} characters</span>
        </div>
        <Button variant="primary" size="sm" onClick={handleCapture} disabled={loading || !note.trim()}>
          {loading ? "Thinking..." : "Capture"}
        </Button>
      </div>

      {error ? <InlineError message={error} /> : null}

      {result && result.flags.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {result.flags.map((flag, i) => (
            <div
              key={i}
              className={cn(
                "flex items-start gap-2 rounded-md border px-2.5 py-2 text-xs",
                flag.severity === "warning"
                  ? "border-warning/30 bg-warning/10 text-warning"
                  : "border-border bg-surface2 text-muted"
              )}
            >
              {flag.severity === "warning" ? (
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              ) : (
                <Info size={13} className="mt-0.5 shrink-0" />
              )}
              <span>{flag.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      {result && proposals.length > 0 ? (
        <ProposalReview
          className="mt-3"
          proposals={proposals}
          onApply={(selected) => {
            applyProposals(selected);
            setApplied(true);
            setResult(null);
            setNote("");
          }}
          onDismiss={() => setResult(null)}
        />
      ) : null}

      {result && proposals.length === 0 && result.flags.length === 0 ? (
        <p className="mt-3 text-xs text-muted">Nothing structured found in that note.</p>
      ) : null}

      {applied ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
          <Check size={13} />
          Applied to {event.name}.
        </p>
      ) : null}
    </div>
  );
}
