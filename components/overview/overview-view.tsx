"use client";

import Link from "next/link";
import { CalendarDays, Wallet, ListChecks, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import type { Event } from "@/types/event";
import { formatCountdown, formatDate, isOverdue } from "@/lib/dates";
import { formatINR } from "@/lib/utils";
import {
  getBudgetTotals,
  getOverBudgetCategories,
  getOverdueTasks,
  getTaskProgress,
  getUpcomingTasks,
} from "@/lib/selectors";
import { TASK_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OverviewView({ event }: { event: Event }) {
  const budget = getBudgetTotals(event);
  const progress = getTaskProgress(event);
  const overBudget = getOverBudgetCategories(event);
  const overdueTasks = getOverdueTasks(event);
  const upcoming = getUpcomingTasks(event, 5);
  const daysOut = formatCountdown(event.date);
  const over100 = budget.total > 0 && budget.actual > budget.total;

  return (
    <div className="space-y-5 p-5">
      {(overBudget.length > 0 || overdueTasks.length > 0) && (
        <div className="space-y-2">
          {overBudget.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning"
            >
              <AlertTriangle size={14} className="shrink-0" />
              <span className="flex-1">
                <strong className="font-medium">{cat.category}</strong> is {formatINR(cat.overBy)} over budget.
              </span>
              <Link href={`/events/${event.id}/budget`} className="flex items-center gap-1 text-xs underline">
                Review <ArrowRight size={12} />
              </Link>
            </div>
          ))}
          {overdueTasks.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              <AlertTriangle size={14} className="shrink-0" />
              <span className="flex-1">
                {overdueTasks.length} task{overdueTasks.length > 1 ? "s" : ""} overdue.
              </span>
              <Link href={`/events/${event.id}/timeline`} className="flex items-center gap-1 text-xs underline">
                Review <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Countdown</CardTitle>
            <CalendarDays size={14} className="text-muted" />
          </CardHeader>
          <p className="text-2xl font-semibold text-foreground">{daysOut}</p>
          <p className="mt-1 text-xs text-muted">{formatDate(event.date)}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget used</CardTitle>
            <Wallet size={14} className="text-muted" />
          </CardHeader>
          <p className="text-2xl font-semibold text-foreground">
            {formatINR(budget.actual)}
            <span className="ml-1 text-sm font-normal text-muted">/ {formatINR(budget.total)}</span>
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
            <div
              className={cn("h-full rounded-full", over100 ? "bg-danger" : "bg-accent")}
              style={{ width: `${Math.min(budget.pctUsed, 100)}%` }}
            />
          </div>
          <p className={cn("mt-1 text-xs", over100 ? "text-danger" : "text-muted")}>
            {over100
              ? `${formatINR(budget.actual - budget.total)} over total budget`
              : `${formatINR(budget.remaining)} remaining`}
          </p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task progress</CardTitle>
            <ListChecks size={14} className="text-muted" />
          </CardHeader>
          {progress.total === 0 ? (
            <p className="text-sm text-muted">No tasks yet.</p>
          ) : (
            <>
              <p className="text-2xl font-semibold text-foreground">
                {progress.done}
                <span className="ml-1 text-sm font-normal text-muted">/ {progress.total} done</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface2">
                <div className="h-full rounded-full bg-success" style={{ width: `${progress.pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {progress.doing} in progress &middot; {progress.todo} to do
              </p>
            </>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Next deadlines</CardTitle>
          <Link
            href={`/events/${event.id}/timeline`}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            View timeline <ArrowRight size={12} />
          </Link>
        </CardHeader>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Nothing due"
            description="All tasks are done, or none have been added yet."
            className="py-8"
          />
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((task) => {
              const late = isOverdue(task.due);
              return (
                <li key={task.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{task.title}</p>
                    <p className="text-xs text-muted">{TASK_CATEGORY_LABELS[task.category]}</p>
                  </div>
                  <Badge tone={late ? "danger" : "neutral"}>
                    {late ? "Overdue" : formatDate(task.due)}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
