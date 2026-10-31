"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, PartyPopper, Cake, Users2, Palette, RotateCcw, Settings } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { EventType } from "@/types/event";

const TYPE_ICON: Record<EventType, typeof PartyPopper> = {
  wedding: PartyPopper,
  birthday: Cake,
  community: Users2,
};

interface SidebarProps {
  className?: string;
  newEventOpen: boolean;
  onNewEventOpenChange: (open: boolean) => void;
  resetOpen: boolean;
  onResetOpenChange: (open: boolean) => void;
  mobileOpen: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  className,
  newEventOpen,
  onNewEventOpenChange,
  resetOpen,
  onResetOpenChange,
  mobileOpen,
  onNavigate,
}: SidebarProps) {
  const { events, addEvent, resetDemo, isLoading } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 -translate-x-full flex-col border-r border-border bg-surface transition-transform duration-200 md:static md:z-auto md:translate-x-0",
        mobileOpen && "translate-x-0",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-solid text-accent-foreground text-sm font-semibold">
          O
        </div>
        <span className="text-sm font-semibold tracking-tight text-foreground">Occasion</span>
      </div>

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">Events</span>
        <button
          onClick={() => onNewEventOpenChange(true)}
          aria-label="Create new event"
          className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-foreground"
        >
          <Plus size={16} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2" aria-label="Events">
        {isLoading ? (
          <div className="space-y-2 px-2 py-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-surface2" />
            ))}
          </div>
        ) : sortedEvents.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted">
            No events yet. Create one or load demo data to explore Occasion.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {sortedEvents.map((event) => {
              const Icon = TYPE_ICON[event.type];
              const active = pathname?.startsWith(`/events/${event.id}`);
              return (
                <li key={event.id}>
                  <Link
                    href={`/events/${event.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-surface2 text-foreground"
                        : "text-muted hover:bg-surface2/70 hover:text-foreground"
                    )}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{event.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {formatDate(event.date)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="space-y-1 border-t border-border p-2">
        <Link
          href="/style-profile"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname === "/style-profile"
              ? "bg-surface2 text-foreground"
              : "text-muted hover:bg-surface2/70 hover:text-foreground"
          )}
        >
          <Palette size={15} />
          Style Profile
        </Link>
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-surface2 text-foreground"
              : "text-muted hover:bg-surface2/70 hover:text-foreground"
          )}
        >
          <Settings size={15} />
          Settings
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted"
          onClick={() => onResetOpenChange(true)}
        >
          <RotateCcw size={14} />
          Reset demo data
        </Button>
      </div>

      <EventFormDialog
        open={newEventOpen}
        onOpenChange={onNewEventOpenChange}
        onSubmit={(input) => {
          const event = addEvent(input);
          router.push(`/events/${event.id}`);
        }}
      />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={onResetOpenChange}
        title="Reset demo data?"
        description="This deletes every event, task, budget, vendor and idea you've created, and restores the original three demo events. This can't be undone."
        confirmLabel="Reset data"
        danger
        onConfirm={() => {
          resetDemo();
          router.push("/");
        }}
      />
    </aside>
  );
}
