"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { InlineError } from "@/components/ui/error-state";
import { VENDOR_STATUSES, type Vendor, type VendorInput } from "@/types/vendor";
import { VENDOR_STATUS_LABELS } from "@/lib/constants";

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorySuggestions: string[];
  initial?: Vendor;
  defaultCategory?: string;
  onSubmit: (input: VendorInput) => void;
}

function defaultForm(initial?: Vendor, defaultCategory?: string): VendorInput {
  if (initial) {
    return {
      category: initial.category,
      name: initial.name,
      contact: initial.contact,
      status: initial.status,
      quote: initial.quote,
      notes: initial.notes,
    };
  }
  return {
    category: defaultCategory ?? "",
    name: "",
    contact: "",
    status: "shortlisted",
    quote: null,
    notes: "",
  };
}

export function VendorFormDialog({
  open,
  onOpenChange,
  categorySuggestions,
  initial,
  defaultCategory,
  onSubmit,
}: VendorFormDialogProps) {
  const [form, setForm] = useState<VendorInput>(() => defaultForm(initial, defaultCategory));
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) setForm(defaultForm(initial, defaultCategory));
    onOpenChange(next);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Vendor name is required.");
      return;
    }
    if (!form.category.trim()) {
      setError("Category is required.");
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
      title={initial ? "Edit vendor" : "New vendor"}
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <Label htmlFor="vendor-category">Category</Label>
          <Input
            id="vendor-category"
            list="vendor-category-suggestions"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Catering"
            autoFocus
          />
          <datalist id="vendor-category-suggestions">
            {categorySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <Label htmlFor="vendor-name">Vendor name</Label>
          <Input
            id="vendor-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Royal Feast Caterers"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="vendor-contact">Contact (phone)</Label>
            <Input
              id="vendor-contact"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <Label htmlFor="vendor-status">Status</Label>
            <Select
              id="vendor-status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as VendorInput["status"] })}
            >
              {VENDOR_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {VENDOR_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="vendor-quote">Quote amount (INR)</Label>
          <Input
            id="vendor-quote"
            type="number"
            min={0}
            value={form.quote ?? ""}
            onChange={(e) =>
              setForm({ ...form, quote: e.target.value === "" ? null : Number(e.target.value) })
            }
            placeholder="Leave blank if awaiting a quote"
          />
        </div>

        <div>
          <Label htmlFor="vendor-notes">Notes</Label>
          <Textarea
            id="vendor-notes"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {error ? <InlineError message={error} /> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initial ? "Save changes" : "Add vendor"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
