"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  LayoutDashboard,
  Wallet,
  KanbanSquare,
  Store,
  Lightbulb,
  Palette,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { useShortcutHandler } from "@/components/providers/shortcuts-provider";
import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  group: string;
  icon: typeof Search;
  action: () => void;
  keywords?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNewEvent,
  onResetDemo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewEvent: () => void;
  onResetDemo: () => void;
}) {
  const setOpen = onOpenChange;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { events } = useStore();
  const activeEvent = useActiveEvent();

  useShortcutHandler("commandBar", () => setOpen(!open));

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    for (const event of events) {
      list.push({
        id: `event-${event.id}`,
        label: event.name,
        group: "Events",
        icon: LayoutDashboard,
        action: () => router.push(`/events/${event.id}`),
        keywords: event.city,
      });
    }

    if (activeEvent) {
      list.push(
        {
          id: "nav-overview",
          label: "Overview",
          group: activeEvent.name,
          icon: LayoutDashboard,
          action: () => router.push(`/events/${activeEvent.id}`),
        },
        {
          id: "nav-budget",
          label: "Budget",
          group: activeEvent.name,
          icon: Wallet,
          action: () => router.push(`/events/${activeEvent.id}/budget`),
        },
        {
          id: "nav-timeline",
          label: "Timeline",
          group: activeEvent.name,
          icon: KanbanSquare,
          action: () => router.push(`/events/${activeEvent.id}/timeline`),
        },
        {
          id: "nav-vendors",
          label: "Vendors",
          group: activeEvent.name,
          icon: Store,
          action: () => router.push(`/events/${activeEvent.id}/vendors`),
        },
        {
          id: "nav-ideas",
          label: "Ideas",
          group: activeEvent.name,
          icon: Lightbulb,
          action: () => router.push(`/events/${activeEvent.id}/ideas`),
        }
      );
    }

    list.push(
      {
        id: "nav-style-profile",
        label: "Style Profile",
        group: "General",
        icon: Palette,
        action: () => router.push("/style-profile"),
      },
      {
        id: "action-new-event",
        label: "New event",
        group: "Actions",
        icon: Plus,
        action: onNewEvent,
      },
      {
        id: "action-reset-demo",
        label: "Reset demo data",
        group: "Actions",
        icon: RotateCcw,
        action: onResetDemo,
      }
    );

    return list;
  }, [events, activeEvent, router, onNewEvent, onResetDemo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    );
  }, [items, query]);

  function runItem(item: CommandItem) {
    item.action();
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) runItem(item);
    }
  }

  let lastGroup = "";

  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <RadixDialog.Content
          className="fixed left-1/2 top-24 z-50 w-[min(560px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-lg border border-border bg-surface shadow-panel focus:outline-none"
          onKeyDown={onKeyDown}
        >
          <RadixDialog.Title className="sr-only">Command bar</RadixDialog.Title>
          <RadixDialog.Description className="sr-only">
            Search events, pages and actions
          </RadixDialog.Description>
          <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
            <Search size={16} className="text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search events, pages, actions..."
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              aria-label="Command bar search"
            />
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
              Esc
            </kbd>
          </div>
          <div className="max-h-80 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">No matches.</p>
            ) : (
              filtered.map((item, index) => {
                const showGroup = item.group !== lastGroup;
                lastGroup = item.group;
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    {showGroup && (
                      <p className="px-2.5 pb-1 pt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                        {item.group}
                      </p>
                    )}
                    <button
                      onClick={() => runItem(item)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm",
                        index === activeIndex
                          ? "bg-surface2 text-foreground"
                          : "text-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={15} />
                      {item.label}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
