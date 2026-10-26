"use client";

import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { IdeasView } from "@/components/ideas/ideas-view";

export default function EventIdeasPage() {
  const event = useActiveEvent();
  if (!event) return null;
  return <IdeasView event={event} />;
}
