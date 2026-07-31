# HydrateMe (page schema)

**HydrateMe** is the page-schema slice for a hydration reminder product: goals, quick logging, optional “circle” nudges, and stats. This README is for engineers and agents working in this repo.

## Product (short)

- **Core loop:** set a daily goal → log water in one tap → see progress and streaks.
- **Differentiator (roadmap):** social “Hydrate Circle” — gentle reminders between people (`hydrateMeSendHydrationReminder` records pings; push can be wired later).
- **UX principle:** low friction (quick add on home + full **DynamicPage** logbook for edit/filter/export).

## URLs and page keys

| Page key           | Path                 | What it does |
|--------------------|----------------------|----------------|
| `HydrateMeHome`    | `/hydrateme`         | Marketing + dashboard (`hydrateMeGetDashboard`), +250/+500 ml (`hydrateMeLogWater`), recent rows, embedded `DynamicPage` for `HydrateMeWaterLog` (signed-in only). |
| `HydrateMeLogbook` | `/hydrateme/logs`   | Full water log **DynamicPage**. |
| `HydrateMeCircle`  | `/hydrateme/circle` | Circle members **DynamicPage** (`HydrateMeCircleMember`). |
| `HydrateMeProfile` | `/hydrateme/profile`| Profile **DynamicPage** (`HydrateMeUserProfile`), one logical row (`profileKey` default). |
| `HydrateMeStats`   | `/hydrateme/stats`  | Last 7 days chart from `hydrateMeGetWeeklyStats`. |

All app routes use **`HydrateMeLayout`** (`components/layout/HydrateMeLayout.hjson`): `ConfirmProvider`, sticky nav, `Slot` with `slot: "1children"` for page body.

Pages expose **`executeYTOFunction`** on the `Page` vertex `fns`, implemented as `_.executeNamedServerFunction({ functionName, contextData })`, so **DynamicPage** can call `getUserContent` / `mutateUserContent` etc. under `hydrateme/functions/dynamic_page/main_functions/`.

## Theme

- `themes/HydrateMeTheme.hjson` — key **`HydrateMeTheme`** (teal-forward palette + spacing/font tokens). Assign per subdomain in your normal theme admin if this site should use it.

## Graph model (Neo4j)

User-scoped content follows the same pattern as other DynamicPage sites:

- Relationship type **`User${VertexLabel}`** (e.g. `UserHydrateMeWaterLog`).
- **Vertices (labels):**
  - **`HydrateMeWaterLog`** — `amountMl`, `loggedAt` (ISO string), `loggedDate` (`YYYY-MM-DD`), `note`, `source` (`quick` | `manual`), `createdAt`, etc.
  - **`HydrateMeCircleMember`** — `displayName`, `friendEmail`, `friendUserUuid`, `status`, `notes`, `lastRemindedAt`, …
  - **`HydrateMeUserProfile`** — `profileKey` (default `default`), `displayName`, `weightKg`, `dailyGoalMl`, `reminderIntervalMinutes`, …
  - **`HydrateMeHydrationPing`** — created by `hydrateMeSendHydrationReminder`; edges `UserHydrateMeHydrationPing`, `PingCircleMember` (to a circle member).

Do **not** flatten vertices in new code: keep **`vertex.P.*`** and raw vertex shape end-to-end (repo convention).

## Server functions (named)

Under `functions/dynamic_page/main_functions/hydrate/`:

| Key | Purpose |
|-----|---------|
| `hydrateMeGetDashboard` | Today’s total ml, goal, streak, profile vertex, recent log vertices. |
| `hydrateMeLogWater` | Quick create `HydrateMeWaterLog` + `UserHydrateMeWaterLog` edge. |
| `hydrateMeGetWeeklyStats` | `contextData.days` (default 7); returns `series` + `goalMl`. |
| `hydrateMeSendHydrationReminder` | `contextData.circleMemberElementId` (+ optional `message`); updates member, creates ping. |
| `hydrateMeWaterLogNormalize` | **Hook** after create/update on water log: fills `loggedDate` / `loggedAt` if missing. |

**Migration** (seeds `Setting` `table_config` rows used by DynamicPage):

- `functions/dynamic_page/main_functions/migration/migrateDynamicPageSettings.hjson` — key **`migrateDynamicPageSettings`**.  
- Call via `executeNamedServerFunction({ functionName: 'migrateDynamicPageSettings', contextData: { dryRun?: boolean } })` once per environment.

## DynamicPage stack (shared)

- Component copies live under `components/dynamic_page/`, `components/table/`, `components/forms/`, `components/ui/` (same patterns as `workshopflow` / `decodeproduct`).
- Server function copies under `functions/dynamic_page/main_functions/` (`getUserContent`, `mutateUserContent`, sidebar/settings, etc.).
- Deeper explanation of DynamicPage + table + sidebar: `components/dynamic_page/README.md` (generic; paths there refer to the generic layout — this site’s copies live under `hydrateme/`).

## Conventions for new HydrateMe tables

1. Add a **`${Label}_settings_default`** row via migration (or admin) with `enableUserScopingForContent: true` in the evaluated config.
2. Ensure **`User${Label}`** edges are created on mutate (handled by shared `mutateUserContent` when scoping is on).
3. Add a page with `DynamicPage` + `tableVertexLabel` + `loadFromSetting: true` if the table should read settings from the DB.

## Related repo docs

- Page/Attr/function authoring rules: `src/routes/api/chat/SYSTEM_PROMPT.md`
- Server `_` surface: `src/cypher/get/executeNamedServerFunctionCore.ts`
- App-wide schema notes: `CLAUDE.md`
