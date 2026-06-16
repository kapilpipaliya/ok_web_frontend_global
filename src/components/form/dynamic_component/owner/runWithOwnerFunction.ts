import { type Owner, runWithOwner } from "solid-js";

/**
 * Like Solid's runWithOwner, but catches errors during teardown instead of crashing.
 * All errors are logged — including disposal errors from VirtualList unmount or hide:true.
 * Returns undefined when the owner is null or when fn throws.
 */
export function runWithOwnerFunction<T>(
  owner: Owner | null,
  fn: () => T,
): T | undefined {
  try {
    if (!owner) {
      return undefined;
    }

    return runWithOwner(owner, () => {
      return fn();
    });
  } catch (error) {
    console.error("Error in runWithOwnerFunction:", error);
    return undefined;
  }
}
