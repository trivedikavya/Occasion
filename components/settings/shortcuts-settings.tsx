"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useShortcuts } from "@/components/providers/shortcuts-provider";
import { SHORTCUT_LABELS, type ShortcutsConfig } from "@/types/shortcuts";
import { comboFromEvent, formatCombo, isCompleteCombo } from "@/lib/shortcuts-utils";
import { cn } from "@/lib/utils";

const SHORTCUT_KEYS = Object.keys(SHORTCUT_LABELS) as (keyof ShortcutsConfig)[];

export function ShortcutsSettings() {
  const { shortcuts, setShortcut } = useShortcuts();
  const [recording, setRecording] = useState<keyof ShortcutsConfig | null>(null);

  useEffect(() => {
    if (!recording) return;
    function onKeyDown(e: KeyboardEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setRecording(null);
        return;
      }
      const combo = comboFromEvent(e);
      if (isCompleteCombo(combo)) {
        setShortcut(recording as keyof ShortcutsConfig, combo);
        setRecording(null);
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [recording, setShortcut]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Keyboard size={15} className="text-accent" />
          <CardTitle className="normal-case tracking-normal text-sm text-foreground">
            Keyboard shortcuts
          </CardTitle>
        </div>
      </CardHeader>
      <p className="mb-3 text-xs text-muted">
        Click a shortcut, then press the new combo. Avoid combos your OS or dictation tool already
        uses (e.g. Win+H) — Occasion only listens while you&apos;re actively recording here.
      </p>
      <div className="space-y-2">
        {SHORTCUT_KEYS.map((key) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-md border border-border bg-surface2 px-3 py-2"
          >
            <span className="text-sm text-foreground">{SHORTCUT_LABELS[key]}</span>
            <Button
              variant={recording === key ? "primary" : "secondary"}
              size="sm"
              onClick={() => setRecording(key)}
              className={cn("min-w-[120px] justify-center font-mono")}
            >
              {recording === key ? "Press keys..." : formatCombo(shortcuts[key])}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
