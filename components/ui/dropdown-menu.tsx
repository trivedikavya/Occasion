"use client";

import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof RadixDropdown.Content>) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-[160px] rounded-md border border-border bg-surface2 p-1 shadow-panel",
          "data-[state=open]:animate-fade-in",
          className
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdown.Item>) {
  return (
    <RadixDropdown.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-1.5 text-sm text-foreground outline-none",
        "data-[highlighted]:bg-surface data-[highlighted]:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdown.Label>) {
  return (
    <RadixDropdown.Label
      className={cn("px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted", className)}
      {...props}
    />
  );
}
