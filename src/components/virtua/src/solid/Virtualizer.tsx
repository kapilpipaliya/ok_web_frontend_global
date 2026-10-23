import { onSettled, onCleanup, createEffect, createMemo, type JSX, on, createComputed, type ValidComponent, merge, For, type Accessor, untrack } from "solid-js";
import type { Store } from "solid-js";
import { Dynamic } from "@solidjs/web";
import {
  createVirtualStore,
  ACTION_ITEMS_LENGTH_CHANGE,
  getScrollSize,
  ACTION_START_OFFSET_CHANGE,
  createResizer,
  createScroller,
  type ItemsRange,
  type ScrollToIndexOpts,
  type CacheSnapshot,
  type VirtualStoreActions,
  type VirtualStoreState,
  type ItemResizeObserver,
  sort,
} from "../core/index.js";
import { ListItem } from "./ListItem.js";
import { isSameRange } from "./utils.js";

/**
 * Methods of {@link Virtualizer}.
 */
export interface VirtualizerHandle {
  /**
   * Get current {@link CacheSnapshot}.
   */
  readonly cache: CacheSnapshot;
  /**
   * Get current scrollTop, or scrollLeft if horizontal: true.
   */
  readonly scrollOffset: number;
  /**
   * Get current scrollHeight, or scrollWidth if horizontal: true.
   */
  readonly scrollSize: number;
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
  /**
   * Scroll to the given offset.
   * @param offset offset from start
   */
  scrollTo(offset: number): void;
  /**
   * Scroll by the given offset.
   * @param offset offset from current position
   */
  scrollBy(offset: number): void;
}

/**
 * Props of {@link Virtualizer}.
 */
export interface VirtualizerProps<T> {
  /**
   * Get reference to {@link VirtualizerHandle}.
   */
  ref?: (handle?: VirtualizerHandle) => void;
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
   * Component or element type for container element.
   * @defaultValue "div"
   */
  as?: ValidComponent;
  /**
   * Component or element type for item element.
   * @defaultValue "div"
   */
  item?: ValidComponent;
  /**
   * Reference to the scrollable element. The default will get the direct parent element of virtualizer.
   */
  scrollRef?: HTMLElement;
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
   * List of indexes that should be always mounted, even when off screen.
   */
  keepMounted?: readonly number[];
  /**
   * You can restore cache by passing a {@link CacheSnapshot} on mount. This is useful when you want to restore scroll position after navigation. The snapshot can be obtained from {@link VirtualizerHandle.cache}.
   *
   * **The length of items should be the same as when you take the snapshot, otherwise restoration may not work as expected.**
   */
  cache?: CacheSnapshot;
  /**
   * The offset to the scrollable parent before virtualizer in pixels. If you put an element before virtualizer, you have to set its height to this prop.
   */
  startMargin?: number;
  /**
   * Callback invoked whenever scroll offset changes.
   * @param offset Current scrollTop, or scrollLeft if horizontal: true.
   */
  onScroll?: (offset: number) => void;
  /**
   * Callback invoked when scrolling stops.
   */
  onScrollEnd?: () => void;
}

type VirtualizerItemProps<T> = {
  data: T;
  sliceIndex: Accessor<number>;
  dataSlice: Accessor<{ items: T[]; indexes: number[] }>;
  state: Store<VirtualStoreState>;
  actions: VirtualStoreActions;
  isNegative: Accessor<boolean>;
  horizontal: boolean;
  as?: ValidComponent;
  resizer: ItemResizeObserver;
  children: (data: T, index: Accessor<number>) => JSX.Element;
};

const VirtualizerItem = <T,>(props: VirtualizerItemProps<T>): JSX.Element => {
  const itemIndex = createMemo(
    () => props.dataSlice().indexes[props.sliceIndex()]!,
  );
  const offset = createMemo(() => {
    props.state.version;
    return props.actions.getItemOffset(itemIndex(), props.isNegative());
  });
  const hide = createMemo(() => {
    props.state.version;
    return props.actions.isUnmeasuredItem(itemIndex());
  });
  const children = createMemo(() => {
    return untrack(() => props.children(props.data, itemIndex));
  });

  return (
    <ListItem
      as={props.as}
      index={itemIndex()}
      resizer={props.resizer}
      offset={offset()}
      hide={hide()}
      isHorizontal={props.horizontal}
    >
      {children()}
    </ListItem>
  );
};

/**
 * Customizable list virtualizer for advanced usage. See {@link VirtualizerProps} and {@link VirtualizerHandle}.
 */
export const Virtualizer = <T,>(props: VirtualizerProps<T>): JSX.Element => {
  let containerRef: HTMLDivElement | undefined;
  const { itemSize, horizontal = false, cache } = props;
  props = merge<[Partial<VirtualizerProps<T>>, VirtualizerProps<T>]>(
    { as: "div" },
    props,
  );

  const store = createVirtualStore(
    props.data.length,
    itemSize,
    undefined,
    cache,
    !itemSize,
  );
  const { state, actions } = store;
  const resizer = createResizer(store, horizontal);
  const scroller = createScroller(store, horizontal);

  createEffect(
    on(
      () => state.scrollOffset,
      (offset) => {
        props.onScroll?.(offset);
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

  createComputed(
    on(
      () => props.scrollRef,
      (scrollable) => {
        if (scrollable) {
          resizer.measureRoot(scrollable);
        }
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
    // if (props.ref) {
    //   props.ref({
    //     get cache() {
    //       return actions.getCacheSnapshot();
    //     },
    //     get scrollOffset() {
    //       return state.scrollOffset;
    //     },
    //     get scrollSize() {
    //       return getScrollSize(store);
    //     },
    //     get viewportSize() {
    //       return actions.getViewportSize();
    //     },
    //     findItemIndex: actions.findItemIndex,
    //     getItemOffset: actions.getItemOffset,
    //     getItemSize: actions.getItemSize,
    //     scrollToIndex: scroller.scrollToIndex,
    //     scrollTo: scroller.scrollTo,
    //     scrollBy: scroller.scrollBy,
    //   });
    // }

    const container = containerRef!;
    const scrollable = props.scrollRef || container.parentElement!;
    resizer.measureRoot(scrollable);
    resizer.observeRoot(scrollable);
    scroller.observe(container, scrollable);

    onCleanup(() => {
      // if (props.ref) {
      //   props.ref();
      // }

      actions.dispose();
      resizer.dispose();
      scroller.dispose();
    });
  });

  createComputed(
    on(
      () => props.startMargin || 0,
      (value) => {
        if (value !== actions.getStartSpacerSize()) {
          actions.update(ACTION_START_OFFSET_CHANGE, value);
        }
      },
    ),
  );

  createEffect(
    on(
      () => state.version,
      () => {
        scroller.fixScrollJump();
      },
    ),
  );

  const dataSlice = createMemo(() => {
    const count = props.data.length;
    untrack(() => {
      if (count !== actions.getItemsLength()) {
        actions.update(ACTION_ITEMS_LENGTH_CHANGE, [count, props.shift]);
      }
    });
    const items: T[] = [];
    const indexes: number[] = [];

    if (props.keepMounted) {
      const mounted = new Set(props.keepMounted);
      for (let [i, j] = range(); i <= j; i++) {
        mounted.add(i);
      }
      sort([...mounted]).forEach((index) => {
        items.push(props.data[index]!);
        indexes.push(index);
      });
    } else {
      for (let [i, j] = range(); i <= j; i++) {
        items.push(props.data[i]!);
        indexes.push(i);
      }
    }

    return { items, indexes };
  });

  return (
    <Dynamic
      component={props.as}
      ref={containerRef}
      style={{
        contain: "size style", // https://github.com/inokawa/virtua/pull/775 https://github.com/inokawa/virtua/issues/800
        "overflow-anchor": "none", // opt out browser's scroll anchoring because it will conflict to scroll anchoring of virtualizer
        flex: "none", // flex style can break layout
        position: "relative",
        width: horizontal ? totalSize() + "px" : "100%",
        height: horizontal ? "100%" : totalSize() + "px",
        "pointer-events": isScrolling() ? "none" : undefined,
      }}
    >
      <For each={dataSlice().items}>
        {(data, sliceIndex) => (
          <VirtualizerItem
            data={data}
            sliceIndex={sliceIndex}
            dataSlice={dataSlice}
            state={state}
            actions={actions}
            isNegative={isNegative}
            horizontal={horizontal}
            as={props.item}
            resizer={resizer.observeItem}
          >
            {props.children}
          </VirtualizerItem>
        )}
      </For>
    </Dynamic>
  );
};
