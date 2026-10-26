"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/components/providers/store-provider";
import type { Event } from "@/types/event";

export function useActiveEvent(): Event | undefined {
  const params = useParams<{ eventId?: string }>();
  const { getEvent } = useStore();
  const eventId = params?.eventId;
  if (!eventId) return undefined;
  return getEvent(Array.isArray(eventId) ? eventId[0] : eventId);
}
