"use client";

import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { TimelineView } from "@/components/timeline/timeline-view";

export default function EventTimelinePage() {
  const event = useActiveEvent();
  if (!event) return null;
  return <TimelineView event={event} />;
}
