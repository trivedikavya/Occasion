import { z } from "zod";
import { EventSchema, type Event } from "@/types/event";
import { StyleProfileSchema, type StyleProfile } from "@/types/styleProfile";
import { ShortcutsSchema, DEFAULT_SHORTCUTS, type ShortcutsConfig } from "@/types/shortcuts";
import { buildDemoEvents, buildDemoStyleProfile } from "./demo-data";

const STORAGE_VERSION = "v1";
const KEYS = {
  events: `occasion:${STORAGE_VERSION}:events`,
  styleProfile: `occasion:${STORAGE_VERSION}:styleProfile`,
  seeded: `occasion:${STORAGE_VERSION}:seeded`,
  shortcuts: `occasion:${STORAGE_VERSION}:shortcuts`,
};

/**
 * Abstraction over persistence so the app can later swap localStorage for a
 * real database/API without touching any component code.
 */
export interface DataStore {
  loadEvents(): Event[];
  saveEvents(events: Event[]): void;
  loadStyleProfile(): StyleProfile;
  saveStyleProfile(profile: StyleProfile): void;
  isSeeded(): boolean;
  markSeeded(): void;
  clearAll(): void;
  loadShortcuts(): ShortcutsConfig;
  saveShortcuts(config: ShortcutsConfig): void;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function safeParse<T>(schema: z.ZodType<T>, raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (result.success) return result.data;
    console.warn("Occasion: stored data failed validation, using fallback.", result.error.flatten());
    return fallback;
  } catch (err) {
    console.warn("Occasion: failed to parse stored data, using fallback.", err);
    return fallback;
  }
}

class LocalStorageDataStore implements DataStore {
  loadEvents(): Event[] {
    if (!isBrowser()) return [];
    return safeParse(z.array(EventSchema), window.localStorage.getItem(KEYS.events), []);
  }

  saveEvents(events: Event[]): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(KEYS.events, JSON.stringify(events));
  }

  loadStyleProfile(): StyleProfile {
    const empty = StyleProfileSchema.parse({});
    if (!isBrowser()) return empty;
    return safeParse(StyleProfileSchema, window.localStorage.getItem(KEYS.styleProfile), empty);
  }

  saveStyleProfile(profile: StyleProfile): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(KEYS.styleProfile, JSON.stringify(profile));
  }

  isSeeded(): boolean {
    if (!isBrowser()) return true;
    return window.localStorage.getItem(KEYS.seeded) === "true";
  }

  markSeeded(): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(KEYS.seeded, "true");
  }

  clearAll(): void {
    if (!isBrowser()) return;
    Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key));
  }

  loadShortcuts(): ShortcutsConfig {
    if (!isBrowser()) return DEFAULT_SHORTCUTS;
    return safeParse(ShortcutsSchema, window.localStorage.getItem(KEYS.shortcuts), DEFAULT_SHORTCUTS);
  }

  saveShortcuts(config: ShortcutsConfig): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(KEYS.shortcuts, JSON.stringify(config));
  }
}

export const dataStore: DataStore = new LocalStorageDataStore();

/** Loads existing data, or seeds realistic demo data on first run. */
export function loadOrSeed(): { events: Event[]; styleProfile: StyleProfile } {
  if (!dataStore.isSeeded()) {
    const events = buildDemoEvents();
    const styleProfile = buildDemoStyleProfile();
    dataStore.saveEvents(events);
    dataStore.saveStyleProfile(styleProfile);
    dataStore.markSeeded();
    return { events, styleProfile };
  }
  return { events: dataStore.loadEvents(), styleProfile: dataStore.loadStyleProfile() };
}

/** Wipes everything and reseeds the original demo data (used by "Reset demo data"). */
export function resetDemoData(): { events: Event[]; styleProfile: StyleProfile } {
  dataStore.clearAll();
  const events = buildDemoEvents();
  const styleProfile = buildDemoStyleProfile();
  dataStore.saveEvents(events);
  dataStore.saveStyleProfile(styleProfile);
  dataStore.markSeeded();
  return { events, styleProfile };
}
