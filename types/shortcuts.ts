import { z } from "zod";

/**
 * Shortcut combos are stored as strings like "mod+k" where "mod" means
 * Ctrl on Windows/Linux and Cmd on macOS. Deliberately kept away from
 * system-reserved dictation hotkeys (e.g. Win+H, Fn).
 */
export const ShortcutsSchema = z.object({
  commandBar: z.string().min(1).default("mod+k"),
  assistant: z.string().min(1).default("mod+j"),
  quickCaptureFocus: z.string().min(1).default("mod+shift+c"),
});
export type ShortcutsConfig = z.infer<typeof ShortcutsSchema>;

export const DEFAULT_SHORTCUTS: ShortcutsConfig = {
  commandBar: "mod+k",
  assistant: "mod+j",
  quickCaptureFocus: "mod+shift+c",
};

export const SHORTCUT_LABELS: Record<keyof ShortcutsConfig, string> = {
  commandBar: "Open command bar",
  assistant: "Toggle assistant panel",
  quickCaptureFocus: "Focus quick capture",
};
