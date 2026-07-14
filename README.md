# Aurora — AI To-Do (Frontend MVP)

An AI-powered productivity app built with **React + TypeScript + Vite + Tailwind CSS**.
Ships as a static PWA — deploy to Netlify in one click. Backend + real AI plug in later
without touching UI code.

## Features shipped in this build

- **Auth (stubbed)**: register, login, logout, forgot password, email verification, profile page, Google login stub.
- **Tasks**: title, description, due date, priority, category, tags, status, notes, attachments, recurring, reminder, subtasks, estimated/actual time.
- **AI (stubbed, provider-agnostic)**: natural-language quick-add ("Tomorrow 5pm call John and buy milk"), prioritization, breakdown, suggestions, summary, daily/weekly planner.
- **Dashboard**: totals, completion rate, productivity score, weekly line chart, priority pie chart, AI suggestions.
- **Calendar**: day/week/month views with drag-and-resize (FullCalendar).
- **Kanban** (Todo / In Progress / Review / Completed) with drag-and-drop (dnd-kit).
- **Habits**: daily/weekly/monthly, 14-day heatmap, streak counter.
- **Focus / Pomodoro**: 25/5, 50/10, custom; XP + focus session log.
- **Analytics**: bar / line / pie across day/week/month scopes.
- **Search + Filters**: today/tomorrow/week/month/completed/pending/overdue/high-priority.
- **Themes**: light, dark, AMOLED, system + custom accent colors (persisted).
- **Voice input**: Web Speech API for quick-add.
- **OCR**: image upload hook (stubbed — wire Tesseract.js or serverless OCR).
- **Gamification**: XP, levels, achievements.
- **Offline / PWA**: service worker + IndexedDB kv/outbox; installable manifest.
- **Performance**: lazy routes, memoized selectors, code splitting.
- **Netlify-ready**: `netlify.toml`, `_redirects` for SPA routing.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview
```

## Deploy to Netlify

1. Push this folder to GitHub.
2. In Netlify → **Add new site → Import from GitHub** → select the repo.
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. That's it. `/_redirects` handles SPA client-side routing.

## Wiring a real backend later

The frontend is decoupled. To connect:

- **Auth** — replace stubs in `src/stores/auth.ts` with calls to your API (JWT).
- **Tasks** — swap the Zustand persistence layer with `fetch`/Socket.IO in `src/stores/tasks.ts`.
- **AI** — the `AIProvider` interface lives in `src/ai/index.ts`. Add an `openaiProvider` or
  `geminiProvider` and export it as `ai`. Suggested backend: Node/Express + Prisma + PostgreSQL,
  hosted on Render/Railway/Fly, called from the frontend via `VITE_API_URL`.

## Folder structure

```
src/
  ai/            AI provider interface + local stub
  components/    Reusable UI (Sidebar, Topbar, QuickAdd, TaskItem, FilterBar)
  db/            IndexedDB helper (offline)
  hooks/         useTheme, useAuth, useOnline, useNotifications
  layouts/       AppLayout, AuthLayout, RequireAuth guard
  lib/           Utilities (cn, uid, date fmt, etc.)
  pages/         Route pages (Dashboard, Tasks, Calendar, Kanban, Focus, Habits, Analytics, Profile, Login, Register, Forgot, Verify)
  stores/        Zustand stores (auth, tasks, habits, focus, ui, gamification)
  types/         Shared TypeScript types
public/
  sw.js                Service worker
  manifest.webmanifest PWA manifest
  _redirects           Netlify SPA fallback
netlify.toml           Netlify build config
```
