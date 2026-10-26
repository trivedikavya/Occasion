"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { events, isLoading, addEvent, resetDemo } = useStore();
  const router = useRouter();
  const [newEventOpen, setNewEventOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && events.length > 0) {
      const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
      router.replace(`/events/${sorted[0].id}`);
    }
  }, [isLoading, events, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (events.length > 0) {
    // Redirect in-flight.
    return null;
  }

  return (
    <div className="flex h-full items-center justify-center p-8">
      <EmptyState
        icon={<PartyPopper size={28} />}
        title="No events yet"
        description="Create your first event, or load realistic demo data to explore what Occasion can do."
        className="max-w-md"
        action={
          <div className="flex gap-2">
            <Button variant="primary" onClick={() => setNewEventOpen(true)}>
              Create your first event
            </Button>
            <Button variant="secondary" onClick={() => resetDemo()}>
              Load demo data
            </Button>
          </div>
        }
      />
      <EventFormDialog
        open={newEventOpen}
        onOpenChange={setNewEventOpen}
        onSubmit={(input) => {
          const event = addEvent(input);
          router.push(`/events/${event.id}`);
        }}
      />
    </div>
  );
}
