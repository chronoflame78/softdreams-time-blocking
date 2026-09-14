# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Home test for a **Middle React Developer** position (see `assignment.md`, written in Vietnamese).
Goal: build a **Time Blocking calendar React component** that lets users create and manage
events on a 7‑day calendar, then deploy it as a standalone app with a public URL.

Reference UI: `gcal_7days.png` (Google Calendar week view — 7 day columns, hourly rows on the
left, colored event blocks, a red "current time" line). Pixel‑perfect matching is **not**
required; the functional requirements are.

## Hard constraints (from the assignment — do not violate)

- **TypeScript** everywhere.
- **No external libraries** beyond React (and its type packages). This means:
  - No date libraries (`date-fns`, `dayjs`, `moment`, `luxon`) — write small date helpers by hand.
  - No drag‑and‑drop libraries (`react-dnd`, `dnd-kit`, `react-beautiful-dnd`) — use native
    pointer/mouse events.
  - No UI/component libraries (`MUI`, `Radix`, `shadcn`, `headlessui`, etc.) — build dialogs
    and context menus by hand.
  - No state libraries — React hooks (`useState`/`useReducer`/context) are enough.
- **Tailwind CSS is allowed** (and is the only styling dependency permitted).
- Build & test tooling (Vite, TypeScript, Tailwind, PostCSS, ESLint, Vitest, Testing Library) is fine as **devDependencies** —
  the restriction is about runtime libraries in the component.
- Keep components **small, well‑separated, and readable** — this is explicitly graded.
- Write tests alongside features (see `TASKS.md` §12); keep `utils/` and `hooks/` pure so they are easy to unit-test.

## Functional requirements (checklist)

1. **Event model**: `title`, `description`, `start` (date + time), `end` (date + time).
   No all‑day events — every event has explicit start/end date‑times.
2. **Visible range**: exactly **7 days starting from the current date** (today + next 6 days).
3. **Create by drag on empty space**: dragging over an empty time span opens a dialog
   pre‑filled with the selected start/end; user fills title/description and saves.
4. **Move by drag & drop**: dragging an existing event to a new slot (same or different day)
   updates its start/end, preserving duration.
5. **Left‑click an event** → dialog showing the event's details (title, description, times).
6. **Right‑click an event** → context menu with two actions:
   - **Edit** → dialog to edit the event, save changes.
   - **Delete** → remove the event.

## Planned stack & layout

Default choices (change only if there's a good reason, and keep within the constraints):

- Vite + React 18 + TypeScript, Tailwind CSS.
- Tests: Vitest + jsdom + React Testing Library; tests co-located as `*.test.ts(x)` next to source.
- Deploy target: static host (Vercel / Netlify / GitHub Pages).

Suggested structure:

```
src/
  components/
    calendar/        # Calendar, DayColumn, TimeGutter, EventBlock, CurrentTimeLine, ...
    dialogs/         # EventFormDialog (create/edit), EventDetailDialog
    ui/              # Modal, ContextMenu — hand‑written primitives
  hooks/             # useDragToCreate, useDragToMove, useContextMenu, ...
  types/             # Event and related types
  utils/             # date helpers (formatting, snapping to 15‑min slots, overlap math)
  App.tsx
  main.tsx
```

## Implementation notes

- Use **native `Date`**; keep helpers pure and unit‑testable (`utils/date.ts`).
- Snap drag selections to a fixed slot (15 min is a sensible default, matching the screenshot).
- Use `onPointerDown/Move/Up` with `setPointerCapture` for drag logic; distinguish a click
  from a drag with a small movement threshold so left‑click still opens the detail dialog.
- Prevent the browser's default context menu on events (`e.preventDefault()` on `onContextMenu`).
- Validate in the form: end must be after start; title required.
- Persist events in `localStorage` so the deployed demo survives a refresh (nice‑to‑have).
- Seed a few sample events on first load so the demo isn't empty.
- Handle overlapping events gracefully (side‑by‑side or stacked) — not required, but expected
  from a "middle" level submission.

## Commands

Once the project is scaffolded (Vite):

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build
npm run lint      # if ESLint is configured
npm test          # vitest in watch mode
npm run test:run  # single run (CI / pre-deploy)
```

## Deliverables

- Source pushed to **GitHub**.
- Component deployed as an app with a **public URL** (put it in the README).
- Deadline: **5 days** from receiving the test.
