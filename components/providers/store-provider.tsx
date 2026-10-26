"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dataStore, loadOrSeed, resetDemoData } from "@/lib/store";
import { newId, nowIso } from "@/types/common";
import type { Event, EventInput } from "@/types/event";
import type { Task, TaskInput } from "@/types/task";
import type { BudgetItem, BudgetItemInput } from "@/types/budget";
import type { Vendor, VendorInput } from "@/types/vendor";
import type { Idea, IdeaInput } from "@/types/idea";
import type { StyleProfile } from "@/types/styleProfile";

interface StoreContextValue {
  events: Event[];
  styleProfile: StyleProfile;
  isLoading: boolean;
  getEvent: (eventId: string) => Event | undefined;
  addEvent: (input: EventInput) => Event;
  updateEvent: (eventId: string, patch: Partial<EventInput>) => void;
  deleteEvent: (eventId: string) => void;

  addTask: (eventId: string, input: TaskInput) => Task | undefined;
  updateTask: (eventId: string, taskId: string, patch: Partial<TaskInput>) => void;
  deleteTask: (eventId: string, taskId: string) => void;

  addBudgetItem: (eventId: string, input: BudgetItemInput) => BudgetItem | undefined;
  updateBudgetItem: (eventId: string, itemId: string, patch: Partial<BudgetItemInput>) => void;
  deleteBudgetItem: (eventId: string, itemId: string) => void;

  addVendor: (eventId: string, input: VendorInput) => Vendor | undefined;
  updateVendor: (eventId: string, vendorId: string, patch: Partial<VendorInput>) => void;
  deleteVendor: (eventId: string, vendorId: string) => void;

  addIdea: (eventId: string, input: IdeaInput) => Idea | undefined;
  updateIdea: (eventId: string, ideaId: string, patch: Partial<IdeaInput>) => void;
  deleteIdea: (eventId: string, ideaId: string) => void;

  setStyleProfile: (profile: StyleProfile) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function touch(event: Event): Event {
  return { ...event, updatedAt: nowIso() };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [styleProfile, setStyleProfileState] = useState<StyleProfile>({
    tone: "",
    vocabulary: [],
    avoidPhrases: [],
    samples: [],
    formatRules: { linkedin: "", invitation: "", vendorMessage: "", whatsapp: "" },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { events: loadedEvents, styleProfile: loadedProfile } = loadOrSeed();
    setEvents(loadedEvents);
    setStyleProfileState(loadedProfile);
    setIsLoading(false);
  }, []);

  const persistEvents = useCallback((next: Event[]) => {
    setEvents(next);
    dataStore.saveEvents(next);
  }, []);

  const getEvent = useCallback(
    (eventId: string) => events.find((e) => e.id === eventId),
    [events]
  );

  const addEvent = useCallback(
    (input: EventInput): Event => {
      const event: Event = {
        id: newId("event"),
        ...input,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        tasks: [],
        budgetItems: [],
        vendors: [],
        ideas: [],
      };
      persistEvents([...events, event]);
      return event;
    },
    [events, persistEvents]
  );

  const updateEvent = useCallback(
    (eventId: string, patch: Partial<EventInput>) => {
      persistEvents(
        events.map((e) => (e.id === eventId ? touch({ ...e, ...patch }) : e))
      );
    },
    [events, persistEvents]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      persistEvents(events.filter((e) => e.id !== eventId));
    },
    [events, persistEvents]
  );

  // --- Tasks ---
  const addTask = useCallback(
    (eventId: string, input: TaskInput) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return undefined;
      const task: Task = {
        id: newId("task"),
        eventId,
        ...input,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      persistEvents(
        events.map((e) => (e.id === eventId ? touch({ ...e, tasks: [...e.tasks, task] }) : e))
      );
      return task;
    },
    [events, persistEvents]
  );

  const updateTask = useCallback(
    (eventId: string, taskId: string, patch: Partial<TaskInput>) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({
                ...e,
                tasks: e.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...patch, updatedAt: nowIso() } : t
                ),
              })
            : e
        )
      );
    },
    [events, persistEvents]
  );

  const deleteTask = useCallback(
    (eventId: string, taskId: string) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId ? touch({ ...e, tasks: e.tasks.filter((t) => t.id !== taskId) }) : e
        )
      );
    },
    [events, persistEvents]
  );

  // --- Budget items ---
  const addBudgetItem = useCallback(
    (eventId: string, input: BudgetItemInput) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return undefined;
      const item: BudgetItem = { id: newId("budget"), eventId, ...input };
      persistEvents(
        events.map((e) =>
          e.id === eventId ? touch({ ...e, budgetItems: [...e.budgetItems, item] }) : e
        )
      );
      return item;
    },
    [events, persistEvents]
  );

  const updateBudgetItem = useCallback(
    (eventId: string, itemId: string, patch: Partial<BudgetItemInput>) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({
                ...e,
                budgetItems: e.budgetItems.map((b) => (b.id === itemId ? { ...b, ...patch } : b)),
              })
            : e
        )
      );
    },
    [events, persistEvents]
  );

  const deleteBudgetItem = useCallback(
    (eventId: string, itemId: string) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({ ...e, budgetItems: e.budgetItems.filter((b) => b.id !== itemId) })
            : e
        )
      );
    },
    [events, persistEvents]
  );

  // --- Vendors ---
  const addVendor = useCallback(
    (eventId: string, input: VendorInput) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return undefined;
      const vendor: Vendor = { id: newId("vendor"), eventId, ...input };
      persistEvents(
        events.map((e) => (e.id === eventId ? touch({ ...e, vendors: [...e.vendors, vendor] }) : e))
      );
      return vendor;
    },
    [events, persistEvents]
  );

  const updateVendor = useCallback(
    (eventId: string, vendorId: string, patch: Partial<VendorInput>) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({
                ...e,
                vendors: e.vendors.map((v) => (v.id === vendorId ? { ...v, ...patch } : v)),
              })
            : e
        )
      );
    },
    [events, persistEvents]
  );

  const deleteVendor = useCallback(
    (eventId: string, vendorId: string) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId ? touch({ ...e, vendors: e.vendors.filter((v) => v.id !== vendorId) }) : e
        )
      );
    },
    [events, persistEvents]
  );

  // --- Ideas ---
  const addIdea = useCallback(
    (eventId: string, input: IdeaInput) => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return undefined;
      const idea: Idea = { id: newId("idea"), eventId, ...input, createdAt: nowIso() };
      persistEvents(
        events.map((e) => (e.id === eventId ? touch({ ...e, ideas: [...e.ideas, idea] }) : e))
      );
      return idea;
    },
    [events, persistEvents]
  );

  const updateIdea = useCallback(
    (eventId: string, ideaId: string, patch: Partial<IdeaInput>) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({ ...e, ideas: e.ideas.map((i) => (i.id === ideaId ? { ...i, ...patch } : i)) })
            : e
        )
      );
    },
    [events, persistEvents]
  );

  const deleteIdea = useCallback(
    (eventId: string, ideaId: string) => {
      persistEvents(
        events.map((e) =>
          e.id === eventId ? touch({ ...e, ideas: e.ideas.filter((i) => i.id !== ideaId) }) : e
        )
      );
    },
    [events, persistEvents]
  );

  const setStyleProfile = useCallback((profile: StyleProfile) => {
    setStyleProfileState(profile);
    dataStore.saveStyleProfile(profile);
  }, []);

  const resetDemo = useCallback(() => {
    const { events: nextEvents, styleProfile: nextProfile } = resetDemoData();
    setEvents(nextEvents);
    setStyleProfileState(nextProfile);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      events,
      styleProfile,
      isLoading,
      getEvent,
      addEvent,
      updateEvent,
      deleteEvent,
      addTask,
      updateTask,
      deleteTask,
      addBudgetItem,
      updateBudgetItem,
      deleteBudgetItem,
      addVendor,
      updateVendor,
      deleteVendor,
      addIdea,
      updateIdea,
      deleteIdea,
      setStyleProfile,
      resetDemo,
    }),
    [
      events,
      styleProfile,
      isLoading,
      getEvent,
      addEvent,
      updateEvent,
      deleteEvent,
      addTask,
      updateTask,
      deleteTask,
      addBudgetItem,
      updateBudgetItem,
      deleteBudgetItem,
      addVendor,
      updateVendor,
      deleteVendor,
      addIdea,
      updateIdea,
      deleteIdea,
      setStyleProfile,
      resetDemo,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within a StoreProvider");
  return ctx;
}
