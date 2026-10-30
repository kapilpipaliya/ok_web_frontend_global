### Form field: `nestedLineItems` and `nestedLineItemsConfig`

Use `type: "nestedLineItems"` on a form field with `nestedLineItemsConfig` so **FormNestedLineItems** can render a configurable grid (header + rows) backed by child vertices and edges (no invoice- or repair-specific logic in the component).

**Required on `nestedLineItemsConfig`:**

- `childLabel`, `parentToChildRelationshipType`, `parentElementIdPropOnChild` — graph shape for line vertices.
- `lineTargetLinks` — **array** of `{ relationshipType, targetLabel, rowIdKeys, requiredMode?, requiredWhenField?, requiredWhenValues? }` for edges from each line vertex to a target. `rowIdKeys` must be a non-empty array of property names on the line row payload that may hold the target vertex id (try in order).
- `lineTargetSelectConfig` — **defaults** merged into each `lineTarget` column’s optional per-column `lineTargetSelectConfig`. Passed to TomSelect → `getUserVertices`: `label`, `labelField`, `limit`, `singularName`, `pluralName`, `placeholder`, `search`, optional `relationshipType`, `enableUserScoping`. **`neighborFilter`** (on a column’s `lineTargetSelectConfig`): `{ anchorRelationshipType, outgoingRelationshipType, userPathToAnchor?: { relationshipType, anchorLabel } }` — loads targets reachable as `(anchor)-[outgoingRelationshipType]->(v:label)` where `anchor` is the line vertex’s current target for `anchorRelationshipType`; empty options until an anchor is selected; with `enableUserScoping`, `userPathToAnchor` is required so the server can verify `User-[rel]->(anchor)` before traversing. **`lineTargetOnChangeClearRelationshipTypes`** on a `lineTarget` column: array of `lineTargetLinks[].relationshipType` values to remove from the line when that column’s selection changes (e.g. clear variant when product changes).
- `lineColumns` — **array** of column definitions, in display order. The grid uses `grid-template-columns` built by joining each column’s `gridMinmax` (CSS track, e.g. `"minmax(5rem, 1fr)"`).

**Column object (primitive fields only on the vertex; use JSON in migrated table settings):**

- `key` — property on the line vertex `P` for data columns; use a dedicated key (e.g. `_part`) for the line-target picker column and `_actions` for the remove button column (keys starting with `_` are not written to `P`).
- `label` — header text (empty string allowed for the actions column).
- `columnType` — one of: `select`, `text`, `number`, `lineTarget`, `actions`.
- `gridMinmax` — optional CSS grid track string; default `minmax(5rem, 1fr)` if omitted.
- For `select`: `optionsKey` names a sibling property on `nestedLineItemsConfig` whose value is an array of `{ value, label }` (e.g. `lineTypeOptions`). Optional: `placeholder`, `defaultValue`, `selectFallbackValue` when the cleared value should map to a default.
- For `text` / `number`: optional `placeholder`, `min`, `step`, `defaultValue` (used when adding a row).
- For `lineTarget`: **`targetRelationshipType`** (string, required when multiple `lineTargetLinks`) must match one `lineTargetLinks[].relationshipType`; if there is only one link, you may omit it and the first link is used. Optional **`lineTargetLinkIndex`** (0-based) instead of `targetRelationshipType`. Optional `showWhenField` + `showWhenValues` (array) to show the picker only when `lineVertex.P[showWhenField]` matches one of the values. Optional per-column **`lineTargetSelectConfig`** and **`lineTargetOnChangeClearRelationshipTypes`** (see above).

**Optional:** `defaultNewLineProperties` — object merged onto the new line vertex `P` after column defaults. Optional: `rowsExpression` — override for `args.evalExpression` when listing lines (default `->${parentToChildRelationshipType}`).

**Server persist (`mutateUserContent` / `nestedLineSync`):** optional `nestedLineItemsSyncRules` on the same config object (copied into each sync entry by the form). If omitted, every submitted row is persisted (no quantity gating). If set, it is an object:

- `quantityFieldKey` (string) + `quantityRule` `{ op, value }` — `op` is one of `>`, `>=`, `<`, `<=`, `==`; the numeric field must satisfy the comparison.
- `rowRequiredFields` — array of property keys; each must be non-empty after trim or the row is skipped.

Per-link target requirements are set on each `lineTargetLinks` entry: `requiredMode` `never` (default), `always`, or `when` (with `requiredWhenField` + `requiredWhenValues`, case-insensitive). On save, **`mutateUserContent`** only recreates edges for a `when` link if the row matches the when-condition; otherwise it removes that link’s edges so non-part invoice lines do not keep part-only inventory edges.

**Html loop pattern:** header and body use `loop: true`, `contextName: "nestedLineColumn"`, `data: () => args.fns.getColumns()` (or equivalent) so each column renders once per row; read the current column in children as `args.contextData.nestedLineColumn`. Do not pass a **function** as `class` on Html — return a **string** (see `getMetaProps` behavior).