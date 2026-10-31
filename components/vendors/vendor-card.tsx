"use client";

import { useState } from "react";
import { MessageSquareText, ListChecks, Pencil, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WhatsAppMessageDialog } from "./whatsapp-message-dialog";
import { VENDOR_STATUS_LABELS, VENDOR_STATUS_ORDER } from "@/lib/constants";
import { buildChecklistMessage, buildQuoteRequestMessage, formatChecklistMessage } from "@/lib/vendor-messages";
import { requestVendorQuestions, requestVendorWhatsapp } from "@/lib/ai-client";
import { formatINR } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";
import type { Vendor, VendorStatus } from "@/types/vendor";

interface VendorCardProps {
  event: Event;
  vendor: Vendor;
  onEdit: () => void;
}

export function VendorCard({ event, vendor, onEdit }: VendorCardProps) {
  const { updateVendor, deleteVendor, styleProfile } = useStore();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [quoteMsgOpen, setQuoteMsgOpen] = useState(false);
  const awaitingQuote = vendor.quote === null && vendor.status !== "booked";

  function setStatus(status: VendorStatus) {
    updateVendor(event.id, vendor.id, { status });
  }

  return (
    <div className="rounded-md border border-border bg-surface2 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{vendor.name}</p>
          {vendor.contact ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
              <Phone size={11} />
              {vendor.contact}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={onEdit}
            aria-label={`Edit ${vendor.name}`}
            className="rounded p-1.5 text-muted hover:bg-surface hover:text-foreground"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => deleteVendor(event.id, vendor.id)}
            aria-label={`Delete ${vendor.name}`}
            className="rounded p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1">
        {VENDOR_STATUS_ORDER.map((status) => {
          const active = vendor.status === status;
          return (
            <button
              key={status}
              onClick={() => setStatus(status)}
              className={cn(
                "rounded-sm border px-2 py-0.5 text-[11px] font-medium transition-colors",
                active
                  ? "border-accent/40 bg-accent-muted text-accent-muted-foreground"
                  : "border-border text-muted hover:text-foreground"
              )}
            >
              {VENDOR_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div>
          {vendor.quote !== null ? (
            <p className="text-sm text-foreground">{formatINR(vendor.quote)}</p>
          ) : (
            <Badge tone={awaitingQuote ? "warning" : "neutral"}>
              {awaitingQuote ? "Awaiting quote" : "No quote"}
            </Badge>
          )}
        </div>
      </div>

      {vendor.notes ? <p className="mt-2 text-xs text-muted">{vendor.notes}</p> : null}

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
        <Button variant="secondary" size="sm" onClick={() => setChecklistOpen(true)}>
          <ListChecks size={13} />
          Checklist
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setQuoteMsgOpen(true)}>
          <MessageSquareText size={13} />
          Quote request
        </Button>
      </div>

      <WhatsAppMessageDialog
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
        title={`Questions for ${vendor.category}`}
        message={buildChecklistMessage(vendor)}
        contact={vendor.contact}
        onGenerateWithAi={async () => {
          const result = await requestVendorQuestions(event, vendor);
          return formatChecklistMessage(vendor, result.questions);
        }}
      />
      <WhatsAppMessageDialog
        open={quoteMsgOpen}
        onOpenChange={setQuoteMsgOpen}
        title={`Quote request for ${vendor.name}`}
        message={buildQuoteRequestMessage(event, vendor)}
        contact={vendor.contact}
        onGenerateWithAi={async () => {
          const result = await requestVendorWhatsapp(event, vendor, styleProfile);
          return result.message;
        }}
      />
    </div>
  );
}
