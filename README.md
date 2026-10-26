# Occasion

An AI planning assistant for Indian weddings, birthdays and community events (society
festivals like a Garba/Navratri night) — a dark, Notion-board-style planning tool with
budget tracking, a drag-and-drop timeline, a vendor pipeline, and a Gemini-powered
assistant layered on top.

## Stack

- **Next.js 14** (App Router) + **TypeScript** (strict, no `any`) + **Tailwind CSS**
- **Gemini** via `@google/genai`, called only from server route handlers (`app/api/*`)
- **Zod** validates every AI response (and every API route's input)
- **dnd-kit** for the drag-and-drop timeline board
- **Recharts** for the budget donut chart
- **Radix UI** primitives (Dialog, Dropdown, Tabs, Tooltip) for accessible overlays
- **localStorage**, behind a small data-access layer (`lib/store.ts`), so it can be
  swapped for a real database later without touching components

> **A note on the Gemini SDK:** the brief asked for `@google/generative-ai`, but Google
> deprecated that package (EOL August 2025) in favor of `@google/genai`. This project
> uses `@google/genai` instead — the `lib/gemini.ts` wrapper keeps the same shape either
> way, so swapping is a one-file change if you need to.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY (or leave MOCK_AI=true)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first load the app seeds three
realistic demo events (a wedding, a birthday, a community Garba night) straight into
`localStorage` — there's nothing else to configure to start exploring.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks and lints) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint only |
| `npx tsc --noEmit` | TypeScript only |

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | _(none)_ | Server-only. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey). Never exposed to the client. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Override the model used for every AI call. |
| `MOCK_AI` | `false` | Force mock mode even if a key is present. Mock mode also turns on automatically whenever `GEMINI_API_KEY` is missing — the whole app works without a key. |

## How mock mode works

Every AI feature is written against `lib/gemini.ts`'s `generateJson()` / `streamText()`
wrappers, each of which takes a `mock()` fallback alongside the real prompt. When
`isMockMode()` is true (no key, or `MOCK_AI=true`), the wrapper skips the network call
entirely and returns the canned response from `lib/gemini-mock.ts` instead — lightly
templated off the real event data so it still feels grounded (e.g. it'll reference your
actual budget categories and vendor names). The response still flows through the same
Zod schema and the same UI, so you can develop and demo the entire app, including
streaming chat, without ever calling Google.

## Architecture

```
app/
  (pages)                      Event-scoped pages: overview, budget, timeline, vendors, ideas
  api/ai/*/route.ts            7 server routes — the only place @google/genai is imported
  style-profile/, settings/    Global pages (not event-scoped)
components/
  layout/                      Sidebar, topbar, command palette, event sub-nav
  providers/                   StoreProvider (localStorage-backed state) + ShortcutsProvider
  ui/                          Design-system primitives (button, dialog/sheet, tabs, badge...)
  ai/                          Quick Capture, Assistant panel, Proposal review, Mic button
  budget/, timeline/, vendors/, ideas/, events/, panels/, style-profile/, settings/
lib/
  store.ts                     DataStore interface + localStorage implementation
  gemini.ts                    Gemini wrapper: JSON mode, retry-once, timeout, mock fallback
  gemini-mock.ts                Canned responses for every AI feature
  prompts/*.ts                  System prompt + context builders per feature
  schemas/ai.ts                 Zod schemas for every AI response (also drive Gemini's JSON schema)
  selectors.ts, dates.ts, constants.ts, vendor-messages.ts, ...
types/
  event.ts, task.ts, budget.ts, vendor.ts, idea.ts, styleProfile.ts, shortcuts.ts, common.ts
```

**Data flow.** Since persistence is `localStorage`, it only exists on the client. API
routes have no way to read it directly, so the client assembles the relevant context
(the active event, budget, tasks, vendors, and the global Style Profile) and sends it in
the POST body. Every route re-validates that payload with Zod before building a prompt —
nothing reaches Gemini unvalidated, and nothing reaches the UI unvalidated either.

**AI response validation.** Each Gemini call uses JSON mode with a `responseJsonSchema`
generated directly from the same Zod schema used to validate the response
(`z.toJSONSchema()` — Zod v4's built-in JSON Schema export, no third-party conversion
library needed). If the model returns something that fails `schema.safeParse()`, the
wrapper retries once with a corrective note ("your last response didn't match the
schema..."); if that also fails, the route returns a friendly error the UI surfaces with
a "Try again" action.

**Approve-before-apply.** Every AI feature that can change data — Quick Capture, the
Assistant's chat commands, and the Budget Optimizer — normalizes its output into the
same `AssistantProposal` union (`lib/schemas/ai.ts`) and renders it through one shared
`<ProposalReview>` component: a checklist the user reviews and explicitly applies.
Nothing is written to `localStorage` until that click. Matching a proposal back to an
existing task/vendor/budget category (e.g. "mark the mehendi artist as booked") is
best-effort, case-insensitive name matching, since the model only has names to go on —
see `lib/hooks/use-apply-proposals.ts`.

**Streaming + structured output together.** The Assistant panel needs both a live
streamed reply *and* validated structured proposals from a single turn. Rather than
fight JSON mode and streaming against each other, the system prompt asks the model to
end its reply with a `---PROPOSALS---` marker followed by a JSON block. The route
streams text to the client as it arrives, holding back a small buffer so the raw marker
is never flashed on screen, then parses and validates the trailing JSON (retrying once,
non-streamed, if it's malformed) and appends it after a NUL-byte sentinel the client
splits on. See `app/api/ai/assistant/route.ts` and `lib/ai-client.ts`.

## How to use Quick Capture

Quick Capture is the large textarea at the top of every event page. The idea is you
don't have to write tidy notes — paste or dictate exactly what's in your head:

> "ok so caterer called said per plate cost going up to twelve hundred a plate for the
> two fifty guests also need to book a mehendi artist follow up and decor guy still
> hasnt sent the final quote getting worried about that"

Click **Capture**. Gemini (or the mock responder, if you haven't set a key) reads that
and proposes concrete changes — new tasks, a budget update with a reason, a note on an
existing vendor, and a flag if something looks risky or worth a heads-up. Nothing is
applied yet: you get a checklist to review, uncheck anything you don't want, and click
**Apply**. The small mic icon next to the character count uses your browser's built-in
dictation (Web Speech API) if it's available — or just use whatever system-wide
dictation tool you already have; every input in this app is a plain, focusable
`<textarea>`, so it works the same either way.

## Accessibility & quality notes

- All interactive controls are real `<button>`/`<input>`/`<label>` elements with
  `aria-label`s where there's no visible text; focus rings are visible everywhere
  (`:focus-visible` in `globals.css`).
- The Kanban board uses `dnd-kit`'s pointer *and* keyboard sensors; every card also has a
  keyboard-reachable "Move to..." menu as a non-drag fallback for changing status.
  Command bar, assistant panel, and quick-capture-focus shortcuts are configurable from
  **Settings**, and deliberately default away from common OS/dictation hotkeys.
  Plain-letter shortcuts are suppressed while a text field has focus so they never
  swallow a keystroke while typing or dictating.
- Every screen has explicit empty, loading (skeleton), and error states — see
  `components/ui/empty-state.tsx`, `skeleton.tsx`, `error-state.tsx`.
- No secrets reach the client: `GEMINI_API_KEY` is read only inside `app/api/*` route
  handlers (`export const runtime = "nodejs"`), never in a Client Component.

## Security note

The repository's `.env.local` is git-ignored (see `.gitignore`); `.env.example` ships
with empty values only. If you've been testing with a key pasted somewhere public,
rotate it in [Google AI Studio](https://aistudio.google.com/app/apikey) afterwards.
