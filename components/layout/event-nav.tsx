"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, KanbanSquare, Store, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/timeline", label: "Timeline", icon: KanbanSquare },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/ideas", label: "Ideas", icon: Lightbulb },
];

export function EventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/events/${eventId}`;

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-background px-5 no-scrollbar" aria-label="Event sections">
      {TABS.map((tab) => {
        const href = `${base}${tab.href}`;
        const active = tab.href === "" ? pathname === base : pathname?.startsWith(href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm transition-colors",
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            <Icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
