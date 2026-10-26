"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { CopyButton } from "@/components/ui/copy-button";
import { Button } from "@/components/ui/button";
import { InlineError } from "@/components/ui/error-state";
import { buildWhatsAppLink } from "@/lib/vendor-messages";
import { AiClientError } from "@/lib/ai-client";

interface WhatsAppMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  contact: string;
  /** Optional: lets the dialog fetch an AI-personalized version on demand. */
  onGenerateWithAi?: () => Promise<string>;
}

export function WhatsAppMessageDialog({
  open,
  onOpenChange,
  title,
  message,
  contact,
  onGenerateWithAi,
}: WhatsAppMessageDialogProps) {
  const [current, setCurrent] = useState(message);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrent(message);
      setError(null);
    }
  }, [open, message]);

  async function handleGenerate() {
    if (!onGenerateWithAi) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onGenerateWithAi();
      setCurrent(result);
    } catch (err) {
      setError(err instanceof AiClientError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} className="w-[min(520px,calc(100vw-32px))]">
      <div className="space-y-3">
        <pre className="max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-surface2 p-3 text-sm text-foreground">
          {current}
        </pre>
        {error ? <InlineError message={error} /> : null}
        <div className="flex items-center justify-between gap-2">
          {onGenerateWithAi ? (
            <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
              <Sparkles size={13} />
              {loading ? "Generating..." : "Generate with AI"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <CopyButton text={current} label="Copy message" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.open(buildWhatsAppLink(contact, current), "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={14} />
              Open in WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
