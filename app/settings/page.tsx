"use client";

import { ShortcutsSettings } from "@/components/settings/shortcuts-settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-xs text-muted">App-wide preferences.</p>
      </div>
      <ShortcutsSettings />
    </div>
  );
}
