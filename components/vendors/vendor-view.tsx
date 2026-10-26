"use client";

import { useState } from "react";
import { Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { VendorCard } from "./vendor-card";
import { VendorFormDialog } from "./vendor-form-dialog";
import { useStore } from "@/components/providers/store-provider";
import { VENDOR_CATEGORIES_BY_EVENT_TYPE } from "@/lib/constants";
import type { Event } from "@/types/event";
import type { Vendor } from "@/types/vendor";

export function VendorView({ event }: { event: Event }) {
  const { addVendor, updateVendor } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>(undefined);

  const suggestions = VENDOR_CATEGORIES_BY_EVENT_TYPE[event.type];

  const groups = new Map<string, Vendor[]>();
  for (const vendor of event.vendors) {
    if (!groups.has(vendor.category)) groups.set(vendor.category, []);
    groups.get(vendor.category)!.push(vendor);
  }
  // Keep suggested categories in a sensible order, append any custom ones after.
  const orderedCategories = [
    ...suggestions.filter((c) => groups.has(c)),
    ...Array.from(groups.keys()).filter((c) => !suggestions.includes(c)),
  ];

  function openCreate(category?: string) {
    setEditingVendor(undefined);
    setDefaultCategory(category);
    setFormOpen(true);
  }

  function openEdit(vendor: Vendor) {
    setEditingVendor(vendor);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {event.vendors.length} vendor{event.vendors.length === 1 ? "" : "s"} across{" "}
          {groups.size} categor{groups.size === 1 ? "y" : "ies"}
        </p>
        <Button variant="primary" size="sm" onClick={() => openCreate()}>
          <Plus size={14} />
          Add vendor
        </Button>
      </div>

      {event.vendors.length === 0 ? (
        <EmptyState
          icon={<Store size={24} />}
          title="No vendors yet"
          description="Add vendors as you shortlist and contact them to track quotes and status in one place."
          action={
            <Button variant="primary" onClick={() => openCreate()}>
              Add your first vendor
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {orderedCategories.map((category) => (
            <div key={category}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted">
                  {category}
                </h3>
                <button
                  onClick={() => openCreate(category)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  + Add
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {groups.get(category)!.map((vendor) => (
                  <VendorCard key={vendor.id} event={event} vendor={vendor} onEdit={() => openEdit(vendor)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <VendorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        categorySuggestions={suggestions}
        initial={editingVendor}
        defaultCategory={defaultCategory}
        onSubmit={(input) => {
          if (editingVendor) {
            updateVendor(event.id, editingVendor.id, input);
          } else {
            addVendor(event.id, input);
          }
        }}
      />
    </div>
  );
}
