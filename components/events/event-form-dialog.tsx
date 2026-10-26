"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { InlineError } from "@/components/ui/error-state";
import { EVENT_TYPE_LABELS, EVENT_TYPES, type Event, type EventInput } from "@/types/event";
import { toIsoDate, addDays, today } from "@/lib/dates";

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Event;
  onSubmit: (input: EventInput) => void;
}

function defaultFormState(initial?: Event): EventInput {
  if (initial) {
    return {
      name: initial.name,
      type: initial.type,
      date: initial.date,
      city: initial.city,
      guestCount: initial.guestCount,
      totalBudget: initial.totalBudget,
      notes: initial.notes,
    };
  }
  return {
    name: "",
    type: "wedding",
    date: addDays(toIsoDate(today()), 90),
    city: "",
    guestCount: 50,
    totalBudget: 100000,
    notes: "",
  };
}

export function EventFormDialog({ open, onOpenChange, initial, onSubmit }: EventFormDialogProps) {
  const [form, setForm] = useState<EventInput>(() => defaultFormState(initial));
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) setForm(defaultFormState(initial));
    onOpenChange(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Event name is required.");
      return;
    }
    if (!form.date) {
      setError("Event date is required.");
      return;
    }
    setError(null);
    onSubmit(form);
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title={initial ? "Edit event" : "New event"}
      description="This information is used across budget, timeline and AI suggestions."
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <Label htmlFor="event-name">Event name</Label>
          <Input
            id="event-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Aarav & Meera Wedding"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="event-type">Type</Label>
            <Select
              id="event-type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as EventInput["type"] })}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EVENT_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="event-date">Date</Label>
            <Input
              id="event-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="event-city">City</Label>
            <Input
              id="event-city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Jaipur"
            />
          </div>
          <div>
            <Label htmlFor="event-guests">Guest count</Label>
            <Input
              id="event-guests"
              type="number"
              min={0}
              value={form.guestCount}
              onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="event-budget">Total budget (INR)</Label>
          <Input
            id="event-budget"
            type="number"
            min={0}
            step={1000}
            value={form.totalBudget}
            onChange={(e) => setForm({ ...form, totalBudget: Number(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label htmlFor="event-notes">Notes</Label>
          <Textarea
            id="event-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Anything worth remembering about this event..."
          />
        </div>

        {error ? <InlineError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initial ? "Save changes" : "Create event"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
