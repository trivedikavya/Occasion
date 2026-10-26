"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EventNav } from "@/components/layout/event-nav";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarX } from "lucide-react";
import { QuickCapture } from "@/components/ai/quick-capture";

export default function EventLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { eventId: string };
}) {
  const { getEvent, isLoading } = useStore();
  const router = useRouter();
  const event = getEvent(params.eventId);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <EmptyState
          icon={<CalendarX size={28} />}
          title="Event not found"
          description="This event may have been deleted, or demo data was reset."
          action={
            <Button variant="primary" onClick={() => router.push("/")}>
              Back to Occasion
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EventNav eventId={event.id} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 pb-0">
          <QuickCapture event={event} />
        </div>
        {children}
      </div>
    </div>
  );
}
