# TASKS

Checklist for completing the Time Blocking calendar assignment (see `assignment.md`, `CLAUDE.md`).

## 1. Project setup

- [ ] Scaffold with Vite: `npm create vite@latest . -- --template react-ts`
- [ ] Install & configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `@tailwind` directives in `index.css`)
- [ ] Configure ESLint / Prettier (optional, dev-only)
- [ ] Verify `package.json` has **no runtime deps** other than `react` / `react-dom`
- [ ] Clean out Vite boilerplate (`App.css`, logos, default counter)
- [ ] Create folder structure: `components/calendar`, `components/dialogs`, `components/ui`, `hooks`, `types`, `utils`
- [ ] Commit: "chore: scaffold project"

## 2. Types & utilities

- [ ] Define `CalendarEvent` type (`id`, `title`, `description`, `start: Date`, `end: Date`)
- [ ] Write `utils/date.ts` helpers (no libraries):
  - [ ] `startOfDay`, `addDays`, `addMinutes`, `isSameDay`
  - [ ] `getWeekDays(today)` → array of 7 `Date`s starting from today
  - [ ] `formatTime` (HH:mm), `formatDayHeader` (e.g. `THU 20`)
  - [ ] `snapToSlot(minutes, slot = 15)`
  - [ ] `minutesFromDayStart(date)` / `dateFromDayAndMinutes(day, minutes)`
  - [ ] Convert `Date` ↔ `datetime-local` input string
- [ ] Write `utils/layout.ts` for event positioning (top/height from start/end) and overlap grouping
- [ ] Generate IDs (`crypto.randomUUID()` with fallback)

## 3. State management

- [ ] `useEvents` hook (or `useReducer`) with actions: `add`, `update`, `remove`, `move`
- [ ] Persist events to `localStorage` (serialize `Date` ↔ ISO string)
- [ ] Seed sample events on first load (empty storage)

## 4. Calendar grid UI

- [ ] `Calendar` container — computes 7-day range from `new Date()`
- [ ] `CalendarHeader` — day-of-week + day number for each column, highlight today
- [ ] `TimeGutter` — hour labels `00:00`–`23:00` on the left, timezone label (e.g. `GMT+7`)
- [ ] `DayColumn` — 24 hourly rows with grid lines, renders events for that day
- [ ] `EventBlock` — absolutely positioned block showing title + time range
- [ ] `CurrentTimeLine` — red line/dot on today's column, updates every minute
- [ ] Scrollable body; auto-scroll to current hour on mount
- [ ] Responsive enough to be usable on a laptop screen

## 5. UI primitives (hand-written)

- [ ] `Modal` / `Dialog` — overlay, close on Esc / backdrop click, focus trap basics
- [ ] `ContextMenu` — positioned at cursor, closes on outside click / Esc / scroll
- [ ] Basic form inputs styled with Tailwind (text, textarea, `datetime-local`)

## 6. Feature: drag on empty space → create event (Req. 3)

- [ ] `useDragToCreate` hook using pointer events on `DayColumn`
- [ ] Snap start/end to 15-min slots; support dragging upward (swap start/end)
- [ ] Show a live "ghost" selection while dragging
- [ ] On release, open `EventFormDialog` pre-filled with selected start/end
- [ ] Save → add event; Cancel → discard selection
- [ ] Enforce minimum duration (e.g. 15 min)

## 7. Feature: drag & drop event → update time (Req. 4)

- [ ] `useDragToMove` hook on `EventBlock` (pointer capture)
- [ ] Distinguish click vs drag with movement threshold (~4px)
- [ ] Allow moving across day columns; preserve duration
- [ ] Snap to 15-min slots; clamp within the day / 7-day range
- [ ] Visual feedback while dragging (opacity / shadow, ghost position)
- [ ] On release, dispatch `move` with new start/end

## 8. Feature: left-click event → detail dialog (Req. 5)

- [ ] `EventDetailDialog` showing title, description, formatted start–end
- [ ] Open on click (not after a drag)
- [ ] Optional: Edit / Delete buttons inside the detail dialog too

## 9. Feature: right-click event → context menu (Req. 6)

- [ ] `preventDefault` on `onContextMenu`, open `ContextMenu` at cursor
- [ ] **Edit** → open `EventFormDialog` in edit mode, save updates the event
- [ ] **Delete** → remove event (optional confirm)
- [ ] Menu closes after action

## 10. Event form (create / edit) — Req. 1

- [ ] `EventFormDialog` with fields: title, description, start (`datetime-local`), end (`datetime-local`)
- [ ] Validation: title required, end > start, show inline error messages
- [ ] Reuse the same component for create and edit modes
- [ ] Submit on Enter, close on Esc

## 11. Polish

- [ ] Overlapping events render side-by-side (column packing) or at least remain clickable
- [ ] Hover states, cursor styles (`cursor-grab` / `cursor-grabbing`, `cursor-crosshair` on grid)
- [ ] Truncate long titles; show time range only if block is tall enough
- [ ] Accessibility basics: buttons are `<button>`, dialogs have `role="dialog"`, aria labels
- [ ] Empty-state / helper hint (e.g. "Drag on the calendar to create an event")
- [ ] Check for console warnings/errors, unused code

## 12. Testing (manual QA)

- [ ] Create an event by dragging (downwards and upwards)
- [ ] Move an event within the same day and to another day
- [ ] Click event → detail dialog opens; drag does **not** open it
- [ ] Right-click → Edit → changes saved
- [ ] Right-click → Delete → event removed
- [ ] Refresh page → events persist
- [ ] Current-time line is on the correct day/hour
- [ ] Test in Chrome + Firefox (+ Edge)
- [ ] `npm run build` succeeds with no TS errors

## 13. Documentation

- [ ] `README.md`: project description, features, tech stack, how to run, live demo URL
- [ ] Screenshot/GIF of the app in README
- [ ] Note the "no external libraries" constraint and how it was satisfied

## 14. Delivery

- [ ] Push source code to a **public GitHub repo**
- [ ] Deploy to Vercel / Netlify / GitHub Pages
- [ ] Verify the **public URL** works in an incognito window
- [ ] Add the public URL to `README.md` and the repo description
- [ ] Final review against `assignment.md` requirements 1–6
- [ ] Submit before the **5-day deadline**
