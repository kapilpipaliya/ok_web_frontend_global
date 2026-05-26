## DynamicPage + Table + Sidebar

This document explains how the **DynamicPage** system works and how to configure it for a new content type (e.g. `book`, `audioVideo`, `category`).

The implementation is split into:

- Components:
  - `DynamicPage.hjson` (this folder)
  - `../table/Table.hjson`
  - `Sidebar.hjson`, `SidebarTreeItem.hjson`, `SidebarAddChildModal.hjson`
- Server functions:
  - `functions/dynamic_page/main_functions/content/getUserContent.hjson`
  - `functions/dynamic_page/main_functions/content/mutateUserContent.hjson`
  - `functions/dynamic_page/main_functions/settings/config/getUserContentSetting.hjson`
  - `functions/dynamic_page/main_functions/settings/config/saveUserContentSetting.hjson`
  - `functions/dynamic_page/main_functions/sidebar/getVertexChildren.hjson`
  - `functions/dynamic_page/main_functions/sidebar/saveSidebarVertex.hjson`
  - `functions/dynamic_page/main_functions/migration/migrateDynamicPageSettings.hjson` (Attendra defaults)

---

### 1. High-level flow

1. A page HJSON uses `DynamicPage`:

```hjson
{
  vertexes: [
    {
      id: "page_root",
      L: "Page",
      P: { key: "MyPage", url: "/MyPage", title: "My Page" }
    },
    {
      id: "dynamic_page_attr",
      L: "Attr",
      P: {
        displayOrder: 1,
        componentName: "DynamicPage",
        props: '''
return {
  tableVertexLabel: "MyType",
  loadFromSetting: true
};
'''
      }
    }
  ],
  edges: [
    { id: "e1", T: "Attr", S: "page_root", E: "dynamic_page_attr" }
  ]
}
```

2. **DynamicPage** loads table settings from Neo4j (`Setting` with `type: table_config`), evaluates the config function body, and passes it to **Table**.

3. **Table** renders columns and row **`actions`** from config; business logic runs only in **`actionHandlers`** on the page (or `action.onClick` in props).

---

### 2. Columns and form fields: `dataType` + `renderer`

Do **not** overload `type` for columns or form fields. Use two keys:

| Property | Meaning | Examples |
|----------|---------|----------|
| `dataType` | Semantic data: validation, filters, sort, form input kind | `"text"`, `"email"`, `"number"`, `"boolean"`, `"date"`, `"relation"`, `"select"` |
| `renderer` | Visual presentation only | `"text"`, `"badge"`, `"link"`, `"date"`, `"currency"`, `"image"`, `"iconAction"` |

**Column example (status badge):**

```js
{ key: "status", label: "Status", dataType: "text", renderer: "badge", badgeToneMap: { active: ["Active", "success"] } }
```

**Column example (email as mailto link):**

```js
{ key: "email", label: "Email", dataType: "email", renderer: "link" }
```

**Column example (money):**

```js
{ key: "price", label: "Price", dataType: "number", renderer: "currency", currency: "USD" }
```

**Form field example:**

```js
{ key: "notes", label: "Notes", dataType: "text", renderer: "textArea" }
{ key: "role", label: "Role", dataType: "relation", renderer: "multiSelect", multiSelect: true, selectConfig: { … } }
```

Structural table columns use `renderer` only: `"rowNumber"`, `"expand"`, `"iconAction"`.

---

### 3. Table row actions

#### Table responsibility (only)

- Render action buttons from `actions` config
- Run `visible` / `disabled` predicates per row
- Show `confirm` dialogs
- Invoke `onClick` / built-in `edit` / `delete` handlers
- Built-in delete without custom handler uses `formConfig.saveFunction` + `mutateUserContent`

#### Not in Table

- Permissions, Shopify logic, domain mutations — use `actionHandlers` on the page or server functions

#### Config (`actions` in migration settings)

```js
actions: [
  { key: "edit", type: "edit" },
  {
    key: "delete",
    type: "delete",
    group: "primary",
    visible: ({ row }) => !row.P?.isSystem,
    disabled: ({ row }) => row.P?.syncStatus === "syncing",
    disabledReason: "Cannot delete while sync is in progress",
    reasonVariant: "warning",
    confirm: {
      title: "Delete?",
      message: "This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger"
    }
  },
  {
    key: "approve",
    type: "custom",
    label: "Approve",
    icon: "carbon:checkmark",
    group: "secondary", // overflow menu (alias: display: "menu")
    visible: ({ row }) => row.P?.status === "pending"
  }
]
```

| Field | Where | Purpose |
|-------|-------|---------|
| `actions` | settings | Serializable action definitions |
| `actionHandlers` | **page props only** | `{ [key]: async (row) => void }` |
| `visible` | action | `boolean` or `({ row, action, graph, … }) => boolean` — `false` removes the control |
| `disabled` | action | `boolean` or `({ row, action, graph, … }) => boolean` — `true` disables (control stays visible) |
| `disabledReason` | action | `string` or `({ row, action, … }) => string` — tooltip when disabled (overrides `title`) |
| `reasonVariant` | action | `"info"` \| `"warning"` \| `"danger"` or `({ row, action }) => variant` — styles reason state (default `info`) |
| `reasonCode` | action | Stable code e.g. `"requires_admin"` — i18n, analytics, audit (`string` or `({ row, action }) => string`) |
| `reasonCodeMap` | settings / props | `{ [code]: "Display text" }` — maps `reasonCode` → localized label |
| `group` | action | `"primary"` (icon, default) or `"secondary"` (⋯ menu) |
| `display` | action | `"menu"` alias for `group: "secondary"` |

Predicate context: `{ row, action, graph, tableStateVertexId, getSelectedRows, getDisplayData }`.  
`confirm.message` may be a function with the same context: `({ row, action }) => "…"`.

**Visibility:** `visible: false` (or predicate returning false) **hides** the action — no disabled placeholder. Use `disabled` + `disabledReason` when the action should stay visible but not clickable.

**Reason tooltips:** When disabled with `disabledReason` / `reasonCode`, the control uses resolved text as `title` and sets `data-reason-*` attributes for popovers, i18n, and telemetry.

```js
// Optional table-level map (settings or page props) for i18n / telemetry
reasonCodeMap: {
  requires_admin: "Requires admin role",
  sync_in_progress: "Cannot change while sync is running"
},
actions: [
  {
    key: "delete",
    type: "delete",
    disabled: ({ row }) => !row.P?.canDelete,
    reasonCode: "requires_admin",
    disabledReason: "Requires admin role", // fallback until map/i18n wired
    reasonVariant: "warning"
  }
]
```

`reasonCode` is stable for localization, analytics, permission debugging, and audit logs. UI resolves display text via `reasonCodeMap` (then falls back to `disabledReason`). Controls expose `data-reason-code` when disabled with a reason.

| `loadingIcon` | action | Icon while running (default `carbon:renew`) |
| `showActionsColumn` | settings | Optional override; default `actions.length > 0` |
| `formConfig` | settings | Add/edit modal; enables built-in `type: "edit"` and default delete |

Built-in types:

- **`edit`** — opens form modal (`handleEdit` / `onEdit` prop)
- **`delete`** — `actionHandlers.delete` or `formConfig.saveFunction` delete mode
- **`custom`** — requires `onClick` on action or `actionHandlers[key]`

#### Per-row loading

Table tracks `runningAction[rowId][actionKey]` while an async handler runs. Primary icons show a spinner; duplicate clicks are ignored.

#### Bulk actions (future)

`args.fns.runBulkAction(action, rows)` runs the same pipeline as a row click for each selected row (skips hidden/disabled). Wire from `batchActions` toolbar when needed.

#### Page props example (Shopify shops)

```js
return {
  tableVertexLabel: "ShopifyShop",
  loadFromSetting: true,
  actionHandlers: {
    delete: async (row) => {
      await args.executeNamedServerFunction({
        functionName: "deleteShopifyShop",
        contextData: { shop: row.P.shop }
      });
      // refresh table row ids…
    }
  }
};
```

Settings hold confirm copy; the page only wires the handler.

#### Toolbar `customActions`

Header toolbar slots (`customActions` in config) are separate from row `actions` — use for page-level buttons (export, etc.), not per-row buttons.

---

### 4. Configure a new `tableVertexLabel`

#### 4.1 Add default settings in `migrateDynamicPageSettings.hjson`

```js
{
  key: 'MyType_settings_default',
  tableVertexLabel: 'MyType',
  name: 'MyType',
  config: `return {
  title: "My items",
  actions: [
    { key: "edit", type: "edit" },
    { key: "delete", type: "delete", confirm: { title: "Delete?", message: "…" } }
  ],
  columns: [ /* … */ ],
  formConfig: { groups: [ /* … */ ] }
};`
}
```

#### 4.2 Wire a page

```hjson
props: '''
return {
  tableVertexLabel: "MyType",
  loadFromSetting: true
};
'''
```

Run `migrateDynamicPageSettings` after changing defaults.

---

### 5. Sidebar, filtering, relationships

See sections above in repo history for sidebar `parentVertexLabel`, `toParentEdgeType`, `getUserContent` category filters, and `createSidebarContentRelationship` on add.

---

### 6. Table row state vs graph

`TableUiState` stores row id arrays; payloads live in `args.graph.vertexes[id]`. After `getUserContent` / `mutateUserContent`, DynamicPage merges the returned graph.
