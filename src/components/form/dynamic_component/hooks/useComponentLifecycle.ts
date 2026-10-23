import { onCleanup, getOwner, createEffect, on, onSettled, untrack } from "solid-js";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

import type { DynamicPropsType } from "~/components/form/dynamic_component/functions/DynamicPropsType";
import { runWithOwnerFunction } from "~/components/form/dynamic_component/owner/runWithOwnerFunction";

/**
 * Runs schema lifecycle hooks (beforeMount, onMount, onCleanup) for dynamic components.
 *
 * Used inside ContentWrapperWithMount (DynamicComponent) and PageView (reMount: true).
 * Schema authors define hooks in props: { onMount: () => {...}, onCleanup: () => {...} }
 */
export function useComponentLifecycle(options: {
  dynamicProps: () => DynamicPropsType;
  getFunctionArgumentWithValue: () => FunctionArgumentType;
  setMounted: (mounted: boolean) => void;
  /** When true, re-runs mount/cleanup whenever dynamicProps changes (e.g. page navigation). */
  reMount?: boolean;
}) {
  // Owner of the component that calls this hook (e.g. ContentWrapperWithMount).
  // This owner is disposed on hide:true or VirtualList row unmount.
  const owner = getOwner();

  // Snapshot taken at mount — do NOT read dynamicProps/getFunctionArgumentWithValue
  // during cleanup (see setupCleanup).
  let pendingCleanupFn: ((arg: FunctionArgumentType) => void) | undefined;
  let pendingCleanupArgs: FunctionArgumentType | undefined;

  /** Store onCleanup callback and args while the component is still mounted and reactive reads are safe. */
  const captureCleanup = () => {
    pendingCleanupFn = untrack(
      () => options.dynamicProps().onCleanup,
    ) as typeof pendingCleanupFn;
    pendingCleanupArgs = untrack(options.getFunctionArgumentWithValue);
  };

  const initializeBeforeMount = () => {
    try {
      const beforeMount = options.dynamicProps().beforeMount;
      if (beforeMount && typeof beforeMount === "function") {
        beforeMount(options.getFunctionArgumentWithValue());
      }
    } catch (error) {
      console.error("Error in beforeMount:", error);
    }
  };

  const setupMount = () => {
    try {
      options.setMounted(true);
      captureCleanup();

      // onMount may register effects/cleanups — needs a valid owner.
      runWithOwnerFunction(owner, () => {
        const onMountFn = untrack(() => options.dynamicProps().onMount);
        if (onMountFn && typeof onMountFn === "function") {
          const onMountResult = onMountFn();
          // Schema can return a cleanup function from onSettled(Solid convention).
          if (typeof onMountResult === "function") {
            onCleanup(onMountResult);
          }
        }
      });
    } catch (error) {
      console.error("Error in onMount:", error);
    }
  };

  const setupCleanup = () => {
    // Take ownership of pending values and clear immediately so a reMount cycle
    // cannot accidentally reuse stale cleanup from a previous mount.
    const onCleanupFn = pendingCleanupFn;
    const args = pendingCleanupArgs;
    pendingCleanupFn = undefined;
    pendingCleanupArgs = undefined;

    try {
      options.setMounted(false);
      if (onCleanupFn && typeof onCleanupFn === "function" && args) {
        // Use args.owner (parent DynamicComponent scope) — it outlives hide:true
        // unmounts. The inner owner from getOwner() above is already disposing here.
        runWithOwnerFunction(args.owner ?? owner, () => {
          onCleanupFn(args);
        });
      }
    } catch (error) {
      console.error("Error in onCleanup:", error);
    }
  };

  // Standard lifecycle: run once when ContentWrapperWithMount mounts/unmounts.
  initializeBeforeMount();
  onSettled(setupMount);
  onCleanup(setupCleanup);

  // Optional: re-run lifecycle when dynamicProps change (PageView page switches).
  // Solid runs the previous iteration's onCleanup before each re-run.
  if (options.reMount) {
    createEffect(
      on(
        options.dynamicProps,
        () => {
          initializeBeforeMount();
          setupMount();
          onCleanup(setupCleanup);
        },
        { defer: true },
      ),
    );
  }

  return {
    initializeBeforeMount,
    setupMount,
    setupCleanup,
  };
}
