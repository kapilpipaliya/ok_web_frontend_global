import { createEffect, createMemo, on, onCleanup, type Accessor } from "solid-js";

import { useComponentCssActions } from "~/lib/styles/ComponentStylesContext";
import type { ScopedComponentCss } from "~/lib/styles/scopeComponentCss";

/** Stable key so effect only re-runs when hash or scoped CSS text changes. */
function scopedCssKey(scoped: ScopedComponentCss | undefined): string | null {
  if (!(scoped?.hash && scoped.scoped)) {
    return null;
  }
  return `${scoped.hash}\x00${scoped.scoped}`;
}

/** Acquire scoped CSS while mounted; release when unmounted or hash changes. */
export function useComponentCssLifecycle(
  scopedCss: Accessor<ScopedComponentCss | undefined>,
): void {
  const { acquireComponentCss, releaseComponentCss } = useComponentCssActions();

  const cssKey = createMemo(() => scopedCssKey(scopedCss()));

  createEffect(
    on(cssKey, (key, prevKey) => {
      if (prevKey) {
        const hash = prevKey.split("\x00")[0];
        releaseComponentCss(hash);
      }
      if (!key) {
        return;
      }
      const sep = key.indexOf("\x00");
      const hash = key.slice(0, sep);
      const css = key.slice(sep + 1);
      acquireComponentCss(hash, css);
    }),
  );

  onCleanup(() => {
    const key = cssKey();
    if (key) {
      releaseComponentCss(key.split("\x00")[0]);
    }
  });
}
