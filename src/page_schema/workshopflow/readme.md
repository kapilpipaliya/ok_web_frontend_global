### Form field: `nestedLineItems` and `nestedLineItemsConfig`

Use `type: "nestedLineItems"` on a form field with `nestedLineItemsConfig` so **FormNestedLineItems** can render a configurable grid (header + rows) backed by child vertices and edges (no invoice- or repair-specific logic in the component).

**Required on `nestedLineItemsConfig`:**

- `childLabel`, `parentToChildRelationshipType`, `parentElementIdPropOnChild` — graph shape for line vertices.
- `lineColumns` — **array** of column definitions, in display order. The grid uses `grid-template-columns` built by joining each column’s `gridMinmax` (CSS track, e.g. `"minmax(5rem, 1fr)"`).

**Column object (primitive fields only on the vertex; use JSON in migrated table settings):**

- `key` — property on the line vertex `P` for data columns; use `_inventory` for the inventory edge column and `_actions` for the remove button column (keys starting with `_` are not written to `P`).
- `label` — header text (empty string allowed for the actions column).
- `columnType` — one of: `select`, `text`, `number`, `inventory`, `actions`.
- `gridMinmax` — optional CSS grid track string; default `minmax(5rem, 1fr)` if omitted.
- For `select`: `optionsKey` names a sibling property on `nestedLineItemsConfig` whose value is an array of `{ value, label }` (e.g. `lineTypeOptions`). Optional: `placeholder`, `defaultValue`, `selectFallbackValue` when the cleared value should map to a default.
- For `text` / `number`: optional `placeholder`, `min`, `step`, `defaultValue` (used when adding a row).
- For `inventory`: optional `showWhenField` + `showWhenValues` (array) to show the picker only when `lineVertex.P[showWhenField]` matches one of the values; omit both to always show when `childToInventoryRelationshipType` is set.
- `childToInventoryRelationshipType`, `inventoryTargetLabel`, `inventorySelectConfig` — same as before for linking lines to inventory vertices.

**Optional:** `defaultNewLineProperties` — object merged onto the new line vertex `P` after column defaults. Optional: `rowsExpression` — override for `args.evalExpression` when listing lines (default `->${parentToChildRelationshipType}`).

**Server persist (`mutateUserContent` / `nestedLineSync`):** optional `nestedLineItemsSyncRules` on the same config object (copied into each sync entry by the form). If omitted, every submitted row is persisted (no quantity/inventory gating). If set, it is an object:

- `quantityFieldKey` (string) + `quantityRule` `{ op, value }` — `op` is one of `>`, `>=`, `<`, `<=`, `==`; the numeric field must satisfy the comparison.
- `rowRequiredFields` — array of property keys; each must be non-empty after trim or the row is skipped.
- `inventoryRequiredMode` — `never` (default), `always` (row skipped without `inventoryItemId` / `inventoryId`), or `when` (require inventory only if `inventoryRequiredWhenField` matches one of `inventoryRequiredWhenValues`, case-insensitive).

**Html loop pattern:** header and body use `loop: true`, `contextName: "nestedLineColumn"`, `data: () => args.fns.getColumns()` (or equivalent) so each column renders once per row; read the current column in children as `args.contextData.nestedLineColumn`. Do not pass a **function** as `class` on Html — return a **string** (see `getMetaProps` behavior).