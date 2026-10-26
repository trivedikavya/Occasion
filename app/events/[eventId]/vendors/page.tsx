"use client";

import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { VendorView } from "@/components/vendors/vendor-view";

export default function EventVendorsPage() {
  const event = useActiveEvent();
  if (!event) return null;
  return <VendorView event={event} />;
}
