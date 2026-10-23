import { createStore, type Store } from "solid-js";
import {
  initCache,
  getItemSize as _getItemSize,
  getItemOffset as _getItemOffset,
  UNCACHED,
  setItemSize,
  estimateDefaultItemSize,
  updateCacheLength,
  computeRange,
  takeCacheSnapshot,
  findIndex,
} from "./cache.js";
import { isIOSWebKit } from "./environment.js";
import type {
  CacheSnapshot,
  InternalCacheSnapshot,
  ItemResize,
  ItemsRange,
} from "./types.js";
import { abs, max, min, NULL } from "./utils.js";

const SCROLL_IDLE = 0;
const SCROLL_DOWN = 1;
const SCROLL_UP = 2;
type ScrollDirection =
  | typeof SCROLL_IDLE
  | typeof SCROLL_DOWN
  | typeof SCROLL_UP;

const SCROLL_BY_NATIVE = 0;
const SCROLL_BY_MANUAL_SCROLL = 1;
const SCROLL_BY_SHIFT = 2;
type ScrollMode =
  | typeof SCROLL_BY_NATIVE
  | typeof SCROLL_BY_MANUAL_SCROLL
  | typeof SCROLL_BY_SHIFT;

/** @internal */
export const ACTION_SCROLL = 1;
/** @internal */
export const ACTION_SCROLL_END = 2;
/** @internal */
export const ACTION_ITEM_RESIZE = 3;
/** @internal */
export const ACTION_VIEWPORT_RESIZE = 4;
/** @internal */
export const ACTION_ITEMS_LENGTH_CHANGE = 5;
/** @internal */
export const ACTION_START_OFFSET_CHANGE = 6;
/** @internal */
export const ACTION_MANUAL_SCROLL = 7;
/** @internal */
export const ACTION_BEFORE_MANUAL_SMOOTH_SCROLL = 8;

type Actions =
  | [type: typeof ACTION_SCROLL, offset: number]
  | [type: typeof ACTION_SCROLL_END, dummy?: void]
  | [type: typeof ACTION_ITEM_RESIZE, entries: ItemResize[]]
  | [type: typeof ACTION_VIEWPORT_RESIZE, size: number]
  | [
      type: typeof ACTION_ITEMS_LENGTH_CHANGE,
      arg: [length: number, isShift?: boolean | undefined],
    ]
  | [type: typeof ACTION_START_OFFSET_CHANGE, offset: number]
  | [type: typeof ACTION_MANUAL_SCROLL, dummy?: void]
  | [type: typeof ACTION_BEFORE_MANUAL_SMOOTH_SCROLL, offset: number];

/** @internal */
export type VirtualStoreState = {
  version: number;
  scrollOffset: number;
  scrollEndVersion: number;
  totalSize: number;
  isScrolling: boolean;
};

/** @internal */
export type VirtualStoreActions = {
  dispose(): void;
  getCacheSnapshot(): CacheSnapshot;
  getRange(bufferSize?: number): ItemsRange;
  findItemIndex(offset: number): number;
  isUnmeasuredItem(index: number): boolean;
  getItemOffset(index: number, fromEnd?: boolean): number;
  getItemSize(index: number): number;
  getItemsLength(): number;
  getViewportSize(): number;
  getStartSpacerSize(): number;
  flushJump(): [number, boolean];
  update(...action: Actions): void;
};

/** @internal */
export type VirtualStore = {
  state: Store<VirtualStoreState>;
  actions: VirtualStoreActions;
};

/**
 * @internal
 */
export const getScrollSize = (store: VirtualStore): number => {
  return max(store.state.totalSize, store.actions.getViewportSize());
};

/**
 * @internal
 */
export const createVirtualStore = (
  elementsCount: number,
  itemSize = 40,
  ssrCount = 0,
  cacheSnapshot?: CacheSnapshot | undefined,
  shouldAutoEstimateItemSize = false,
): VirtualStore => {
  let isSSR = !!ssrCount;
  let viewportSize = 0;
  let startSpacerSize = 0;
  let scrollOffset = 0;
  let jump = 0;
  let pendingJump = 0;
  let flushedJump = 0;
  let scrollDirection: ScrollDirection = SCROLL_IDLE;
  let scrollMode: ScrollMode = SCROLL_BY_NATIVE;
  let frozenRange: ItemsRange | null = NULL;
  let prevRange: ItemsRange = [0, isSSR ? max(ssrCount - 1, 0) : -1];
  let totalMeasuredSize = 0;
  let isViewportMeasured = false;

  const cache = initCache(
    elementsCount,
    cacheSnapshot
      ? (cacheSnapshot as unknown as InternalCacheSnapshot)[1]
      : itemSize,
    cacheSnapshot && (cacheSnapshot as unknown as InternalCacheSnapshot)[0],
  );

  const getTotalSize = (): number => _getItemOffset(cache, cache._length);

  const [state, setState] = createStore<VirtualStoreState>({
    version: 1,
    scrollOffset: 0,
    scrollEndVersion: 0,
    totalSize: getTotalSize(),
    isScrolling: false,
  });

  const getRelativeScrollOffset = () => scrollOffset - startSpacerSize;
  const getVisibleOffset = () => getRelativeScrollOffset() + pendingJump + jump;
  const getRange = (startOffset: number, endOffset: number) => {
    return computeRange(cache, startOffset, endOffset, prevRange[0]);
  };
  const getItemOffset = (index: number, fromEnd?: boolean): number => {
    const offset = _getItemOffset(cache, index) - pendingJump;
    if (fromEnd) {
      return getTotalSize() - offset - getItemSize(index);
    }
    return offset;
  };
  const getItemSize = (index: number): number => {
    return _getItemSize(cache, index);
  };
  const isSizeEqual = (index: number, value: number = UNCACHED): boolean => {
    return cache._sizes[index] === value;
  };

  const applyJump = (j: number) => {
    if (j) {
      if (
        // In iOS WebKit browsers, updating scroll position will stop scrolling so it have to be deferred during scrolling.
        (isIOSWebKit() && scrollDirection !== SCROLL_IDLE) ||
        // Before imperative smooth scrolling, we measure all items which may be visible during scrolling.
        // However, especially in Firefox, there are rare cases where items resize while scrolling, which can stop smooth scrolling.
        (frozenRange && scrollMode === SCROLL_BY_MANUAL_SCROLL)
      ) {
        pendingJump += j;
      } else {
        jump += j;
      }
    }
  };

  const syncVirtualState = () => {
    setState((d) => { Object.assign(d, {
      totalSize: getTotalSize(),
      isScrolling: scrollDirection !== SCROLL_IDLE,
    }); });
  };

  const actions: VirtualStoreActions = {
    dispose: () => {},
    getCacheSnapshot: () => {
      return takeCacheSnapshot(cache) as unknown as CacheSnapshot;
    },
    getRange: (bufferSize = 200) => {
      if (!isViewportMeasured || isSSR) {
        // Return range for SSR, or return [0, -1] to render nothing, until the scroll offset and viewport size are determined.
        // https://github.com/inokawa/virtua/issues/415
        // https://github.com/inokawa/virtua/pull/818
        return prevRange;
      }
      let startIndex: number;
      let endIndex: number;
      if (flushedJump) {
        // Return previous range for consistent render until next scroll event comes in.
        // And it must be clamped. https://github.com/inokawa/virtua/issues/597
        [startIndex, endIndex] = prevRange;
      } else {
        let startOffset = max(0, getVisibleOffset());
        let endOffset = startOffset + viewportSize;

        // For faster initial render pass, returns without buffer if measurement seems to be in progress.
        if (!shouldAutoEstimateItemSize) {
          bufferSize = max(0, bufferSize);

          if (scrollDirection !== SCROLL_DOWN) {
            startOffset -= bufferSize;
          }
          if (scrollDirection !== SCROLL_UP) {
            endOffset += bufferSize;
          }
        }

        [startIndex, endIndex] = prevRange = getRange(
          max(0, startOffset),
          max(0, endOffset),
        );
        if (frozenRange) {
          startIndex = min(startIndex, frozenRange[0]);
          endIndex = max(endIndex, frozenRange[1]);
        }
      }

      return [max(startIndex, 0), min(endIndex, cache._length - 1)];
    },
    findItemIndex: (offset) => findIndex(cache, offset - startSpacerSize),
    isUnmeasuredItem: isSizeEqual,
    getItemOffset,
    getItemSize,
    getItemsLength: () => cache._length,
    getViewportSize: () => viewportSize,
    getStartSpacerSize: () => startSpacerSize,
    flushJump: () => {
      flushedJump = jump;
      jump = 0;
      return [flushedJump, scrollMode === SCROLL_BY_SHIFT];
    },
    update: (type, payload): void => {
      let shouldFlushPendingJump: boolean | undefined;
      let scrollChanged = false;
      let virtualChanged = false;
      let scrollEndChanged = false;

      switch (type) {
        case ACTION_SCROLL: {
          if (payload === scrollOffset && scrollMode === SCROLL_BY_NATIVE) {
            // Ignore scroll events from different direction
            break;
          }

          const prevFlushedJump = flushedJump;
          flushedJump = 0;

          const delta = payload - scrollOffset;
          // Scroll event after jump compensation is not reliable because it may result in the opposite direction.
          // The delta of artificial scroll may not be equal with the jump because it may be batched with other scrolls.
          // And at least in latest Chrome/Firefox/Safari in 2023, setting value to scrollTop/scrollLeft can lose subpixel because its integer (sometimes float probably depending on dpr).
          const isJustJumped =
            prevFlushedJump && abs(delta) < abs(prevFlushedJump) + 1;

          // Scroll events are dispatched enough so it's ok to skip some of them.
          if (
            !isJustJumped &&
            // Ignore until manual scrolling
            scrollMode === SCROLL_BY_NATIVE
          ) {
            scrollDirection = delta < 0 ? SCROLL_UP : SCROLL_DOWN;
          }

          // TODO This will cause glitch in reverse infinite scrolling. Disable this until better solution is found.
          // if (
          //   pendingJump &&
          //   ((_scrollDirection === SCROLL_UP &&
          //     payload - max(pendingJump, 0) <= 0) ||
          //     (_scrollDirection === SCROLL_DOWN &&
          //       payload - min(pendingJump, 0) >= getScrollOffsetMax()))
          // ) {
          //   // Flush if almost reached to start or end
          //   shouldFlushPendingJump = true;
          // }

          if (isSSR) {
            isSSR = false;
          }

          scrollOffset = payload;
          scrollChanged = true;

          // Skip if offset is not changed
          // Scroll offset may exceed min or max especially in Safari's elastic scrolling.
          const relativeOffset = getRelativeScrollOffset();
          if (
            relativeOffset >= -viewportSize &&
            relativeOffset <= getTotalSize()
          ) {
            virtualChanged = true;
          }
          break;
        }
        case ACTION_SCROLL_END: {
          scrollEndChanged = true;
          if (scrollDirection !== SCROLL_IDLE) {
            shouldFlushPendingJump = true;
            virtualChanged = true;
          }
          scrollDirection = SCROLL_IDLE;
          scrollMode = SCROLL_BY_NATIVE;
          frozenRange = NULL;
          break;
        }
        case ACTION_ITEM_RESIZE: {
          const updated = payload.filter(
            ([index, size]) => !isSizeEqual(index, size),
          );

          // Skip if all items are cached and not updated
          if (!updated.length) {
            break;
          }

          // Calculate jump by resize to minimize junks in appearance
          applyJump(
            updated.reduce((acc, [index, size]) => {
              let shouldKeep: boolean;
              // Keep distance from end during shifting
              if (scrollMode === SCROLL_BY_SHIFT) {
                shouldKeep = true;
              } else if (
                frozenRange &&
                scrollMode === SCROLL_BY_MANUAL_SCROLL
              ) {
                // https://github.com/inokawa/virtua/issues/380
                // https://github.com/inokawa/virtua/issues/758
                shouldKeep = index < frozenRange[0];
              } else {
                const start = getRelativeScrollOffset();
                const itemOffset = getItemOffset(index);
                const itemSize = getItemSize(index);
                shouldKeep =
                  scrollDirection !== SCROLL_DOWN &&
                  scrollMode === SCROLL_BY_NATIVE
                    ? // https://github.com/inokawa/virtua/issues/385
                      // https://github.com/inokawa/virtua/discussions/865
                      itemOffset + itemSize < start
                    : // https://github.com/inokawa/virtua/pull/868
                      itemOffset < start &&
                      itemOffset + itemSize < start + viewportSize;
              }

              if (shouldKeep) {
                acc += size - getItemSize(index);
              }
              return acc;
            }, 0),
          );

          // Update item sizes
          for (const [index, size] of updated) {
            const prevSize = getItemSize(index);
            const isInitialMeasurement = setItemSize(cache, index, size);

            if (shouldAutoEstimateItemSize) {
              totalMeasuredSize += isInitialMeasurement
                ? size
                : size - prevSize;
            }
          }

          // Estimate initial item size from measured sizes
          if (
            shouldAutoEstimateItemSize &&
            viewportSize &&
            // If the total size is lower than the viewport, the item may be a empty state
            totalMeasuredSize > viewportSize
          ) {
            applyJump(
              estimateDefaultItemSize(
                cache,
                findIndex(cache, getVisibleOffset()),
              ),
            );
            shouldAutoEstimateItemSize = false;
          }

          // Synchronous update is necessary in current design to minimize visible glitch in concurrent rendering.
          // However this seems to be the main cause of the errors from ResizeObserver.
          // https://github.com/inokawa/virtua/issues/470
          //
          // And in React, synchronous update with flushSync after asynchronous update will overtake the asynchronous one.
          // If items resize happens just after scroll, race condition can occur depending on implementation.
          virtualChanged = true;
          break;
        }
        case ACTION_VIEWPORT_RESIZE: {
          if (viewportSize !== payload) {
            if (!viewportSize) {
              isViewportMeasured = true;
            }
            viewportSize = payload;
            virtualChanged = true;
          }
          break;
        }
        case ACTION_ITEMS_LENGTH_CHANGE: {
          if (payload[1]) {
            applyJump(updateCacheLength(cache, payload[0], true));
            scrollMode = SCROLL_BY_SHIFT;
          } else {
            updateCacheLength(cache, payload[0]);
            // https://github.com/inokawa/virtua/issues/552
            // https://github.com/inokawa/virtua/issues/557
          }
          virtualChanged = true;
          break;
        }
        case ACTION_START_OFFSET_CHANGE: {
          startSpacerSize = payload;
          break;
        }
        case ACTION_MANUAL_SCROLL: {
          scrollMode = SCROLL_BY_MANUAL_SCROLL;
          break;
        }
        case ACTION_BEFORE_MANUAL_SMOOTH_SCROLL: {
          frozenRange = getRange(payload, payload + viewportSize);
          virtualChanged = true;
          break;
        }
      }

      if (scrollChanged || virtualChanged || scrollEndChanged) {
        if (shouldFlushPendingJump && pendingJump) {
          jump += pendingJump;
          pendingJump = 0;
        }

        {

          if (scrollChanged) {
            setState((d) => { d.scrollOffset = scrollOffset; });
          }
          if (virtualChanged) {
            setState((d) => { d.version = ((v) => v + 1)(d.version); });
            syncVirtualState();
          }
          if (scrollEndChanged) {
            setState((d) => { d.scrollEndVersion = ((v) => v + 1)(d.scrollEndVersion); });
            setState((d) => { d.isScrolling = false; });
          }
        
};
      }
    },
  };

  return { state, actions };
};
