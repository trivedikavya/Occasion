"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "./kanban-board";
import { TaskListView } from "./task-list-view";
import { TaskPanel } from "@/components/panels/task-panel";
import type { Event } from "@/types/event";
import type { Task, TaskStatus } from "@/types/task";

export function TimelineView({ event }: { event: Event }) {
  const [view, setView] = useState<"board" | "list">("board");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");

  function openCreate(status: TaskStatus = "todo") {
    setEditingTask(undefined);
    setDefaultStatus(status);
    setPanelOpen(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setPanelOpen(true);
  }

  return (
    <Tabs
      value={view}
      onValueChange={(v) => setView(v as "board" | "list")}
      className="flex h-full flex-col gap-4 p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List by due date</TabsTrigger>
        </TabsList>
        <Button variant="primary" size="sm" onClick={() => openCreate()}>
          <Plus size={14} />
          New task
        </Button>
      </div>

      <TabsContent value="board" className="flex-1 overflow-x-auto overflow-y-hidden">
        <KanbanBoard
          eventId={event.id}
          tasks={event.tasks}
          onEditTask={openEdit}
          onAddTask={openCreate}
        />
      </TabsContent>
      <TabsContent value="list" className="flex-1 overflow-y-auto">
        <TaskListView tasks={event.tasks} onEditTask={openEdit} />
      </TabsContent>

      <TaskPanel
        eventId={event.id}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </Tabs>
  );
}
