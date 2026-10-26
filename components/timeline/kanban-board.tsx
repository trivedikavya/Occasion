"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { useStore } from "@/components/providers/store-provider";
import { TASK_STATUSES, type Task, type TaskStatus } from "@/types/task";

interface KanbanBoardProps {
  eventId: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function KanbanBoard({ eventId, tasks, onEditTask, onAddTask }: KanbanBoardProps) {
  const { updateTask } = useStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;
    const overId = String(over.id);
    const newStatus = isTaskStatus(overId)
      ? overId
      : tasks.find((t) => t.id === overId)?.status;
    const task = tasks.find((t) => t.id === active.id);
    if (task && newStatus && newStatus !== task.status) {
      updateTask(eventId, task.id, { status: newStatus });
    }
  }

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={byStatus(status)}
            onEditTask={onEditTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="w-64">
            <TaskCard task={activeTask} onEdit={() => {}} dragDisabled />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
