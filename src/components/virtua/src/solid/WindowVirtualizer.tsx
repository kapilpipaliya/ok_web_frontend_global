import { onSettled, onCleanup, createEffect, createMemo, type JSX, type Accessor, on, For, untrack } from "solid-js";
import {
  createVirtualStore,
  ACTION_ITEMS_LENGTH_CHANGE,
  createWindowResizer,
  createWindowScroller,
  type ItemsRange,
  type ScrollToIndexOpts,
  type CacheSnapshot,
} from "../core/index.js";
import { ListItem } from "./ListItem.js";
import { isSameRange } from "./utils.js";

/**
 * Methods of {@link WindowVirtualizer}.
 */
export interface WindowVirtualizerHandle {
  /**
   * Get current {@link CacheSnapshot}.
   */
  readonly cache: CacheSnapshot;
  /**
   * Get current scrollTop, or scrollLeft if horizontal: true.
   */
  readonly scrollOffset: number;
  /**
   * Get current offsetHeight, or offsetWidth if horizontal: true.
   */
  readonly viewportSize: number;
  /**
   * Find nearest item index from offset.
   * @param offset offset in pixels from the start of the scroll container
   */
  findItemIndex(offset: number): number;
  /**
   * Get item offset from start.
   * @param index index of item
   */
  getItemOffset(index: number): number;
  /**
   * Get item size.
   * @param index index of item
   */
  getItemSize(index: number): number;
  /**
   * Scroll to the item specified by index.
   * @param index index of item
   * @param opts options
   */
  scrollToIndex(index: number, opts?: ScrollToIndexOpts): void;
}

/**
 * Props of {@link WindowVirtualizer}.
 */
export interface WindowVirtualizerProps<T> {
  /**
   * Get reference to {@link WindowVirtualizerHandle}.
   */
  ref?: (handle?: WindowVirtualizerHandle) => void;
  /**
   * The data items rendered by this component.
   */
  data: readonly T[];
  /**
   * The elements renderer function.
   */
  children: (data: T, index: Accessor<number>) => JSX.Element;
  /**
   * Extra item space in pixels to render before/after the viewport. The minimum value is 0. Lower value will give better performance but you can increase to avoid showing blank items in fast scrolling.
   * @defaultValue 200
   */
  bufferSize?: number;
  /**
   * Item size hint for unmeasured items in pixels. It will help to reduce scroll jump when items are measured if used properly.
   *
   * - If not set, initial item sizes will be automatically estimated from measured sizes. This is recommended for most cases.
   * - If set, you can opt out estimation and use the value as initial item size.
   */
  itemSize?: number;
  /**
   * While true is set, scroll position will be maintained from the end not usual start when items are added to/removed from start. It's recommended to set false if you add to/remove from mid/end of the list because it can cause unexpected behavior. This prop is useful for reverse infinite scrolling.
   */
  shift?: boolean;
  /**
   * If true, rendered as a horizontally scrollable list. Otherwise rendered as a vertically scrollable list.
   */
  horizontal?: boolean;
  /**
   * You can restore cache by passing a {@link CacheSnapshot} on mount. This is useful when you want to restore scroll position after navigation. The snapshot can be obtained from {@link WindowVirtualizerHandle.cache}.
   *
   * **The length of items should be the same as when you take the snapshot, otherwise restoration may not work as expected.**
   */
  cache?: CacheSnapshot;
  /**
   * Callback invoked whenever scroll offset changes.
   */
  onScroll?: () => void;
  /**
   * Callback invoked when scrolling stops.
   */
  onScrollEnd?: () => void;
}

/**
 * {@link Virtualizer} controlled by the window scrolling. See {@link WindowVirtualizerProps} and {@link WindowVirtualizerHandle}.
 */
export const WindowVirtualizer = <T,>(
  props: WindowVirtualizerProps<T>,
): JSX.Element => {
  let containerRef: HTMLDivElement | undefined;

  const { itemSize, horizontal = false, cache } = props;

  const store = createVirtualStore(
    props.data.length,
    itemSize,
    undefined,
    cache,
    !itemSize,
  );
  const { state, actions } = store;
  const resizer = createWindowResizer(store, horizontal);
  const scroller = createWindowScroller(store, horizontal);

  createEffect(
    on(
      () => state.scrollOffset,
      () => {
        props.onScroll?.();
      },
    ),
  );
  createEffect(
    on(
      () => state.scrollEndVersion,
      () => {
        props.onScrollEnd?.();
      },
    ),
  );

  const range = createMemo<ItemsRange>((prev) => {
    state.version;
    const next = actions.getRange(props.bufferSize);
    if (prev && isSameRange(prev, next)) {
      return prev;
    }
    return next;
  });
  const isScrolling = () => state.isScrolling;
  const totalSize = () => state.totalSize;
  const isNegative = createMemo(() => {
    state.version;
    return scroller.isNegative();
  });

  onSettled(() => {
    if (props.ref) {
      props.ref({
        get cache() {
          return actions.getCacheSnapshot();
        },
        get scrollOffset() {
          return state.scrollOffset;
        },
        get viewportSize() {
          return actions.getViewportSize();
        },
        findItemIndex: actions.findItemIndex,
        getItemOffset: actions.getItemOffset,
        getItemSize: actions.getItemSize,
        scrollToIndex: scroller.scrollToIndex,
      });
    }

    resizer.observeRoot(containerRef!);
    scroller.observe(containerRef!);

    onCleanup(() => {
      if (props.ref) {
        props.ref();
      }

      actions.dispose();
      resizer.dispose();
      scroller.dispose();
    });
  });

  createEffect(
    on(
      () => state.version,
      () => {
        scroller.fixScrollJump();
      },
    ),
  );

  const dataSlice = createMemo<T[]>(() => {
    const count = props.data.length;
    untrack(() => {
      if (count !== actions.getItemsLength()) {
        actions.update(ACTION_ITEMS_LENGTH_CHANGE, [count, props.shift]);
      }
    });
    const items: T[] = [];
    for (let [i, j] = range(); i <= j; i++) {
      items.push(props.data[i]!);
    }
    return items;
  });

  return (
    <div
      ref={containerRef}
      style={{
        contain: "size style",
        "overflow-anchor": "none",
        flex: "none",
        position: "relative",
        width: horizontal ? totalSize() + "px" : "100%",
        height: horizontal ? "100%" : totalSize() + "px",
        "pointer-events": isScrolling() ? "none" : undefined,
      }}
    >
      <For each={dataSlice()}>
        {(data, index) => {
          const itemIndex = createMemo(() => range()[0] + index());
          const offset = createMemo(() => {
            state.version;
            return actions.getItemOffset(itemIndex(), isNegative());
          });
          const hide = createMemo(() => {
            state.version;
            return actions.isUnmeasuredItem(itemIndex());
          });
          const children = createMemo(() => {
            return untrack(() => props.children(data, itemIndex));
          });

          return (
            <ListItem
              index={itemIndex()}
              resizer={resizer.observeItem}
              offset={offset()}
              hide={hide()}
              isHorizontal={horizontal}
            >
              {children()}
            </ListItem>
          );
        }}
      </For>
    </div>
  );
};
