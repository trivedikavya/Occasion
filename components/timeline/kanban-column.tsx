"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanColumn({ status, tasks, onEditTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
          {TASK_STATUS_LABELS[status]}
          <span className="ml-1.5 text-muted/70">{tasks.length}</span>
        </h3>
        <button
          onClick={() => onAddTask(status)}
          aria-label={`Add task to ${TASK_STATUS_LABELS[status]}`}
          className="rounded p-1 text-muted hover:bg-surface2 hover:text-foreground"
        >
          <Plus size={14} />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 overflow-y-auto p-2.5 transition-colors",
          isOver && "bg-accent-muted/30"
        )}
        style={{ minHeight: 120 }}
      >
        {tasks.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted">Drop tasks here</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
          ))
        )}
      </div>
    </div>
  );
}
