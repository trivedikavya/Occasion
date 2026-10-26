"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Centered modal dialog — used for forms like "New Event" and confirmations. */
export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(480px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2",
            "rounded-lg border border-border bg-surface p-5 shadow-panel focus:outline-none",
            "data-[state=open]:animate-slide-up",
            className
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <RadixDialog.Title className="text-sm font-semibold text-foreground">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-1 text-xs text-muted">
                  {description}
                </RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                aria-label="Close dialog"
                className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  side?: "right" | "left";
  widthClassName?: string;
}

/** Slide-over side panel — used for task edit, assistant chat, etc. */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  side = "right",
  widthClassName = "w-[min(420px,100vw)]",
}: SheetProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            "fixed top-0 z-50 h-full border-border bg-surface shadow-panel focus:outline-none",
            "flex flex-col",
            side === "right" ? "right-0 border-l" : "left-0 border-r",
            widthClassName
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border p-4">
            <div>
              <RadixDialog.Title className="text-sm font-semibold text-foreground">
                {title}
              </RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="mt-1 text-xs text-muted">
                  {description}
                </RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <button
                aria-label="Close panel"
                className="rounded-md p-1 text-muted hover:bg-surface2 hover:text-foreground"
              >
                <X size={16} />
              </button>
            </RadixDialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
