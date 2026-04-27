# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Warning: Bleeding-Edge Stack

This project uses **Next.js 16**, **React 19**, and **Tailwind CSS v4** — all versions with breaking changes relative to training data. Before writing any Next.js or Tailwind code, read the relevant guide in `node_modules/next/dist/docs/`. APIs, conventions, and file structure differ meaningfully from older versions.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build (also runs type-check)
npm run start    # Serve production build
npx tsc --noEmit # Type-check without building
```

There is no lint or test script configured.

## Architecture

**App Router layout** — `app/layout.tsx` renders a fixed `<Sidebar>` (width `w-56`, `ml-56` offset on `<main>`) and wraps all pages. The sidebar is `'use client'` because it uses `usePathname()` for active-link detection.

**Data layer** — All data lives in `frontend-sample-data.ts` at the project root (not inside `app/`). It is static TypeScript — no API calls, no server fetching. Pages import from `../../frontend-sample-data` or `../frontend-sample-data` depending on depth.

**Pages**
- `/` (`app/page.tsx`) — Server component. Metric cards + revenue line chart + activity feed.
- `/analytics` (`app/analytics/page.tsx`) — Server component. Stat cards, three charts, orders table.
- `/reports` (`app/reports/page.tsx`) — `'use client'`. Tab bar switches between daily/weekly/quarterly/annual datasets; each view shows KPI cards, a bar chart, and a data table.

**Chart components** (`app/components/`)
- `RevenueChart.tsx` — Recharts `LineChart` (revenue vs expenses, 12 months). Used on dashboard.
- `AnalyticsCharts.tsx` — Three exports: `WeeklyCustomersChart` (AreaChart), `MonthlyComparisonChart` (BarChart), `SalesByCategoryChart` (PieChart/donut). Used on analytics page.
- All chart files are `'use client'` because Recharts requires browser APIs.

**Styling**
- Tailwind CSS v4 — configured via `@import "tailwindcss"` in `globals.css`, no `tailwind.config.js` needed.
- Design tokens defined as CSS custom properties in `:root` (`globals.css`): `--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--text-muted`, `--accent`, `--accent-light`, `--shadow`.
- Color palette: warm cream background (`#f5f3ef`), near-black text (`#0f0e0e`), warm borders (`#e8e4dc`), dark sidebar (`#0c0b0b`).
- Most colors are inlined as Tailwind arbitrary values (e.g. `text-[#0f0e0e]`) rather than using CSS variables — this is intentional for per-element precision.
- Entry animations: `.nav-link` (navSlideIn) and `.metric-card` (cardFadeUp) are defined in `globals.css` and applied with `animationDelay` inline styles.

**Fonts** — Geist Sans and Geist Mono loaded via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-geist-sans` / `--font-geist-mono`.
