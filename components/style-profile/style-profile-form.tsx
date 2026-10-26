"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TagListEditor } from "@/components/ui/tag-list-editor";
import { useStore } from "@/components/providers/store-provider";
import { DRAFT_FORMATS, DRAFT_FORMAT_LABELS, type StyleProfile } from "@/types/styleProfile";

export function StyleProfileForm() {
  const { styleProfile, setStyleProfile } = useStore();
  const [draft, setDraft] = useState<StyleProfile>(styleProfile);
  const [savedPulse, setSavedPulse] = useState(false);

  useEffect(() => {
    setDraft(styleProfile);
  }, [styleProfile]);

  function persist(next: StyleProfile) {
    setDraft(next);
    setStyleProfile(next);
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  }

  function persistOnBlur() {
    setStyleProfile(draft);
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 1200);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Style Profile</h1>
          <p className="mt-1 text-xs text-muted">
            Injected into every AI prompt so generated text sounds like you, not a template.
          </p>
        </div>
        {savedPulse ? (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check size={12} /> Saved
          </span>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tone</CardTitle>
        </CardHeader>
        <Textarea
          value={draft.tone}
          onChange={(e) => setDraft({ ...draft, tone: e.target.value })}
          onBlur={persistOnBlur}
          rows={2}
          placeholder="e.g. Warm, direct and a little playful — like a friend helping plan the event."
          aria-label="Tone"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Words &amp; phrases I like</CardTitle>
        </CardHeader>
        <TagListEditor
          values={draft.vocabulary}
          onChange={(vocabulary) => persist({ ...draft, vocabulary })}
          placeholder="e.g. let's, no stress, sorted"
          ariaLabel="Vocabulary"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Phrases to avoid</CardTitle>
        </CardHeader>
        <TagListEditor
          values={draft.avoidPhrases}
          onChange={(avoidPhrases) => persist({ ...draft, avoidPhrases })}
          placeholder="e.g. kindly revert, circle back"
          ariaLabel="Avoid phrases"
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Writing samples</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => persist({ ...draft, samples: [...draft.samples, ""] })}
          >
            <Plus size={13} />
            Add sample
          </Button>
        </CardHeader>
        {draft.samples.length === 0 ? (
          <p className="text-xs text-muted">
            Paste a message or two you&apos;ve actually written — Gemini mimics these directly.
          </p>
        ) : (
          <div className="space-y-2">
            {draft.samples.map((sample, i) => (
              <div key={i} className="flex gap-2">
                <Textarea
                  value={sample}
                  onChange={(e) => {
                    const next = [...draft.samples];
                    next[i] = e.target.value;
                    setDraft({ ...draft, samples: next });
                  }}
                  onBlur={persistOnBlur}
                  rows={2}
                  aria-label={`Writing sample ${i + 1}`}
                  className="flex-1"
                />
                <button
                  onClick={() =>
                    persist({ ...draft, samples: draft.samples.filter((_, idx) => idx !== i) })
                  }
                  aria-label="Remove sample"
                  className="shrink-0 self-start rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-format rules</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {DRAFT_FORMATS.map((format) => (
            <div key={format}>
              <Label htmlFor={`format-${format}`}>{DRAFT_FORMAT_LABELS[format]}</Label>
              <Textarea
                id={`format-${format}`}
                value={draft.formatRules[format]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    formatRules: { ...draft.formatRules, [format]: e.target.value },
                  })
                }
                onBlur={persistOnBlur}
                rows={2}
                placeholder={`Rules specific to a ${DRAFT_FORMAT_LABELS[format].toLowerCase()}...`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
