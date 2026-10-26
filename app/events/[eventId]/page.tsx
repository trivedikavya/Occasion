"use client";

import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { OverviewView } from "@/components/overview/overview-view";

export default function EventOverviewPage() {
  const event = useActiveEvent();
  if (!event) return null;
  return <OverviewView event={event} />;
}
