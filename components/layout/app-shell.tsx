"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { useShortcutHandler } from "@/components/providers/shortcuts-provider";

export function AppShell({ children }: { children: ReactNode }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const activeEvent = useActiveEvent();

  useShortcutHandler("assistant", () => setAssistantOpen((o) => !o));

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          newEventOpen={newEventOpen}
          onNewEventOpenChange={setNewEventOpen}
          resetOpen={resetOpen}
          onResetOpenChange={setResetOpen}
          mobileOpen={mobileSidebarOpen}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
        {mobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
            onOpenMobileMenu={() => setMobileSidebarOpen(true)}
            showAssistant={Boolean(activeEvent)}
            onOpenAssistant={() => setAssistantOpen(true)}
          />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onNewEvent={() => setNewEventOpen(true)}
        onResetDemo={() => setResetOpen(true)}
      />

      {activeEvent ? (
        <AssistantPanel event={activeEvent} open={assistantOpen} onOpenChange={setAssistantOpen} />
      ) : null}
    </TooltipProvider>
  );
}
