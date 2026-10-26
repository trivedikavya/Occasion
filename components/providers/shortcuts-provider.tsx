"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { dataStore } from "@/lib/store";
import { DEFAULT_SHORTCUTS, type ShortcutsConfig } from "@/types/shortcuts";
import { comboFromEvent, normalizeCombo } from "@/lib/shortcuts-utils";

interface ShortcutsContextValue {
  shortcuts: ShortcutsConfig;
  setShortcut: (key: keyof ShortcutsConfig, combo: string) => void;
  /** Registers a handler for a named shortcut while the calling component is mounted. */
  registerHandler: (key: keyof ShortcutsConfig, handler: () => void) => () => void;
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null);

export function ShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<ShortcutsConfig>(DEFAULT_SHORTCUTS);
  const handlersRef = useRef<Map<keyof ShortcutsConfig, Set<() => void>>>(new Map());

  useEffect(() => {
    setShortcuts(dataStore.loadShortcuts());
  }, []);

  const setShortcut = useCallback((key: keyof ShortcutsConfig, combo: string) => {
    setShortcuts((prev) => {
      const next = { ...prev, [key]: combo };
      dataStore.saveShortcuts(next);
      return next;
    });
  }, []);

  const registerHandler = useCallback((key: keyof ShortcutsConfig, handler: () => void) => {
    if (!handlersRef.current.has(key)) handlersRef.current.set(key, new Set());
    handlersRef.current.get(key)!.add(handler);
    return () => {
      handlersRef.current.get(key)?.delete(handler);
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const pressed = comboFromEvent(e);
      for (const [name, combo] of Object.entries(shortcuts) as [keyof ShortcutsConfig, string][]) {
        if (normalizeCombo(combo) !== pressed) continue;
        // Command bar / assistant are allowed to fire even from inputs (mod+k / mod+j),
        // but plain single-key shortcuts are suppressed while typing/dictating.
        const hasModifier = pressed.includes("mod") || pressed.includes("alt");
        if (isEditable && !hasModifier) continue;
        const handlers = handlersRef.current.get(name);
        if (handlers && handlers.size > 0) {
          e.preventDefault();
          handlers.forEach((h) => h());
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcuts]);

  const value = useMemo(
    () => ({ shortcuts, setShortcut, registerHandler }),
    [shortcuts, setShortcut, registerHandler]
  );

  return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
}

export function useShortcuts(): ShortcutsContextValue {
  const ctx = useContext(ShortcutsContext);
  if (!ctx) throw new Error("useShortcuts must be used within a ShortcutsProvider");
  return ctx;
}

/** Convenience hook: runs `handler` whenever the named shortcut fires while mounted. */
export function useShortcutHandler(key: keyof ShortcutsConfig, handler: () => void) {
  const { registerHandler } = useShortcuts();
  useEffect(() => registerHandler(key, handler), [registerHandler, key, handler]);
}
