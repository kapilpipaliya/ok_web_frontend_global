# Attendra — Shopify staff time tracking

Shopify Admin embedded app: employees, roles, time logs, files, settings, and a dashboard.  
Staff sign-in for the shop database uses the app portal path (see **Dashboard → Portal Url**).

## App subdomain & code

- **Subdomain**: `attendra.decodecommerce.com`
- **Schemas**: `src/page_schema/attendra/`

## Admin routes (iframe)

| Page | URL | Schema file |
|------|-----|-------------|
| Dashboard | `/app` | `pages/shopify/admin/Dashboard.hjson` |
| Employees | `/employees` | `Employees.hjson` — `User` + `Employee` settings |
| Roles | `/roles` | `Roles.hjson` — `Role` settings |
| Tasks | `/tasks` | `Tasks.hjson` — `Task` + sidebar task lists (`todo` / `doing` / `blocked` / `done`) |
| Time logs | `/time-logs` | `TimeLogs.hjson` |
| Files | `/files` | `Files.hjson` — graph `File` settings (folder sidebar) |
| Settings | `/settings` | `Settings.hjson` |
| Support | `/support` | `ShopifySupport.hjson` |

## Staff portal (signed-in subdomain user)

| Page | URL | Schema file |
|------|-----|-------------|
| Check in | `/portal/check-in` | `pages/portal/PortalCheckIn.hjson` |
| My Time Logs | `/portal/time-logs` | `pages/portal/PortalTimeLogs.hjson` |
| My tasks | `/portal/tasks` | `pages/portal/PortalTasks.hjson` — assigned tasks only (`TaskPortal` settings) |
| My files | `/portal/files` | `pages/portal/PortalFiles.hjson` |
| Profile | `/portal/profile` | `pages/portal/PortalProfile.hjson` |
| Change password | `/portal/password` | `pages/portal/PortalPassword.hjson` |
| Company branding (admin) | `/portal/company-branding` | `pages/portal/PortalCompanyBranding.hjson` |

Layout: **`PortalLayout`** (`components/portal/PortalLayout.hjson`) wraps **`PortalNavigation`** (`components/portal/PortalNavigation.hjson`) — sidebar nav: **Check in**, **My Time Logs**, **My tasks**; **Admin** section (e.g. **Company branding**) only for Admin role. Account menu: **My files**, **Profile**, **Change password**, **Log out** (`/auth/logout`).

## Data model (Neo4j)

- **`User`** — employees (`Employee` table config), organized in sidebar **`EmployeeCategory`** groups (`EmployeeCategoryUser`). Hooks strip transient shop/invite fields from responses after save.
- **`Role`** — role keys; **`User`-[:`UserRole`]->`Role`**
- **`Time`** — linked with **`TimeEmployee`** → **`User`**
- **`Task`** — status (`todo`, `doing`, `blocked`, `done`), priority, due dates, assignee via **`TaskAssignee`** → **`User`**, optional comments (`TaskComment`), organized in sidebar **`TaskCategory`** lists
- **`Setting`** — `key: "default"` (timezone, thresholds, etc.)
- **`File`** / **`Folder`** — app file manager graph (`ParentFolder` from file to folder); ownership is **`User`-[:`UserFile`]->`File`** (not a property on `File`). `/api/file/upload` links the session user when present.

## Server functions

- **`migrateDynamicPageSettings`** — seeds `Setting` rows (`Employee_settings_default`, `Role_settings_default`, `Task_settings_default`, `TaskPortal_settings_default`, `Time_settings_default`, `File_settings_default`, `FilePortal_settings_default`, `Setting_settings_default`, …) and backfills **`UserTime`** from **`TimeEmployee`**
- **`functions/jobs/queueTaskReminder`** — enqueues task reminder jobs on `reminders`
- **`functions/jobs/processRemindersQueue`** — background worker (`process*` key) consuming `reminders`
- **`getDashboard`** — KPIs + activity (includes portal sign-in URL hints when configured)
- **`employeeAfterCreate`** / **`employeeAfterUpdate`** — shop DB cleanup + invitation email on create
- **`portalGetMyTime`** — portal check-in page only: open shift detection (same session user)
- **`portalTimeLogsBeforeFetch`** — portal My time logs: Cypher filter via `TimeEmployee`
- **`portalTasksBeforeFetch`** — portal My tasks: Cypher filter via `TaskAssignee`
- Portal **My files** uses `enableUserScopingForContent: true` on the File table so rows are scoped by **`UserFile`** (no `P.uploader`)
- **`portalClockToggle`** — portal: clock in (create open time record + `UserTime`) or clock out (close latest open time record) for session user

## Dev

```bash
npm run dev
```

After schema changes, run **`migrateDynamicPageSettings`** against the target environment.
