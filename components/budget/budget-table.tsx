"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import type { BudgetItem } from "@/types/budget";

function EditableNumber({
  value,
  onCommit,
  className,
}: {
  value: number;
  onCommit: (value: number) => void;
  className?: string;
}) {
  const [local, setLocal] = useState(String(value));

  return (
    <Input
      type="number"
      min={0}
      step={500}
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => {
        const parsed = Number(local);
        onCommit(Number.isFinite(parsed) && parsed >= 0 ? parsed : value);
        setLocal(String(Number.isFinite(parsed) && parsed >= 0 ? parsed : value));
      }}
      className={className}
      aria-label="Amount"
    />
  );
}

export function BudgetTable({ eventId, items }: { eventId: string; items: BudgetItem[] }) {
  const { addBudgetItem, updateBudgetItem, deleteBudgetItem } = useStore();
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});

  const plannedTotal = items.reduce((sum, b) => sum + b.planned, 0);
  const actualTotal = items.reduce((sum, b) => sum + b.actual, 0);

  function categoryValue(item: BudgetItem): string {
    return categoryDrafts[item.id] ?? item.category;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface2/60 text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-2.5 font-medium">Category</th>
            <th className="px-3 py-2.5 font-medium">Planned</th>
            <th className="px-3 py-2.5 font-medium">Actual</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="w-10 px-3 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const overBy = item.actual - item.planned;
            const isOver = overBy > 0;
            return (
              <tr key={item.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <Input
                    value={categoryValue(item)}
                    onChange={(e) =>
                      setCategoryDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    onBlur={() => {
                      const next = categoryValue(item).trim();
                      if (next && next !== item.category) {
                        updateBudgetItem(eventId, item.id, { category: next });
                      } else {
                        setCategoryDrafts((prev) =>
                          Object.fromEntries(
                            Object.entries(prev).filter(([key]) => key !== item.id)
                          )
                        );
                      }
                    }}
                    aria-label="Category name"
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableNumber
                    value={item.planned}
                    onCommit={(v) => updateBudgetItem(eventId, item.id, { planned: v })}
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableNumber
                    value={item.actual}
                    onCommit={(v) => updateBudgetItem(eventId, item.id, { actual: v })}
                  />
                </td>
                <td className="px-3 py-2">
                  {isOver ? (
                    <Badge tone="danger">+{formatINR(overBy)} over</Badge>
                  ) : (
                    <Badge tone="success">On track</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => deleteBudgetItem(eventId, item.id)}
                    aria-label={`Delete ${item.category}`}
                    className="rounded-md p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border bg-surface2/40 text-sm font-medium">
            <td className="px-3 py-2.5 text-foreground">Total</td>
            <td className="px-3 py-2.5 text-foreground">{formatINR(plannedTotal)}</td>
            <td className="px-3 py-2.5 text-foreground">{formatINR(actualTotal)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addBudgetItem(eventId, { category: "New category", planned: 0, actual: 0 })}
        >
          <Plus size={14} />
          Add category
        </Button>
      </div>
    </div>
  );
}
