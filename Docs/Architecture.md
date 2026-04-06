# Food Tracker — Architecture & Technical Design

## Overview

Food Tracker is a full-stack TypeScript monorepo. A React single-page application communicates with a Node/Express REST API backed by MongoDB. Shared types and domain logic live in standalone packages consumed by both the API and the web app.

---

## Repository Layout

```
claude-food/
├── apps/
│   ├── api/          Express REST API
│   └── web/          React SPA (webpack)
├── packages/
│   ├── domain/       Entities, API shapes, nutrition calculation
│   └── shared/       Date formatting utilities
├── scripts/
│   └── seed-foods.ts Standalone DB seeding script
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

The workspace is managed by **pnpm**. `pnpm-workspace.yaml` declares `apps/*` and `packages/*` as workspace members. Inter-package references use the `workspace:*` protocol so they resolve to local source without publishing.

---

## Packages

### `@claude-food/domain`

Contains everything that describes the problem domain independent of persistence or presentation:

- **`entities.ts`** — Core TypeScript interfaces: `User`, `Food`, `Template`, `TemplateItem`, `LogEntry`.
- **`api.ts`** — Request and response shapes shared between the API and the web client (`CreateUserRequest`, `CreateFoodRequest`, `AddFromTemplateRequest`, etc.). Keeping these in one place prevents the server and client from drifting out of sync.
- **`derived.ts`** — View-model types derived at runtime (`EnrichedLogEntry`, `MealGroup`, `DailyTotals`, `TemplatePreviewRow`) and the `calcNutrition` function that converts a logged amount to calories/protein/fiber using proportional scaling.

The package has no runtime dependencies — it is pure TypeScript. Both `apps/api` and `apps/web` import from it directly via TypeScript path resolution (no build step required).

### `@claude-food/shared`

A thin utility package for date formatting (`formatDisplayDate`, `formatShortDate`). Centralising these prevents the web app and any future consumers from duplicating date-string logic.

---

## API (`apps/api`)

### Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express 5 |
| Database | MongoDB via Mongoose 9 |
| TypeScript execution | `tsx watch` in dev, compiled `tsc` output in production |
| Environment | `dotenv` loaded at startup |

### Startup

`src/index.ts` configures the Express app, registers routers, and calls `connectDb()` before starting the HTTP listener. The MongoDB URI and port are read from environment variables with sensible defaults (`mongodb://localhost:27017/claude-food`, port `3001`).

### Models

Mongoose models live in `src/models/`. Each model maps directly to a domain entity:

| Model | Collection | Notes |
|---|---|---|
| `UserModel` | `users` | `name` is unique |
| `FoodModel` | `foods` | Shared across all users |
| `TemplateModel` | `templates` | Scoped to a `userId` |
| `TemplateItemModel` | `templateitems` | References `templateId` and `foodId` |
| `LogEntryModel` | `logentries` | Scoped to `userId`; stores `date` as `YYYY-MM-DD` string |

### Routes

| File | Prefix | Endpoints |
|---|---|---|
| `routes/users.ts` | `/api/users` | `GET /` list, `POST /` create |
| `routes/foods.ts` | `/api/foods` | `GET /` list, `POST /` create, `PUT /:id` update, `DELETE /:id` delete |
| `routes/templates.ts` | `/api` | `GET /users/:userId/templates`, `POST /users/:userId/templates`, `PUT /templates/:id`, `DELETE /templates/:id` |
| `routes/logEntries.ts` | `/api` | `GET /users/:userId/log-entries?startDate=&endDate=`, `POST /users/:userId/log-entries`, `POST /users/:userId/log-entries/from-template`, `PUT /log-entries/:id`, `DELETE /log-entries/:id` |

A `GET /health` endpoint is registered directly on the app for liveness checks.

**Referential integrity** is enforced at the application layer: deleting a food is rejected with `409 Conflict` if any log entry or template item references it. Username uniqueness is also enforced at the application layer (checked before insert) in addition to the Mongoose schema.

**`POST /users/:userId/log-entries/from-template`** is a compound write: it fetches the template and all its items, then bulk-inserts one `LogEntry` per item with the amount scaled by the provided `multiplier`. The template name is snapshotted onto each entry (`templateNameSnapshot`) so historical entries remain readable even if the template is later renamed or deleted.

**`PUT /templates/:id`** replaces a template's items atomically: it deletes all existing `TemplateItem` documents for that template then bulk-inserts the new set in a single operation.

---

## Web App (`apps/web`)

### Stack

| Concern | Choice |
|---|---|
| Framework | React 19 |
| Bundler | Webpack 5 + ts-loader |
| UI library | MUI (Material UI) v7 + Emotion |
| State management | Redux Toolkit + React-Redux |
| Routing | React Router v7 |
| TypeScript execution | ts-loader (dev + prod) |

### Entry & Routing

`src/index.tsx` mounts the React app. `src/App.tsx` wraps everything in a `BrowserRouter` and declares five routes under the `AppShell` layout component:

| Path | Component | Purpose |
|---|---|---|
| `/today` | `TodayPage` | Log entries for the current date |
| `/log` | `LogPage` | Full filterable log table |
| `/templates` | `TemplatesPage` | Template management |
| `/foods` | `FoodsPage` | Food catalog management |
| `/history` | `HistoryPage` | Day-by-day history with drill-down |

`/` redirects to `/today`. A `GlobalModalHost` component is rendered outside the route tree so modals can be opened from any page without prop-drilling.

### AppShell

`AppShell` renders:
- A fixed **top bar** containing the app title, user selector dropdown, `+ New User` popover, and `+ Quick Add` button.
- A permanent left **drawer** (200 px wide) with navigation links.
- A main content area that renders the active route's page component as `children`.

### State Management

All server-derived state lives in Redux. The store is composed of five slices:

| Slice | State | Async thunks |
|---|---|---|
| `usersSlice` | `users[]`, `selectedUserId` | `fetchUsers`, `createUser` |
| `foodsSlice` | `foods[]` | `fetchFoods`, `createFood`, `updateFood`, `deleteFood` |
| `logEntriesSlice` | `entries[]` | `fetchLogEntries`, `createLogEntry`, `addFromTemplate`, `updateLogEntry`, `deleteLogEntry` |
| `templatesSlice` | `templates[]` (with items inline) | `fetchTemplates`, `createTemplate`, `updateTemplate`, `deleteTemplate` |
| `uiSlice` | `selectedUserId`, `todayDate`, `modal` | — |

All async thunks are created with `createAsyncThunk` and call `src/api/client.ts`, which is a thin fetch wrapper that sets the base URL and `Content-Type` header.

### Selectors

`src/store/selectors.ts` centralises all derived reads from the Redux state. Complex selectors (e.g., `selectEnrichedEntries`, `selectMealGroupsForDate`, `selectDailyTotals`, `selectTotalsForDate`) join log entries with the food catalog in memory and compute nutrition totals using `calcNutrition` from `@claude-food/domain`. This keeps pages and components free of raw data transformation logic.

### Pages

Pages are thin: they read from the store via selectors, dispatch actions, and delegate rendering to components and MUI primitives. No page fetches data directly — all data loading is triggered by Redux thunks dispatched from `App.tsx` on mount and from `AppShell` when the selected user changes.

### Modals

The four application modals (`AddLogEntryModal`, `EditLogEntryModal`, `AddFromTemplateModal`, `FoodModal`) are managed via `uiSlice`. Any component can call `dispatch(openModal({ type, ...payload }))`. `GlobalModalHost` reads the current modal state and renders the appropriate dialog. This avoids passing open/close callbacks through the component tree.

### Theming

`src/theme.ts` configures the MUI theme (palette, typography scale, component defaults). The sidebar uses a hardcoded dark background (`#1E293B`) while the main content area uses the theme's `background.default`.

---

## Data Flow

```
User action (click / form submit)
        │
        ▼
Page or component dispatches a Redux action or thunk
        │
        ▼ (if thunk)
api/client.ts  ──────── HTTP ────────▶  Express route handler
                                               │
                                               ▼
                                        Mongoose model
                                               │
                                               ▼
                                           MongoDB
                                               │
                                        ◀─ response ─
        │
        ▼
Redux store updated via slice reducer
        │
        ▼
Selectors recompute derived state
        │
        ▼
React re-renders affected components
```

---

## Nutrition Calculation

`calcNutrition` in `@claude-food/domain` applies a single formula:

```
factor = actualAmount / unitQuantity
calories = factor × caloriesPerUnit
protein  = factor × proteinPerUnit
fiber    = factor × fiberPerUnit
```

Results are rounded to one decimal place. This function is used in:
- `selectEnrichedEntries` and related selectors (web, read path)
- `TemplatesPage` (live preview of template totals while editing)
- The `from-template` API route (to log amounts pre-scaled by a multiplier)

---

## Key Design Decisions

**Shared domain package.** Putting entity and request/response types in `@claude-food/domain` means the API and web client always agree on shapes. A type error at the boundary surfaces at build time, not runtime.

**Flat log entries.** `LogEntry` records are independent rows with a `foodId` foreign key, rather than embedded documents. This makes filtering, editing, and deleting individual entries straightforward without array mutation in MongoDB.

**Template name snapshot.** When log entries are created from a template, the template's name is copied into `templateNameSnapshot` on each entry. Historical log entries therefore remain accurate if the template is renamed or deleted later.

**In-memory joins.** The web app loads the full food catalog once on startup and keeps it in Redux. Log entries store only `foodId`; selectors join entries to foods in memory. This avoids per-request lookups and keeps the API simple, at the cost of holding the food catalog in browser memory (acceptable for a personal-scale app).

**No optimistic updates.** All mutations wait for the server response before updating the store. Redux Toolkit's `createAsyncThunk` handles the pending/fulfilled/rejected lifecycle, and slices update state only in the `fulfilled` case.
