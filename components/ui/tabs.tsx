"use client";

import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = RadixTabs.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof RadixTabs.List>) {
  return (
    <RadixTabs.List
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-surface2 p-1",
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "rounded-sm px-3 py-1.5 text-xs font-medium text-muted transition-colors",
        "hover:text-foreground",
        "data-[state=active]:bg-surface data-[state=active]:text-foreground data-[state=active]:shadow-sm"
      , className)}
      {...props}
    />
  );
}

export const TabsContent = RadixTabs.Content;
