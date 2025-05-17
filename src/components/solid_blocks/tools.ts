import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Setter,
} from "solid-js";

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
