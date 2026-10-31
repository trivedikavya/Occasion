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

/** The four child collections every Event owns, each addressable generically by key. */
type CollectionKey = "tasks" | "budgetItems" | "vendors" | "ideas";
type CollectionItem<K extends CollectionKey> = Event[K][number];

/**
 * Generic add/update/delete for one of an event's child collections (tasks,
 * budget items, vendors, ideas). Pulled out as a single reusable hook instead
 * of four nearly-identical copy-pasted blocks — the only things that differ
 * per collection are the id prefix and how a raw input becomes a stored item.
 */
function useCollectionActions<K extends CollectionKey, TInput>(
  events: Event[],
  persistEvents: (next: Event[]) => void,
  collectionKey: K,
  idPrefix: string,
  buildItem: (input: TInput, id: string, eventId: string) => CollectionItem<K>,
  /** Optional per-item transform applied after merging a patch (e.g. bumping the item's own updatedAt). */
  touchItem: (item: CollectionItem<K>) => CollectionItem<K> = (item) => item
) {
  const add = useCallback(
    (eventId: string, input: TInput): CollectionItem<K> | undefined => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return undefined;
      const item = buildItem(input, newId(idPrefix), eventId);
      persistEvents(
        events.map((e) =>
          e.id === eventId
            ? touch({ ...e, [collectionKey]: [...e[collectionKey], item] } as Event)
            : e
        )
      );
      return item;
    },
    [events, persistEvents, collectionKey, idPrefix, buildItem]
  );

  const update = useCallback(
    (eventId: string, itemId: string, patch: Partial<TInput>) => {
      persistEvents(
        events.map((e) => {
          if (e.id !== eventId) return e;
          const collection = e[collectionKey] as CollectionItem<K>[];
          return touch({
            ...e,
            [collectionKey]: collection.map((item) =>
              item.id === itemId ? touchItem({ ...item, ...patch }) : item
            ),
          } as Event);
        })
      );
    },
    [events, persistEvents, collectionKey, touchItem]
  );

  const remove = useCallback(
    (eventId: string, itemId: string) => {
      persistEvents(
        events.map((e) => {
          if (e.id !== eventId) return e;
          const collection = e[collectionKey] as CollectionItem<K>[];
          return touch({
            ...e,
            [collectionKey]: collection.filter((item) => item.id !== itemId),
          } as Event);
        })
      );
    },
    [events, persistEvents, collectionKey]
  );

  return { add, update, remove };
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
      persistEvents(events.map((e) => (e.id === eventId ? touch({ ...e, ...patch }) : e)));
    },
    [events, persistEvents]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      persistEvents(events.filter((e) => e.id !== eventId));
    },
    [events, persistEvents]
  );

  const taskActions = useCollectionActions<"tasks", TaskInput>(
    events,
    persistEvents,
    "tasks",
    "task",
    (input, id, eventId) => ({ id, eventId, ...input, createdAt: nowIso(), updatedAt: nowIso() }),
    (task) => ({ ...task, updatedAt: nowIso() })
  );

  const budgetActions = useCollectionActions<"budgetItems", BudgetItemInput>(
    events,
    persistEvents,
    "budgetItems",
    "budget",
    (input, id, eventId) => ({ id, eventId, ...input })
  );

  const vendorActions = useCollectionActions<"vendors", VendorInput>(
    events,
    persistEvents,
    "vendors",
    "vendor",
    (input, id, eventId) => ({ id, eventId, ...input })
  );

  const ideaActions = useCollectionActions<"ideas", IdeaInput>(
    events,
    persistEvents,
    "ideas",
    "idea",
    (input, id, eventId) => ({ id, eventId, ...input, createdAt: nowIso() })
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
      addTask: taskActions.add,
      updateTask: taskActions.update,
      deleteTask: taskActions.remove,
      addBudgetItem: budgetActions.add,
      updateBudgetItem: budgetActions.update,
      deleteBudgetItem: budgetActions.remove,
      addVendor: vendorActions.add,
      updateVendor: vendorActions.update,
      deleteVendor: vendorActions.remove,
      addIdea: ideaActions.add,
      updateIdea: ideaActions.update,
      deleteIdea: ideaActions.remove,
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
      taskActions,
      budgetActions,
      vendorActions,
      ideaActions,
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
