"use client";

import { useActiveEvent } from "@/lib/hooks/use-active-event";
import { BudgetView } from "@/components/budget/budget-view";

export default function EventBudgetPage() {
  const event = useActiveEvent();
  if (!event) return null;
  return <BudgetView event={event} />;
}
