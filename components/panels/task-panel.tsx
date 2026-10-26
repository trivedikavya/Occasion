"use client";

import { useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { InlineError } from "@/components/ui/error-state";
import { useStore } from "@/components/providers/store-provider";
import { TASK_CATEGORIES, TASK_STATUSES, type Task, type TaskInput } from "@/types/task";
import { TASK_CATEGORY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { toIsoDate, today } from "@/lib/dates";

interface TaskPanelProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  defaultStatus?: TaskInput["status"];
}

function defaultForm(task?: Task, defaultStatus?: TaskInput["status"]): TaskInput {
  if (task) {
    return {
      title: task.title,
      due: task.due,
      status: task.status,
      category: task.category,
      owner: task.owner,
      notes: task.notes,
    };
  }
  return {
    title: "",
    due: toIsoDate(today()),
    status: defaultStatus ?? "todo",
    category: "other",
    owner: "",
    notes: "",
  };
}

export function TaskPanel({ eventId, open, onOpenChange, task, defaultStatus }: TaskPanelProps) {
  const { addTask, updateTask, deleteTask } = useStore();
  const [form, setForm] = useState<TaskInput>(() => defaultForm(task, defaultStatus));
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) setForm(defaultForm(task, defaultStatus));
    onOpenChange(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!form.due) {
      setError("Due date is required.");
      return;
    }
    setError(null);
    if (task) {
      updateTask(eventId, task.id, form);
    } else {
      addTask(eventId, form);
    }
    onOpenChange(false);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title={task ? "Edit task" : "New task"}
      description={task ? "Update details or change status." : "Add a task to the timeline."}
    >
      <form onSubmit={handleSubmit} className="flex h-full flex-col">
        <div className="flex-1 space-y-3.5">
          <div>
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Confirm floral order"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={form.due}
                onChange={(e) => setForm({ ...form, due: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="task-status">Status</Label>
              <Select
                id="task-status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskInput["status"] })}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="task-category">Category</Label>
              <Select
                id="task-category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as TaskInput["category"] })
                }
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {TASK_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="task-owner">Owner</Label>
              <Input
                id="task-owner"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                placeholder="Who's doing this?"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
              rows={4}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any context worth remembering..."
            />
          </div>

          {error ? <InlineError message={error} /> : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
          {task ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                deleteTask(eventId, task.id);
                onOpenChange(false);
              }}
            >
              Delete task
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </div>
      </form>
    </Sheet>
  );
}
