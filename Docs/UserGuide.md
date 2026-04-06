# Food Tracker — User Guide

Food Tracker is a personal nutrition logging app. It lets you record what you eat each day, track calories, protein, and fiber, and build reusable meal templates to speed up logging.

---

## Prerequisites

- **Node.js** 18 or later
- **pnpm** (install with `npm install -g pnpm`)
- **MongoDB** running locally on the default port (`27017`), or a connection URI to a remote instance

---

## Launching the App

### 1. Install dependencies

From the project root:

```
pnpm install
```

### 2. Configure the API (optional)

The API reads two environment variables. Create a `.env` file inside `apps/api/` if you need to override the defaults:

```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/claude-food
```

Both values shown above are the defaults — you only need the file if you want to change them.

### 3. Start both servers

```
pnpm dev
```

This starts the API server and the web dev server in parallel. Once both are running:

- **Web app:** http://localhost:3000
- **API:** http://localhost:3001

Open the web app URL in your browser to begin using Food Tracker.

---

## npm / pnpm Script Reference

All commands below are run from the **project root** unless otherwise noted.

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in development mode (API + web, in parallel with live reload) |
| `pnpm build` | Production build — compiles shared packages first, then both apps |
| `pnpm typecheck` | Run TypeScript type-checking across every package and app without emitting files |

### App-specific scripts

Run these from within `apps/api/` or `apps/web/`:

| Directory | Command | Description |
|---|---|---|
| `apps/api` | `pnpm dev` | Start the API with `tsx watch` (restarts on file changes) |
| `apps/api` | `pnpm build` | Compile the API to `dist/` |
| `apps/api` | `pnpm start` | Run the compiled API (`node dist/index.js`) — use after `build` |
| `apps/api` | `pnpm typecheck` | Type-check the API without emitting output |
| `apps/web` | `pnpm dev` | Start the webpack dev server with hot reload |
| `apps/web` | `pnpm build` | Bundle the web app for production into `apps/web/dist/` |
| `apps/web` | `pnpm typecheck` | Type-check the web app without emitting output |

### Seed script

To populate the food database with a curated set of common foods (proteins, dairy, produce, grains, snacks, etc.), make sure the API is running and then execute:

```
npx tsx scripts/seed-foods.ts
```

The script posts each food to the API and prints a line per item. Foods that fail to insert (e.g., duplicates) are reported but do not stop the script.

---

## First-Time Setup

1. Launch the app with `pnpm dev`.
2. Open http://localhost:8080.
3. Click **+ New User** in the top bar, enter a username, and press Enter or click **Create**. The new user is automatically selected.
4. (Optional) Run the seed script to pre-populate the food database.

---

## Using the App

### Top Bar

The top bar is always visible and contains:

- **User selector** — switch between users. Changing the selected user reloads the log and templates for that user.
- **+ New User** — opens a popover to create a new user. Duplicate names are rejected with an error message.
- **+ Quick Add** — opens the Add Food Entry dialog pre-filled to today's date. Only enabled when a user is selected.

### Sidebar Navigation

The left sidebar links to the five main sections of the app.

---

### Today

Shows everything logged for the current date.

- **Nutrition summary cards** at the top display total calories, protein, and fiber for the day.
- Below the summary, food entries are grouped by meal (Breakfast, Lunch, etc.).
- Each meal section shows a per-meal nutrition subtotal and a list of individual entries with their amounts and calculated nutrition.
- **+ Add Food** opens the Add Food Entry dialog pre-filled to today.
- **⊞ Add from Template** opens the Add from Template dialog pre-filled to today.
- Within a meal section, **+ Add** opens the dialog pre-filled to that specific meal.

---

### Log

A full searchable and filterable table of all log entries for the selected user.

**Filters:**
- **Date** — filter to a specific day
- **Meal** — filter by meal name (populated from actual entries)
- **Search** — text search across food name and template name
- **Clear filters** — resets all three filters at once

Each row shows the date, meal, template (if any), food name, amount, calories, protein, and fiber. Rows have **edit** (pencil) and **delete** (trash) icon buttons on the right.

**+ Add Food Entry** and **⊞ Add from Template** buttons at the top right work the same as on the Today page but without a pre-filled date.

---

### Templates

Templates are saved lists of foods with default amounts — useful for meals you eat regularly (e.g., a standard breakfast). Templates belong to the selected user.

**Left panel — template list:**
- Search box filters the list by name.
- Click any template to open it in the editor.
- **+ New** creates a blank template named "Untitled Template".

**Right panel — template editor:**
- Edit the template name at the top.
- The items table lists each food in the template with its default amount and calculated nutrition.
- **+ Add Food to Template** appends a new blank row; choose a food from the dropdown and enter a default amount.
- The delete icon on each row removes that item.
- Nutrition totals (calories, protein, fiber) for all items are shown below the table.
- **Save** commits changes (only enabled when there are unsaved changes).
- **Log This Template** opens the Add from Template dialog for this template.
- **Delete** permanently deletes the template and all its items.

---

### Foods

The food database — a shared catalog of foods with their nutritional information per unit. All users share the same food catalog.

- **Search** filters the list by food name.
- **Sort** dropdown changes the sort column (name, calories, protein, or fiber). Clicking the same column again reverses the direction.
- **+ New Food** opens a dialog to add a new food entry.
- Each row has **edit** and **delete** icon buttons. A food cannot be deleted if it is referenced by any log entry or template.

**Food fields:**
- **Name** — display name
- **Unit Quantity** — the reference serving size (e.g., `100`)
- **Unit Type** — the unit of measurement (e.g., `grams`, `milliliters`, `piece`)
- **Cal / unit** — calories for the unit quantity
- **Protein / unit** — protein in grams for the unit quantity
- **Fiber / unit** — fiber in grams for the unit quantity

Nutrition for any logged amount is calculated proportionally: `(actual amount / unit quantity) × per-unit value`.

---

### History

A day-by-day nutrition summary for the selected user.

**Left panel:** A table of all dates that have log entries, showing daily calorie, protein, and fiber totals. Click a row to select that day.

**Right panel:** The meal-by-meal breakdown for the selected date, with the same meal section layout as the Today page. You can add, edit, and delete entries for past dates from this view.

The **Last 7 Days**, **Last 30 Days**, and **This Month** buttons in the header are placeholders for future filtering functionality.

---

## Dialogs

### Add Food Entry

Fields: date, meal (free text), food (dropdown), and amount. Nutrition for the entered amount is previewed live.

### Add from Template

Choose a template, a date, a meal name, and an optional multiplier (e.g., `0.5` for half portions). A preview table shows the calculated amounts and nutrition for every item. Submitting creates one log entry per template item.

### Edit Log Entry

Same fields as Add Food Entry, pre-filled with the existing values.

### Add / Edit Food

Form for all food fields (name, unit quantity, unit type, and the three per-unit nutrition values).
