## DynamicPage + Table + Sidebar

This document explains how the **DynamicPage** system works and how to configure it for a new content type (e.g. `book`, `audioVideo`, `category`).

The implementation is split into:

- Components:
  - `DynamicPage.hjson` (this folder)
  - `Sidebar.hjson`, `SidebarTreeItem.hjson`, `SidebarAddChildModal.hjson` (this folder)
  - `Table.hjson`, `TableModal.hjson` (`../table`)
- Server functions:
  - `functions/dynamic_page/getUserContent.hjson`
  - `functions/dynamic_page/mutateUserContent.hjson`
  - `functions/dynamic_page/getVertexChildren.hjson`
  - `functions/dynamic_page/saveSidebarVertex.hjson`
  - `functions/dynamic_page/createSidebarContentRelationship.hjson`
  - `functions/dynamic_page/migrateContentTableSettings.hjson`
  - plus settings/import/export helpers

The goal is to have:

- One **DynamicPage** per logical content type (Book, AudioVideo, Category, etc.)
- A **Table** that reads/writes that content type
- An optional **Sidebar tree** that:
  - Shows a hierarchy (e.g. categories)
  - Filters the table by the selected node
  - Lets you add/edit nodes with the same form system used by the table

---

### 1. Data flow overview

1. A page HJSON uses `DynamicPage`:

```hjson
{
  vertexes: [
    {
      id: "1"
      L: Component
      P: {
        key: BooksPage
        componentName: DynamicPage
        props: '''
return {
  tableVertexLabel: "book",
  loadFromSetting: true
};
'''
      }
    }
  ]
  edges: []
}
```

2. **DynamicPage**:

- Reads:
  - `tableVertexLabel` – logical type (`"book"`, `"audioVideo"`, `"category"`, etc.)
  - `loadFromSetting` – whether to use settings/migration instead of inline config
  - Optional `configFunction` / `settingsFunction`
- Uses:
  - `getUserContentSetting` / `saveUserContentSetting`
  - `migrateContentTableSettings` (default config/migration)
- Produces a normalized config object:

```ts
{
  columns: [...],
  formConfig: { groups: [...] },
  uniqueKeys: [...],
  sidebar?: {
    enabled: true,
    parentVertexLabel: "Category",
    toParentEdgeType: "ParentCategory",
    rootKeys: { key: "root" },
    formConfig: {...} // form for add/edit sidebar nodes
  }
}
```

- Exposes helpers via `args.fns` to children:
  - `fetchData` / `getGenericDataFunction`
  - `getGenericSaveFunction`
  - `getSidebarConfig`, `hasSidebar`
  - `selectedSidebarItem`, `handleSidebarItemSelect`, etc.

3. **Table** (`components/table/Table.hjson`):

- Uses `args.fns.fetchData` to load data:
  - Internally calls `getGenericDataFunction` → `getUserContent`
- Uses `args.fns.getGenericSaveFunction` to save:
  - Internally calls `mutateUserContent`
- Uses `formConfig` from the DynamicPage config to render the add/edit modal via `TableModal` + `FormManagement`.
- Watches `selectedSidebarItem` and re-runs `handleSearch()` whenever the sidebar selection changes.

**Table row state vs graph**

The `TableUiState` vertex stores **`P.data` and `P.filteredData` as arrays of vertex id strings** only (including nested line-item tables). Row payloads are read from **`args.graph.vertexes[id]`** in the Neo4j shape (`id`, `L`, `P`, `IN`, `OUT`). After `getUserContent` / `mutateUserContent`, **DynamicPage** merges the returned `graph` (`applyServerGraphToLocalGraph`); the table resolves ids to vertices for filtering, sorting, rendering, batch actions, and export.

4. **Sidebar** (`Sidebar.hjson`, `SidebarTreeItem.hjson`, `SidebarAddChildModal.hjson`):

- Reads `sidebar` config from `getSidebarConfig()`:
  - `parentVertexLabel` – label of the tree node vertex (e.g. `"Category"`)
  - `toParentEdgeType` – edge label used to represent the tree (e.g. `"ParentCategory"`)
  - `rootKeys` – e.g. `{ key: "root" }` to identify the root node(s)
  - `formConfig` – form used to add/edit sidebar nodes (same schema as table forms)
- Uses `getVertexChildren` to:
  - Load root nodes (by `rootKeys`)
  - Lazily load children when expanding a node
- `SidebarTreeItem`:
  - Tracks expanded/selected state
  - Shows child count in the label, e.g. `Category A (3)`
  - Renders `+` (add child) and `✎` (edit) icons
  - Opens `SidebarAddChildModal` for add/edit
- `SidebarAddChildModal`:
  - Uses `FormManagement` + `sidebar.formConfig`
  - Saves via `saveSidebarVertex` (generic “sidebar vertex” function)
  - On success, refreshes children and (for add) ensures the parent is expanded

5. **Filtering the Table via Sidebar**

- DynamicPage keeps `selectedSidebarItem` in its fns.
- `getGenericDataFunction` inspects `selectedSidebarItem` and `sidebar` config:

  - If a regular node is selected:

    - Sends `categoryId = selectedSidebarItem.id` and the sidebar’s `parentVertexLabel` / `toParentEdgeType` into `getUserContent`.
    - `getUserContent` matches:

      ```cypher
      MATCH (cat:Category)-[:ParentCategory]->(c:Book|AudioVideo)
      WHERE elementId(cat) = $categoryId
      ```

  - If the **root** node is selected (e.g. `P.key === "root"`):

    - Sends `showUnassigned: true` with `parentVertexLabel` / `toParentEdgeType`.
    - `getUserContent` adds a `NOT EXISTS` clause so only items with **no category relationship** are returned.

- Table’s `handleSearch` → `fetchData` chain is re-run whenever `selectedSidebarItem` changes, so the rows always match the current sidebar selection.

6. **Adding relationships on table “Add”**

- When the user clicks “Add” in the table, the form is saved via `getGenericSaveFunction`:
  - Calls `mutateUserContent` to create/update/delete the content vertex.
  - If `mode === "add"` **and** a non-root sidebar item is selected:
    - Calls `createSidebarContentRelationship` to create:

      ```cypher
      (Category)-[:ParentCategory]->(Book|AudioVideo)
      ```

    - So new rows are automatically related to the selected node.

---

### 2. How to configure a new `tableVertexLabel`

Assume you want to add a new content type `category` that also has a sidebar.

#### 2.1 Add default settings in `migrateContentTableSettings.hjson`

Edit `functions/dynamic_page/migrateContentTableSettings.hjson` and add a settings entry:

```js
{
  key: 'category_settings_default',
  tableVertexLabel: 'category',
  icon: '📁',
  name: 'Category',
  config: `return {
  title: "Categories",
  columns: [
    { key: "name", label: "Name", type: "text", width: "200px", required: true },
    { key: "key",  label: "Key",  type: "text", width: "150px" }
  ],
  rowHeight: 50,
  showRowNumber: true,
  showSelection: true,
  showActions: true,
  resizableColumns: true,
  formConfig: {
    gridColumns: 1,
    groups: [
      {
        key: "basic",
        title: "Basic Information",
        gridColumns: 2,
        fields: [
          { key: "name", label: "Name", type: "text", required: true, maxLength: 255, colSpan: 2 },
          { key: "key",  label: "Key",  type: "text", maxLength: 100, colSpan: 2 }
        ]
      }
    ]
  },
  uniqueKeys: [],
  sidebar: {
    enabled: true,
    parentVertexLabel: "Category",
    toParentEdgeType: "ParentCategory",
    rootKeys: { key: "root" },
    formConfig: {
      gridColumns: 1,
      groups: [
        {
          key: "basic",
          title: "Basic Information",
          gridColumns: 2,
          fields: [
            { key: "name", label: "Name", type: "text", required: true, maxLength: 255, colSpan: 2 },
            { key: "key",  label: "Key",  type: "text", maxLength: 100, colSpan: 2 }
          ]
        }
      ]
    }
  }
};`
}
```

This single config drives:

- **Table UI** (columns, row height, action buttons)
- **Form** (fields and layout for add/edit)
- **Sidebar** (what vertex/edges form the tree, which roots to show, what fields to use for add/edit)

#### 2.2 Add/extend server logic for the new type

- `getUserContent.hjson`:
  - Validate `tableVertexLabel` and map it to a `vertexLabel` and `relationshipType`.
  - If you introduce a new type beyond `"book"`/`"audioVideo"`, extend the mapping accordingly.

- `mutateUserContent.hjson`:
  - Same change: extend `vertexLabel` / `relationshipType` mapping if needed.

If your new type behaves differently (e.g. different ownership model), you can create a separate pair of functions instead of reusing `getUserContent` / `mutateUserContent`.

#### 2.3 Wire up a page to use `DynamicPage`

Create a page HJSON (e.g. `Category.hjson`) that uses `DynamicPage`:

```hjson
{
  vertexes: [
    {
      id: "1"
      L: Component
      P: {
        key: CategoryPage
        componentName: DynamicPage
        props: '''
return {
  tableVertexLabel: "category",
  loadFromSetting: true
};
'''
      }
    }
  ]
  edges: []
}
```

Run the schema migration for this page’s environment so that `migrateContentTableSettings` populates the default config into `UserContentSetting`.

---

### 3. Quick checklist when adding a new type

1. **Server functions**
   - [ ] `getUserContent` knows about your `tableVertexLabel` (label + relationship type).
   - [ ] `mutateUserContent` knows about your `tableVertexLabel`.

2. **Migration / settings**
   - [ ] Added an entry to `migrateContentTableSettings.hjson` with:
     - `tableVertexLabel`
     - `columns`
     - `formConfig`
     - Optional `sidebar` config (if you want a tree + filtering).

3. **Page**
   - [ ] Created a Page HJSON using `DynamicPage` with `tableVertexLabel` and `loadFromSetting: true`.

4. **Sidebar behavior (optional)**
   - [ ] `sidebar.parentVertexLabel` / `sidebar.toParentEdgeType` match your graph schema.
   - [ ] `rootKeys` is correct for your root node(s) (e.g. `{ key: "root" }`).
   - [ ] `saveSidebarVertex` and `getVertexChildren` are aligned with your label/edge choices.

Once these are in place, you should get:

- A working DynamicPage listing your content type
- A functional table with search/filter/sort/add/edit/delete
- An optional sidebar tree that:
  - Shows hierarchy
  - Filters the table by selection
  - Uses the same form system to create/edit tree nodes

