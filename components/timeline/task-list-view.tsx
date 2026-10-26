"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { TASK_CATEGORY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate, isOverdue } from "@/lib/dates";
import { useStore } from "@/components/providers/store-provider";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function TaskListView({ tasks, onEditTask }: TaskListViewProps) {
  const { updateTask } = useStore();

  if (tasks.length === 0) {
    return <EmptyState title="No tasks yet" description="Create your first task to see it here." />;
  }

  const overdue = tasks.filter((t) => t.status !== "done" && isOverdue(t.due));
  const rest = tasks.filter((t) => !overdue.includes(t));

  const groups = new Map<string, Task[]>();
  for (const task of [...rest].sort((a, b) => a.due.localeCompare(b.due))) {
    if (!groups.has(task.due)) groups.set(task.due, []);
    groups.get(task.due)!.push(task);
  }

  function Row({ task }: { task: Task }) {
    const late = task.status !== "done" && isOverdue(task.due);
    return (
      <li className="flex items-center gap-3 py-2.5">
        <button
          onClick={() =>
            updateTask(task.eventId, task.id, { status: task.status === "done" ? "todo" : "done" })
          }
          aria-label={task.status === "done" ? "Mark as not done" : "Mark as done"}
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            task.status === "done"
              ? "border-success bg-success/20 text-success"
              : "border-border text-transparent hover:border-muted"
          )}
        >
          <Check size={12} />
        </button>
        <button
          onClick={() => onEditTask(task)}
          className={cn(
            "min-w-0 flex-1 text-left text-sm hover:underline",
            task.status === "done" ? "text-muted line-through" : "text-foreground"
          )}
        >
          {task.title}
        </button>
        <Badge tone="neutral">{TASK_CATEGORY_LABELS[task.category]}</Badge>
        <Badge tone={late ? "danger" : task.status === "done" ? "success" : "neutral"}>
          {late ? "Overdue" : TASK_STATUS_LABELS[task.status]}
        </Badge>
      </li>
    );
  }

  return (
    <div className="space-y-5">
      {overdue.length > 0 && (
        <div>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-danger">Overdue</h3>
          <ul className="divide-y divide-border rounded-md border border-danger/30 bg-danger/5 px-3">
            {overdue.map((task) => (
              <Row key={task.id} task={task} />
            ))}
          </ul>
        </div>
      )}
      {Array.from(groups.entries()).map(([due, group]) => (
        <div key={due}>
          <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
            {formatDate(due)}
          </h3>
          <ul className="divide-y divide-border rounded-md border border-border bg-surface px-3">
            {group.map((task) => (
              <Row key={task.id} task={task} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
