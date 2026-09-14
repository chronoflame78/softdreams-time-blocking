# TASKS

Checklist for completing the Time Blocking calendar assignment (see `assignment.md`, `CLAUDE.md`).

## 1. Project setup

- [x] Scaffold with Vite: `npm create vite@latest . -- --template react-ts`
- [x] Install & configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `@tailwind` directives in `index.css`)
- [x] Configure ESLint / Prettier (optional, dev-only)
- [x] Install Vitest + Testing Library (dev-only): `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [x] Configure Vitest in `vite.config.ts` (`test.environment: 'jsdom'`, `globals: true`, `setupFiles`)
- [x] Create `src/test/setup.ts` (import `@testing-library/jest-dom/vitest`)
- [x] Add scripts: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:coverage": "vitest run --coverage"`
- [x] Verify `package.json` has **no runtime deps** other than `react` / `react-dom` (all test tooling under `devDependencies`)
- [x] Clean out Vite boilerplate (`App.css`, logos, default counter)
- [x] Create folder structure: `components/calendar`, `components/dialogs`, `components/ui`, `hooks`, `types`, `utils`
- [x] Commit: "chore: scaffold project"

## 2. Types & utilities

- [x] Define `CalendarEvent` type (`id`, `title`, `description`, `start: Date`, `end: Date`)
- [x] Write `utils/date.ts` helpers (no libraries):
  - [x] `startOfDay`, `addDays`, `addMinutes`, `isSameDay`
  - [x] `getWeekDays(today)` → array of 7 `Date`s starting from today
  - [x] `formatTime` (HH:mm), `formatDayHeader` (e.g. `THU 20`)
  - [x] `snapToSlot(minutes, slot = 15)`
  - [x] `minutesFromDayStart(date)` / `dateFromDayAndMinutes(day, minutes)`
  - [x] Convert `Date` ↔ `datetime-local` input string
- [x] Write `utils/layout.ts` for event positioning (top/height from start/end) and overlap grouping
- [x] Generate IDs (`crypto.randomUUID()` with fallback)

## 3. State management

- [x] `useEvents` hook (or `useReducer`) with actions: `add`, `update`, `remove`, `move`
- [x] Persist events to `localStorage` (serialize `Date` ↔ ISO string)
- [x] Seed sample events on first load (empty storage)

## 4. Calendar grid UI

- [x] `Calendar` container — computes 7-day range from `new Date()`
- [x] `CalendarHeader` — day-of-week + day number for each column, highlight today
- [x] `TimeGutter` — hour labels `00:00`–`23:00` on the left, timezone label (e.g. `GMT+7`)
- [x] `DayColumn` — 24 hourly rows with grid lines, renders events for that day
- [x] `EventBlock` — absolutely positioned block showing title + time range
- [x] `CurrentTimeLine` — red line/dot on today's column, updates every minute
- [x] Scrollable body; auto-scroll to current hour on mount
- [x] Responsive enough to be usable on a laptop screen

## 5. UI primitives (hand-written)

- [x] `Modal` / `Dialog` — overlay, close on Esc / backdrop click, focus trap basics
- [x] `ContextMenu` — positioned at cursor, closes on outside click / Esc / scroll
- [x] Basic form inputs styled with Tailwind (text, textarea, `datetime-local`)

## 6. Feature: drag on empty space → create event (Req. 3)

- [x] `useDragToCreate` hook using pointer events on `DayColumn`
- [x] Snap start/end to 15-min slots; support dragging upward (swap start/end)
- [x] Show a live "ghost" selection while dragging
- [x] On release, open `EventFormDialog` pre-filled with selected start/end
- [x] Save → add event; Cancel → discard selection
- [x] Enforce minimum duration (e.g. 15 min)

## 7. Feature: drag & drop event → update time (Req. 4)

- [x] `useDragToMove` hook on `EventBlock` (pointer capture)
- [x] Distinguish click vs drag with movement threshold (~4px)
- [x] Allow moving across day columns; preserve duration
- [x] Snap to 15-min slots; clamp within the day / 7-day range
- [x] Visual feedback while dragging (opacity / shadow, ghost position)
- [x] On release, dispatch `move` with new start/end

## 8. Feature: left-click event → detail dialog (Req. 5)

- [x] `EventDetailDialog` showing title, description, formatted start–end
- [x] Open on click (not after a drag)
- [x] Optional: Edit / Delete buttons inside the detail dialog too

## 9. Feature: right-click event → context menu (Req. 6)

- [x] `preventDefault` on `onContextMenu`, open `ContextMenu` at cursor
- [x] **Edit** → open `EventFormDialog` in edit mode, save updates the event
- [x] **Delete** → remove event (optional confirm)
- [x] Menu closes after action

## 10. Event form (create / edit) — Req. 1

- [x] `EventFormDialog` with fields: title, description, start (`datetime-local`), end (`datetime-local`)
- [x] Validation: title required, end > start, show inline error messages
- [x] Reuse the same component for create and edit modes
- [x] Submit on Enter, close on Esc

## 11. Polish

- [x] Overlapping events render side-by-side (column packing) or at least remain clickable
- [x] Hover states, cursor styles (`cursor-grab` / `cursor-grabbing`, `cursor-crosshair` on grid)
- [x] Truncate long titles; show time range only if block is tall enough
- [x] Accessibility basics: buttons are `<button>`, dialogs have `role="dialog"`, aria labels
- [x] Empty-state / helper hint (e.g. "Drag on the calendar to create an event")
- [x] Check for console warnings/errors, unused code

## 12. Automated tests (Vitest)

Co-locate tests as `*.test.ts` / `*.test.tsx` next to the source files.

### Unit tests — `utils/date.test.ts`

- [x] `startOfDay` zeroes hours/minutes/seconds/ms
- [x] `addDays` / `addMinutes` (incl. crossing midnight and month boundaries)
- [x] `isSameDay` true/false cases
- [x] `getWeekDays(today)` returns 7 consecutive days starting from today
- [x] `formatTime` pads to `HH:mm`; `formatDayHeader` outputs e.g. `THU 20`
- [x] `snapToSlot` rounds to nearest 15-min slot (0, 7 → 0; 8 → 15; 59 → 60)
- [x] `minutesFromDayStart` ↔ `dateFromDayAndMinutes` round-trip
- [x] `Date` ↔ `datetime-local` string conversion round-trip (local timezone)

### Unit tests — `utils/layout.test.ts`

- [x] Event top/height computed correctly from start/end
- [x] Event spanning past midnight is clipped to the day column
- [x] Non-overlapping events each get full width
- [x] Two overlapping events split into 2 columns; three chained overlaps → 3 columns
- [x] Touching events (end === next start) do **not** count as overlapping

### Unit tests — `hooks/useEvents.test.ts` (use `renderHook`)

- [x] `add` appends an event with a generated id
- [x] `update` changes only the target event
- [x] `remove` deletes by id
- [x] `move` shifts start/end while preserving duration
- [x] State persists to `localStorage` and rehydrates on mount (mock `localStorage`)
- [x] Seeds sample events when storage is empty; does not re-seed when data exists

### Unit tests — event form validation

- [x] Empty title → error
- [x] End ≤ start → error
- [x] Valid input → no errors

### Component tests — `components/**/*.test.tsx`

- [x] `CalendarHeader` renders 7 day headers and highlights today
- [x] `TimeGutter` renders 24 hour labels
- [x] `EventBlock` renders title and time range; applies correct `top`/`height` style
- [x] `Modal` closes on Esc and on backdrop click; does not close on inner click
- [x] `ContextMenu` renders at given coordinates; closes on outside click / Esc
- [x] `EventFormDialog` (create) shows pre-filled start/end and calls `onSave` with form values
- [x] `EventFormDialog` (edit) pre-fills existing event and calls `onSave` with updated values
- [x] `EventFormDialog` shows validation errors and does not call `onSave`
- [x] `EventDetailDialog` shows title, description, and formatted time range

### Integration tests — `Calendar.test.tsx` (mock `Date.now` / use `vi.setSystemTime`)

- [x] Renders the 7-day range starting from the mocked "today"
- [x] Drag on empty slot (pointerdown → pointermove → pointerup) opens create dialog with snapped times
- [x] Dragging upward produces start < end (swapped correctly)
- [x] Saving the create dialog adds an `EventBlock` to the grid
- [x] Dragging an `EventBlock` to another slot/day updates its rendered time
- [x] Small pointer movement (< threshold) on an event opens the detail dialog instead of moving it
- [x] Left-click on an event opens `EventDetailDialog`
- [x] Right-click on an event opens the context menu with "Edit" and "Delete"
- [x] Context menu → Edit → save updates the event title in the grid
- [x] Context menu → Delete removes the event from the grid
- [x] `CurrentTimeLine` renders only in today's column at the correct offset

### Test hygiene

- [x] `vitest run` passes with no failures or act() warnings
- [x] Coverage report generated; aim for high coverage on `utils/` and `hooks/`
- [ ] Add `test:run` to CI / pre-deploy check (optional)

## 13. Manual QA

- [ ] Create an event by dragging (downwards and upwards)
- [ ] Move an event within the same day and to another day
- [ ] Click event → detail dialog opens; drag does **not** open it
- [ ] Right-click → Edit → changes saved
- [ ] Right-click → Delete → event removed
- [ ] Refresh page → events persist
- [ ] Current-time line is on the correct day/hour
- [ ] Test in Chrome + Firefox (+ Edge)
- [x] `npm run build` succeeds with no TS errors
- [x] `npm run test:run` passes

## 14. Documentation

- [x] `README.md`: project description, features, tech stack, how to run, live demo URL
- [x] Screenshot/GIF of the app in README
- [x] Note the "no external libraries" constraint and how it was satisfied
- [x] Document how to run the tests (`npm test`)

## 15. Delivery

- [ ] Push source code to a **public GitHub repo**
- [ ] Deploy to Vercel / Netlify / GitHub Pages
- [ ] Verify the **public URL** works in an incognito window
- [ ] Add the public URL to `README.md` and the repo description
- [ ] Final review against `assignment.md` requirements 1–6
- [ ] Submit before the **5-day deadline**
