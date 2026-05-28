# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

React 19 + TypeScript + Vite 8 admin dashboard for a **Continew** backend system. Chinese-language UI. Uses **shadcn/ui** (radix-nova style) with Tailwind CSS v4 and Radix UI primitives.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then production build |
| `npm run lint` | Run ESLint on all files |
| `npm run preview` | Serve production build locally |

No test framework is configured.

## Architecture

### Routing — Dynamic, Backend-Driven

Routes are defined in `src/app/router.tsx` and split into two categories:

- **Static routes**: login, error pages, dashboards — eagerly imported.
- **Dynamic routes**: fetched from `/auth/user/route` API at runtime. View modules are resolved via `import.meta.glob('../views/**/*.tsx')` and lazy-loaded with `React.lazy` + `Suspense`.

`src/app/auth-guard.tsx` gates all routes: redirects to `/login` if no token, otherwise fetches user info and route config before rendering.

### State Management — Zustand v5 + localStorage

Six stores in `src/stores/`, all using `persist` middleware with `continew-` localStorage prefix:

| Store | Responsibility |
|-------|---------------|
| `app.ts` | UI prefs: layout mode, theme, menu collapse, tabs, animation, theme color |
| `user.ts` | Auth state: token, userInfo, roles, permissions, routes; login/logout actions |
| `route.ts` | Dynamic route data from backend + flattened lookup map |
| `tabs.ts` | Tab bar open/close/affix management |
| `dict.ts` | Dictionary/enum data cache (fetched on demand) |
| `tenant.ts` | Multi-tenant state (tenantId, enabled, code) |

### API Layer

- `src/apis/http.ts` — Axios client with Bearer token auth, tenant ID header, 401 redirect, error toasts.
- `src/apis/<domain>/` — Feature-specific modules (e.g., `system/user.ts`, `monitor/log.ts`).
- All requests typed with generics: `get<T>`, `post<T>` returning `ApiRes<T>`.

### Key Hooks

- `use-crud.ts` — Generic CRUD operations (list, search, paginate, delete, export). Used by all list pages.
- `use-permission.ts` — Permission checking (`has`, `hasAny`, `hasAll`), supports `*` wildcard.
- `use-dict.ts` — Dictionary data fetching with store-based caching.
- `use-menu.ts` — Menu tree fetching for system/tenant menus.

### Layout System

Four runtime-switchable layouts in `src/layouts/`: `default` (sidebar+header), `mix`, `columns`, `top`. Selected via `useAppStore((s) => s.layout)`.

### Component Layers

- `src/components/ui/` — shadcn/ui primitives (Radix-based, Tailwind-styled). Managed by `shadcn` CLI.
- `src/components/` — Shared business components: `data-table.tsx` (TanStack Table), `crud-form.tsx`, `chart.tsx`, `checkbox-tree.tsx`, `cron-builder/`, `json-viewer/`, `user-select/`, `verify/`.
- `src/views/` — Page components organized by domain (system, monitor, tenant, schedule, etc.).

## Path Aliases

`@/` maps to `src/` — configured in both `vite.config.ts` and `tsconfig.json`.

## Environment Variables

Defined in `.env`: `VITE_API_BASE_URL`, `VITE_API_PREFIX`, `VITE_CLIENT_ID`. All prefixed with `VITE_` to be exposed to client code.

## Conventions

- UI strings are all in **Chinese** — do not introduce English UI text unless instructed.
- shadcn/ui components are added via `npx shadcn@latest add <component>`. Do not manually create files in `src/components/ui/`.
- Theme uses Tailwind CSS v4 with CSS variables (defined in `src/index.css`). The `cn()` utility from `src/lib/utils.ts` merges Tailwind classes.
