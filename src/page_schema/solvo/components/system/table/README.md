# Table VirtualList (virtua integration)

Solvo table body uses [virtua](https://github.com/inokawa/virtua) `Virtualizer` via `VirtualList.hjson`.

## Architecture

```text
Table.hjson → VirtualList.hjson → Virtualizer (virtua/solid)
  virtualList_loop + virtualList_slot → Table row template (Slot)
```

Rows are **fixed height** (default **50px**). Virtua gets `itemSize` (virtua default `bufferSize` 200px).

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
