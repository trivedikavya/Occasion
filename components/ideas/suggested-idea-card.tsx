"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IDEA_TYPE_LABELS } from "@/lib/constants";
import type { IdeaProposal } from "@/lib/schemas/ai";

export function SuggestedIdeaCard({
  idea,
  onSave,
}: {
  idea: IdeaProposal;
  onSave: () => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-md border border-dashed border-accent/30 bg-accent-muted/10 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <Badge tone="accent">{IDEA_TYPE_LABELS[idea.type]}</Badge>
        <Button
          variant={saved ? "secondary" : "primary"}
          size="sm"
          disabled={saved}
          onClick={() => {
            onSave();
            setSaved(true);
          }}
        >
          {saved ? <Check size={13} /> : <Plus size={13} />}
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{idea.title}</p>
      <p className="mt-1 text-sm text-muted">{idea.body}</p>
    </div>
  );
}
