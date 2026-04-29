# Traclock — Timer Todo List Implementation Plan

> **For agentic workers:** Start with [Phase 1](phase-1-foundation.md) and work through each phase in order. Each phase file contains the full task steps.

**Goal:** Build a multi-list timed-todo app where each item has a countdown timer, sequential playback with audio alerts, and full CRUD + reordering of items.

**Architecture:** Single-page React app with client-side routing (React Router v6). All state persisted to localStorage via Zustand `persist` middleware — no backend required. Sounds generated with the Web Audio API (no audio files needed).

**Tech Stack:** React 18, TypeScript (strict), Vite, Tailwind CSS v3, Zustand, React Hook Form, Zod, `@hookform/resolvers`, React Router v6, `clsx`, `tailwind-merge`, Vitest, React Testing Library, `@testing-library/jest-dom`

---

## File Structure

```
traclock/
├── src/
│   ├── types/
│   │   └── index.ts                    ← TodoItem, TodoList interfaces
│   ├── schemas/
│   │   └── index.ts                    ← Zod schemas + inferred form types
│   ├── utils/
│   │   ├── cn.ts                       ← clsx + tailwind-merge helper
│   │   ├── time.ts                     ← formatTime, toSeconds, fromSeconds
│   │   ├── time.test.ts
│   │   └── sound.ts                    ← Web Audio API: warning / next / complete
│   ├── stores/
│   │   └── listsStore.ts               ← Zustand store with persist
│   ├── features/
│   │   └── todo/
│   │       ├── components/
│   │       │   ├── EditMode/
│   │       │   │   ├── EditMode.tsx
│   │       │   │   ├── EditMode.test.tsx
│   │       │   │   └── index.ts
│   │       │   └── ViewMode/
│   │       │       ├── ViewMode.tsx
│   │       │       ├── ViewMode.test.tsx
│   │       │       └── index.ts
│   │       └── hooks/
│   │           ├── useTimer.ts
│   │           └── useTimer.test.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── HomePage.test.tsx
│   │   ├── ListDetailPage.tsx
│   │   └── ListDetailPage.test.tsx
│   ├── test-setup.ts
│   ├── App.tsx
│   └── main.tsx
├── e2e/
│   ├── lists.spec.ts               ← home page: create/delete lists
│   ├── edit-mode.spec.ts           ← item add/edit/delete/reorder
│   └── timer.spec.ts               ← start/go-next/warning/complete flow
├── index.html
├── playwright.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## [Phase 1 — Foundation](phase-1-foundation.md)
> Deliverable: runnable app with navigation, no UI yet.
> Tasks: Project scaffold + GitHub setup, Types/schemas/utils, Zustand store, App shell & routing.

---

## [Phase 2 — List Management](phase-2-list-management.md)
> Deliverable: full CRUD for lists and items, no timer.
> Tasks: Home page, Edit mode.

---

## [Phase 3 — Timer Feature](phase-3-timer-feature.md)
> Deliverable: complete working app with countdown, audio cues, and view/edit wiring.
> Tasks: useTimer hook, ViewMode, ListDetailPage.

---

## [Phase 4 — Quality & Release](phase-4-quality-release.md)
> Deliverable: tested, deployable project pushed to GitHub.
> Tasks: Build verification, Playwright E2E tests.
