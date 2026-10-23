import type {  JSX  } from "@solidjs/web";

export const SCOPED_STYLE_ATTR = "data-component-scoped-style";

/** Per-component style tag for SSR/hydration (removed after hydrate). */
export function ComponentScopedStyle(props: {
  cssContent: string;
}): JSX.Element {
  return <style data-component-scoped-style>{props.cssContent}</style>;
}

export function removePerComponentStyleElements(): void {
  if (typeof document === "undefined") {
    return;
  }
  document
    .querySelectorAll(`style[${SCOPED_STYLE_ATTR}]`)
    .forEach((el) => el.remove());
}
