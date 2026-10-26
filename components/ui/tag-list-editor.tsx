"use client";

import { useState, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "./input";

interface TagListEditorProps {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel: string;
}

export function TagListEditor({ values, onChange, placeholder, ariaLabel }: TagListEditorProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface2 p-2">
        {values.map((value, i) => (
          <span
            key={`${value}-${i}`}
            className="flex items-center gap-1 rounded-sm bg-surface px-2 py-1 text-xs text-foreground"
          >
            {value}
            <button
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label={`Remove ${value}`}
              className="text-muted hover:text-danger"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : "Add another..."}
          aria-label={ariaLabel}
          className="h-7 min-w-[120px] flex-1 border-0 bg-transparent p-0 text-xs focus-visible:border-0"
        />
      </div>
      {draft.trim() ? (
        <button
          onClick={commit}
          className="mt-1 flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <Plus size={11} /> Add &quot;{draft.trim()}&quot;
        </button>
      ) : null}
    </div>
  );
}
