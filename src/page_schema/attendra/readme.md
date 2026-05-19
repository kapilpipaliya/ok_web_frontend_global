# Attendra — Shopify staff attendance

Shopify Admin embedded app: employees, roles, attendance logs, files, settings, and a dashboard.  
Staff sign-in for the shop database uses the app portal path (see **Dashboard → Portal Url**).

## App subdomain & code

- **Subdomain**: `attendra.decodecommerce.com`
- **Schemas**: `src/page_schema/attendra/`

## Admin routes (iframe)

| Page | URL | Schema file |
|------|-----|-------------|
| Dashboard | `/app` | `pages/shopify/admin/AttendraDashboard.hjson` |
| Employees | `/employees` | `AttendraEmployees.hjson` — `User` + `AttendraEmployee` settings |
| Roles | `/roles` | `AttendraRoles.hjson` — `Role` + `AttendraRole` settings |
| Attendance logs | `/attendance-logs` | `AttendraAttendanceLogs.hjson` |
| Files | `/files` | `AttendraFiles.hjson` — graph `File` + `AttendraFile` settings (folder sidebar) |
| Settings | `/settings` | `AttendraSettings.hjson` |
| Support | `/support` | `ShopifySupport.hjson` |

## Staff portal (signed-in subdomain user)

| Page | URL | Schema file |
|------|-----|-------------|
| Check in | `/portal/check-in` | `pages/portal/AttendraPortalCheckIn.hjson` |
| My attendance logs | `/portal/attendance-logs` | `pages/portal/AttendraPortalAttendanceLogs.hjson` |
| My files | `/portal/files` | `pages/portal/AttendraPortalFiles.hjson` |
| Profile | `/portal/profile` | `pages/portal/AttendraPortalProfile.hjson` |
| Change password | `/portal/password` | `pages/portal/AttendraPortalPassword.hjson` |
| Company branding (admin) | `/portal/company-branding` | `pages/portal/AttendraPortalCompanyBranding.hjson` |

Layout: **`PortalLayout`** (`components/portal/PortalLayout.hjson`) wraps **`PortalNavigation`** (`components/portal/PortalNavigation.hjson`) — sidebar nav is built from a data array (staff links for everyone; **Admin** section including **Company branding** only when the user has the Admin role). Account menu: **My files**, **Profile**, **Change password**, **Log out** (`/auth/logout`).

## Data model (Neo4j)

- **`User`** — employees (`AttendraEmployee` table config). Hooks strip transient shop/invite fields from responses after save.
- **`Role`** — role keys; **`User`-[:`UserRole`]->`Role`**
- **`AttendraAttendanceLog`** — linked with **`AttendraAttendanceLogEmployee`** → **`User`**
- **`AttendraSetting`** — `key: "default"` (timezone, thresholds, etc.)
- **`File`** / **`Folder`** — app file manager graph (`ParentFolder` from file to folder); ownership is **`User`-[:`UserFile`]->`File`** (not a property on `File`). `/api/file/upload` links the session user when present.

## Server functions

- **`migrateAttendraSettings`** — seeds `Setting` rows (`AttendraEmployee_settings_default`, `AttendraRole_settings_default`, `AttendraAttendanceLog_settings_default`, `AttendraFile_settings_default`, `AttendraFilePortal_settings_default`, `AttendraSetting_settings_default`, …) and backfills **`UserAttendraAttendanceLog`** from **`AttendraAttendanceLogEmployee`**
- **`attendraGetDashboard`** — KPIs + activity (includes portal sign-in URL hints when configured)
- **`attendraEmployeeAfterCreate`** / **`attendraEmployeeAfterUpdate`** — shop DB cleanup + invitation email on create
- **`attendraPortalGetMyAttendance`** — portal check-in page only: open shift detection (same session user)
- **`attendraPortalAttendanceLogsAfterFetch`** — `getUserContent` hook for portal DynamicPage: restricts rows to the session employee
- Portal **My files** uses `enableUserScopingForContent: true` on the File table so rows are scoped by **`UserFile`** (no `P.uploader`)
- **`attendraPortalClockToggle`** — portal: clock in (create open log + `UserAttendraAttendanceLog`) or clock out (close latest open log) for session user

## Dev

```bash
npm run dev
```

After schema changes, run **`migrateAttendraSettings`** against the target environment.
