# Table VirtualList (virtua integration)

Solvo table body uses [virtua](https://github.com/inokawa/virtua) `Virtualizer` via `VirtualList.hjson`.

## Architecture

```text
Table.hjson → VirtualList.hjson → Virtualizer (virtua/solid)
  virtualList_loop + virtualList_slot → Table row template (Slot)
```

Rows default to **50px**. With `getItemHeightAt` (row expansion), virtua **auto-measures** DOM (no fixed `itemSize`).

**Row expansion:** `expansionOpen` controls row height and panel CSS. On collapse, expansion shell (`41exp` / `41exp_nest`) stays mounted; only nested `Table` (`41exp_ret_table`) uses `hide: true`.

## VirtualList props (from Table)

| Prop | Purpose |
|------|---------|
| `getItems` | Display rows (`getDisplayData`) |
| `itemHeight` | Fixed row height (default 50) |
| `getScrollContainerElement` | Body scroll port (`40wrap`) |
| Keyboard / a11y props | `getActiveIndex`, `setActiveIndex`, `onSpaceKey`, etc. |

## Pitfalls

1. Wait for `scrollRef` before showing Virtualizer (`hide` until `40wrap` exists).
2. Do not `hide: VirtualList` during loading — use overlay `40a` only.
3. Do not re-add absolute positioning on table rows; virtua positions items.
## Related

- `/src/components/form/dynamic_component/functions/createLoopRowRenderer.tsx`
- [virtua Solid API](https://github.com/inokawa/virtua/tree/main/src/solid)
