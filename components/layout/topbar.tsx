"use client";

import { Menu, Search, Sparkles } from "lucide-react";
import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENT_TYPE_LABELS } from "@/types/event";
import { formatCountdown, formatDate } from "@/lib/dates";
import { useShortcuts } from "@/components/providers/shortcuts-provider";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenAssistant?: () => void;
  showAssistant?: boolean;
  onOpenMobileMenu: () => void;
}

function comboLabel(combo: string): string {
  return combo
    .split("+")
    .map((p) => (p === "mod" ? (navigator?.platform?.includes("Mac") ? "Cmd" : "Ctrl") : p[0].toUpperCase() + p.slice(1)))
    .join(" + ");
}

export function Topbar({
  onOpenCommandPalette,
  onOpenAssistant,
  showAssistant,
  onOpenMobileMenu,
}: TopbarProps) {
  const event = useActiveEvent();
  const { shortcuts } = useShortcuts();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open menu"
          className="rounded-md p-1.5 text-muted hover:bg-surface2 hover:text-foreground md:hidden"
        >
          <Menu size={18} />
        </button>
        {event ? (
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-sm font-semibold text-foreground">{event.name}</h1>
            <Badge tone="accent">{EVENT_TYPE_LABELS[event.type]}</Badge>
            <span className="hidden text-xs text-muted sm:inline">
              {formatDate(event.date)} &middot; {formatCountdown(event.date)}
            </span>
          </div>
        ) : (
          <h1 className="text-sm font-semibold text-foreground">Occasion</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search or jump to...</span>
          <kbd className="rounded border border-border bg-surface2 px-1.5 py-0.5 text-[10px]">
            {typeof navigator !== "undefined" ? comboLabel(shortcuts.commandBar) : "Ctrl + K"}
          </kbd>
        </button>
        {showAssistant && onOpenAssistant ? (
          <Button variant="primary" size="sm" onClick={onOpenAssistant}>
            <Sparkles size={14} />
            Assistant
          </Button>
        ) : null}
      </div>
    </header>
  );
}
