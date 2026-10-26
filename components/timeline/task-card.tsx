"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_CATEGORY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDateShort, isOverdue } from "@/lib/dates";
import { useStore } from "@/components/providers/store-provider";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  dragDisabled?: boolean;
}

export function TaskCard({ task, onEdit, dragDisabled }: TaskCardProps) {
  const { updateTask } = useStore();
  const late = task.status !== "done" && isOverdue(task.due);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: dragDisabled,
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border bg-surface2 p-3 text-sm shadow-sm transition-colors",
        late ? "border-danger/40" : "border-border",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          {...listeners}
          {...attributes}
          aria-label="Drag to reorder"
          className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted/60 hover:text-muted active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <button
          onClick={onEdit}
          className="min-w-0 flex-1 text-left text-foreground hover:underline"
        >
          {task.title}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Task actions"
              className="shrink-0 rounded p-0.5 text-muted opacity-0 hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
            >
              <MoreHorizontal size={15} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Move to</DropdownMenuLabel>
            {TASK_STATUSES.map((status) => (
              <DropdownMenuItem
                key={status}
                disabled={status === task.status}
                onSelect={() => updateTask(task.eventId, task.id, { status: status as TaskStatus })}
              >
                {TASK_STATUS_LABELS[status]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={onEdit}>Edit details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-5">
        <Badge tone="neutral">{TASK_CATEGORY_LABELS[task.category]}</Badge>
        <Badge tone={late ? "danger" : "neutral"}>
          {late ? "Overdue" : formatDateShort(task.due)}
        </Badge>
        {task.owner ? <span className="text-xs text-muted">{task.owner}</span> : null}
      </div>
    </div>
  );
}
