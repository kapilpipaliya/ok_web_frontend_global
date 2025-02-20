import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  onCleanup,
  type Setter,
} from "solid-js";

export type WrappedElement<P> = (props: P) => JSX.Element;

export function composeStyles(...styles: (JSX.CSSProperties | string)[]) {
  return Object.assign({}, ...styles.map(toStyleObject));
}

export function getNearestNode(
  target: EventTarget | null | undefined,
  name: string,
): Node | null | undefined {
  if (!target) {
    return;
  }
  let nearest: (Node & ParentNode) | null = target as Node & ParentNode;
  while (nearest && nearest.nodeName !== name) {
    nearest = nearest.parentNode;
  }
  return nearest;
}

export function toStyleObject(style: JSX.CSSProperties | string) {
  if (typeof style === "object") {
    return style;
  }
  const styleObject: JSX.CSSProperties = {};
  (style || "").replace(/([\w-]+)\s*:\s*([^;]+)/g, (_, prop, value) => {
    styleObject[prop] = value;
    return "";
  });
  return styleObject;
}

export const maxRandom = 8;
let lastItem = 0;
export type MediaQueryItem =
  | "all"
  | "print"
  | "screen"
  | `(${"" | "max-" | "min-"}${
      | "aspect-ratio"
      | "color"
      | "color-gamut"
      | "color-index"
      | "display-mode"
      | "grid"
      | "height"
      | "inverted-colors"
      | "orientation"
      | "pointer"
      | "resolution"
      | "scan"
      | "width"
      | `prefers-${
          | "color-scheme"
          | "contrast"
          | "reduced-motion"
          | "reduced-transparency"}`}: ${string})`;

export type MediaQueryOperator = ", " | " and " | " not " | " only ";
export type MediaQueryString =
  | `${MediaQueryItem}${MediaQueryOperator}${MediaQueryItem}`
  | MediaQueryItem;
export type NodeName = string;

export function createLocalStorageSignal<T extends any | string>(
  key: string,
  initialValue?: T,
  useJson = false,
): [Accessor<T | undefined>, Setter<T | undefined>] {
  if (localStorage.getItem(key) === null && initialValue !== undefined) {
    putStorage(key, initialValue);
  }
  const [value, setValue] = createSignal(
    parseStorage<T>(localStorage.getItem(key), useJson),
  );

  createEffect(() =>
    useJson && value() === undefined
      ? localStorage.removeItem(key)
      : putStorage(key, value()),
  );

  return [value, setValue];
}

export function getElements(
  children: ((...args: any[]) => JSX.Element) | JSX.Element,
  filter?: ((node: HTMLElement) => boolean) | NodeName,
  /** if the children contains a callback, you may add an array of props */
  props: any = [],
  /** you can add prepended results if you want */
  result = [],
): HTMLElement[] | undefined {
  if (!children) {
    return;
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      getElements(child, filter, props, result);
    }
  } else if (typeof children === "function") {
    getElements(children.apply(null, props), filter, props, result);
  } else {
    const node = children as HTMLElement;
    if (
      !filter ||
      (typeof filter === "function" ? filter(node) : node.nodeName === filter)
    ) {
      (result as HTMLElement[]).push(node);
    }
  }
  return result;
}

export function getRandom() {
  const nextItem =
    1 + Math.floor(Math.random() * (maxRandom - (lastItem ? 1 : 0)));
  lastItem = lastItem ? nextItem + (nextItem === lastItem ? 1 : 0) : nextItem;
  return lastItem;
}

// TODO: types
export function runEvent<
  E extends Event,
  T extends HTMLElement,
  EV = E & { currentTarget: T; target: Element },
  EU = JSX.EventHandlerUnion<T, E>,
>(ev: EV, handler?: EU): void {
  if (Array.isArray(handler)) {
    handler[1](handler[0], ev);
  } else if (typeof handler === "function") {
    handler(ev);
  }
}

export function useDarkMode(localStorageKey = "COLOR_SCHEME") {
  const mediaQueryPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [storedPrefersDark, setStoredPrefersDark] =
    createLocalStorageSignal<boolean>(localStorageKey, undefined, true);
  const darkMode = createMemo(
    () => storedPrefersDark() ?? mediaQueryPrefersDark(),
  );

  createEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode());
  });

  return [darkMode, setStoredPrefersDark];
}

export function useMediaQuery(query: MediaQueryString): Accessor<boolean> {
  const matcher = window.matchMedia(query);
  const [matches, setMatches] = createSignal(matcher.matches);

  const changeHandler = (ev: MediaQueryListEvent) => setMatches(ev.matches);
  matcher.addEventListener("change", changeHandler);
  onCleanup(() => matcher.removeEventListener("change", changeHandler));

  return matches;
}

function parseStorage<T extends any | string>(
  data: null | string | undefined,
  useJson: boolean,
): T | undefined {
  return useJson ? (data ? JSON.parse(data) : undefined) : (data ?? undefined);
}

function putStorage<T extends any | string>(key: string, data: T): void {
  return localStorage.setItem(
    key,
    typeof data === "string" ? data : JSON.stringify(data),
  );
}
