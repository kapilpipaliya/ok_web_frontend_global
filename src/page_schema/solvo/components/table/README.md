# Table VirtualList (virtua integration)

This document describes the **solvo** table body virtualization work: replacing the hand-rolled virtual scroll loop with [virtua](https://github.com/inokawa/virtua) while keeping existing **Table** row templates (Slot + `virtualItem` context).

---

## Summary

| Before | After |
|--------|--------|
| Manual `Html` loop + spacer + absolute row positioning | `Virtualizer` from `virtua/solid` inside `VirtualList.hjson` |
| Rows positioned with `translate3d(0, start, 0)` | virtua positions rows; Table row CSS uses flow height only |
| Keyboard nav on outer wrapper only | Capture-phase listeners on list root **and** external scroll port (`40wrap`) |
| Immediate sidebar selection during `fetchRoot` | Deferred via `queueMicrotask` + `batch` to avoid Solid disposal crashes |

---

## Architecture

```text
Table.hjson (componentName: VirtualList)
  └── VirtualList.hjson
        virtualList_root (Html — focus, keyboard, aria listbox)
          └── virtualList_virtua (Virtualizer — virtua/solid)
                virtualList_loop + virtualList_slot (template only, not mounted via PageAttrRender)
                      └── Slot: children  →  Table row attrs (id 41, 42, …)
```

**Row rendering path**

```text
Virtualizer children prop
  → args.createLoopRowRenderer(...)
  → LoopChildrenRenderer (JSX)
  → Slot row template with contextData.virtualItem = { index, start, size, rowData }
```

The loop/slot vertices exist in the graph so `findLoopTemplateMeta()` can resolve them at **runtime** (after `importGraphStructure` remaps ids). They are **not** rendered as normal PageAttrRender children because `DynamicContent` passes `children` as a function prop to `Virtualizer`.

---

## Files changed

### Schema (solvo)

| File | Change |
|------|--------|
| `VirtualList.hjson` | virtua `Virtualizer`, keyboard nav, `createLoopRowRenderer` bridge |
| `Table.hjson` | Uses `VirtualList`; row CSS without absolute positioning; loading overlay only (no `hide` on list during fetch) |
| `Sidebar.hjson` | `scheduleInitialSelection()` defers first category select after `setGraphData` |

### Framework (shared)

| File | Change |
|------|--------|
| `package.json` | `virtua` dependency |
| `componentsMap.ts` | Registers `Virtualizer`, `VList`, `WindowVirtualizer` from `virtua/solid` |
| `DynamicContent.tsx` | When `children` prop is a **function**, passes it only as the component prop (not JSX slot) |
| `LoopChildrenRenderer.tsx` | Renders loop template Slot children with `DataContext`; exports `findLoopTemplateMeta()` |
| `createLoopRowRenderer.tsx` | Stable JSX row renderer factory for virtua |
| `createFunctionArgumentBase.ts` | Exposes `args.createLoopRowRenderer()` in hjson function bodies |
| `FieldSchemaType.ts` | Type for `createLoopRowRenderer` |

### Removed

Custom virtua wrapper fields under `src/components/fields/virtua/` (replaced by direct `componentsMap` registration + hjson schema).

---

## VirtualList props (from Table)

Table passes these into `VirtualList`:

| Prop | Purpose |
|------|---------|
| `getItems` | Reactive display rows (`getDisplayData`) |
| `itemHeight` / `getItemHeightAt` | Row height hint for virtua + `virtualItem.size` |
| `getScrollContainerElement` | External scroll port (`40wrap` / `tableBodyVScrollEl`) |
| `getActiveIndex` / `setActiveIndex` | Maps to Table `activeRowId` |
| `onSpaceKey`, `onShiftArrow`, `onExpandCollapse` | Selection / expand shortcuts |
| `contentMinWidthPx` | Min width for wide column grids |
| `tabIndex`, `role`, `attr:aria-label` | Listbox accessibility |

---

## Keyboard navigation

Keyboard handling follows the [virtua storybook pattern](https://github.com/inokawa/virtua): update selection index, then `virtualizerHandle.scrollToIndex(index, { align: "nearest" })`.

**Important:** virtua’s `Virtualizer` does **not** forward `tabIndex`, `onKeyDown`, or `onMouseDown` to the DOM (unlike `VList`’s outer wrapper). All keyboard/focus logic lives on:

1. **`virtualList_root`** — `tabIndex`, `role`, `onKeyDownCapture`, `onMouseDownCapture`
2. **External scroll element** — capture-phase `keydown` / `mousedown` listeners (prevents arrow keys from scrolling `40wrap` or the page)

**Input handling**

| Target | Arrow keys | Space |
|--------|------------|-------|
| Text inputs / textarea / select | Ignored (native behaviour) | Ignored |
| Row checkbox | Row navigation; focus returns to list | Native toggle (not row `onSpaceKey`) |
| List root / row body | Row navigation + virtua scroll | Toggle row selection |

After arrow navigation from a checkbox, `focusList()` moves focus back to the listbox root.

---

## Sidebar load timing

`fetchRoot` → `setGraphData` → `handleItemSelect(firstRootItem)` in one synchronous turn previously caused Solid `cleanNode` crashes during list unmount/remount.

**Fix in `Sidebar.hjson`:**

```javascript
const scheduleInitialSelection = (item) => {
  queueMicrotask(() => {
    args.batch(() => handleItemSelect(item));
  });
};
```

Also restored auto-select of the first root category when no URL category is set.

---

## Graph vertex IDs

All `VirtualList` attr ids use the `virtualList_*` prefix (e.g. `virtualList_root`, `virtualList_loop`) so they never collide with Table graph nodes (`"1"`, `"4"`, …).

---

## Constraints and pitfalls

1. **`scrollRef` on mount** — virtua reads `scrollRef` once in `onMount`. Virtualizer stays `hide: true` until `getScrollContainerElement()` returns `40wrap`.
2. **Do not `hide: VirtualList` during table loading** — use the loading overlay (`40a`) only; unmounting the list during fetch caused disposal races.
3. **No RAF polling on scroll attach** — reactive `createEffect` on `getScrollContainerElement()` is enough; RAF loops caused signal updates after unmount.
4. **Loop template lookup** — never hardcode hjson ids like `"virtualList_loop"` in render code; use `findLoopTemplateMeta(graph, setGraph, startMeta)`.
5. **Row CSS** — do not re-add `position: absolute` + `translate3d` on Table rows; virtua owns vertical placement.

---

## Using virtua elsewhere in hjson

Pattern for any component that needs a render-prop child:

```javascript
// In component fns:
const renderRow = args.createLoopRowRenderer((rowData, index) => ({
  index: index(),
  rowData,
}));

// In Virtualizer props (via DynamicContent children-fn branch):
return {
  data: getItems(),
  children: renderRow,
  ref: setHandle,
};
```

Requires a **loop + Slot** template under the Virtualizer attr in the graph (same as `virtualList_loop` → `virtualList_slot`).

---

## Related docs

- [DynamicPage + Sidebar](../dynamic_page/README.md)
- [virtua Solid API](https://github.com/inokawa/virtua/tree/main/src/solid)
- Project schema guidelines: `/src/routes/api/chat/SYSTEM_PROMPT.md`
