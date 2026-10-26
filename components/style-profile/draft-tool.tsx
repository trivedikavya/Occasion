"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { InlineError } from "@/components/ui/error-state";
import { useStore } from "@/components/providers/store-provider";
import { requestDraft, AiClientError } from "@/lib/ai-client";
import { DRAFT_FORMATS, DRAFT_FORMAT_LABELS, type DraftFormat } from "@/types/styleProfile";

export function DraftTool() {
  const { styleProfile } = useStore();
  const [format, setFormat] = useState<DraftFormat>("whatsapp");
  const [roughNote, setRoughNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<string | null>(null);

  async function handleGenerate() {
    if (!roughNote.trim()) return;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const result = await requestDraft(format, styleProfile, roughNote);
      setDraft(result.draft);
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wand2 size={15} className="text-accent" />
          <CardTitle className="normal-case tracking-normal text-sm text-foreground">
            Draft with my style
          </CardTitle>
        </div>
      </CardHeader>
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div>
          <Label htmlFor="draft-format">Format</Label>
          <Select
            id="draft-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as DraftFormat)}
          >
            {DRAFT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {DRAFT_FORMAT_LABELS[f]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="draft-note">Rough note</Label>
          <Textarea
            id="draft-note"
            value={roughNote}
            onChange={(e) => setRoughNote(e.target.value)}
            rows={3}
            placeholder="Write roughly what you want to say — Occasion polishes it into your voice."
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="primary" size="sm" onClick={handleGenerate} disabled={loading || !roughNote.trim()}>
          {loading ? "Drafting..." : "Draft it"}
        </Button>
      </div>

      {error ? <InlineError message={error} className="mt-2" /> : null}

      {draft ? (
        <div className="mt-3 space-y-2">
          <pre className="whitespace-pre-wrap rounded-md border border-border bg-surface2 p-3 text-sm text-foreground">
            {draft}
          </pre>
          <div className="flex justify-end">
            <CopyButton text={draft} label="Copy draft" />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
