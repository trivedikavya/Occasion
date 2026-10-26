import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger/5 px-6 py-8 text-center",
        className
      )}
    >
      <AlertTriangle size={20} className="mb-2 text-danger" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-muted">{description}</p> : null}
      {onRetry ? (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function InlineError({ message, className }: { message: string; className?: string }) {
  return (
    <p role="alert" className={cn("flex items-center gap-1.5 text-xs text-danger", className)}>
      <AlertTriangle size={12} />
      {message}
    </p>
  );
}
