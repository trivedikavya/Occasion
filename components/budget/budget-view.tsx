"use client";

import { AlertTriangle, Wallet } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { BudgetDonut } from "./budget-donut";
import { BudgetTable } from "./budget-table";
import { BudgetOptimizer } from "./budget-optimizer";
import { useStore } from "@/components/providers/store-provider";
import type { Event } from "@/types/event";
import { getBudgetTotals, getOverBudgetCategories } from "@/lib/selectors";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function BudgetView({ event }: { event: Event }) {
  const { addBudgetItem } = useStore();
  const totals = getBudgetTotals(event);
  const overBudget = getOverBudgetCategories(event);
  const over100 = totals.actual > totals.total;

  return (
    <div className="space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total budget</CardTitle>
            <Wallet size={14} className="text-muted" />
          </CardHeader>
          <p className="text-2xl font-semibold text-foreground">{formatINR(totals.total)}</p>
          <p className={cn("mt-1 text-xs", over100 ? "text-danger" : "text-muted")}>
            {formatINR(totals.actual)} spent so far
          </p>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Spend by category</CardTitle>
          </CardHeader>
          <BudgetDonut items={event.budgetItems} total={totals.total} />
        </Card>
      </div>

      <BudgetOptimizer event={event} />

      {overBudget.length > 0 && (
        <div className="space-y-2">
          {overBudget.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning"
            >
              <AlertTriangle size={14} className="shrink-0" />
              <span>
                <strong className="font-medium">{cat.category}</strong> is {formatINR(cat.overBy)} over its{" "}
                {formatINR(cat.planned)} plan.
              </span>
            </div>
          ))}
        </div>
      )}

      <Card className="p-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <CardTitle>Categories</CardTitle>
        </div>
        <div className="p-4 pt-3">
          {event.budgetItems.length === 0 ? (
            <EmptyState
              icon={<Wallet size={24} />}
              title="No budget categories yet"
              description="Add your first category to start tracking planned vs actual spend."
              action={
                <Button
                  variant="primary"
                  onClick={() =>
                    addBudgetItem(event.id, { category: "Venue", planned: 0, actual: 0 })
                  }
                >
                  Add category
                </Button>
              }
            />
          ) : (
            <BudgetTable eventId={event.id} items={event.budgetItems} />
          )}
        </div>
      </Card>
    </div>
  );
}
