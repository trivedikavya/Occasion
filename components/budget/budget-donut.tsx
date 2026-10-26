"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { BudgetItem } from "@/types/budget";
import { CHART_COLORS } from "@/lib/constants";
import { formatINR, formatINRCompact } from "@/lib/utils";

export function BudgetDonut({ items, total }: { items: BudgetItem[]; total: number }) {
  const data = items
    .filter((item) => item.actual > 0)
    .map((item, i) => ({
      name: item.category,
      value: item.actual,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const actualTotal = items.reduce((sum, b) => sum + b.actual, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted">
        No spend recorded yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatINR(Number(value))}
              contentStyle={{
                background: "#1C1C1F",
                border: "1px solid #2A2A2E",
                borderRadius: 8,
                fontSize: 12,
                color: "#E6E6E8",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-foreground">
            {formatINRCompact(actualTotal)}
          </span>
          <span className="text-[11px] text-muted">of {formatINRCompact(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="min-w-0 flex-1 truncate text-foreground">{entry.name}</span>
            <span className="text-muted">{formatINR(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
