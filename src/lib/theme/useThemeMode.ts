import { createMemo } from "solid-js";
import { useGraph } from "~/lib/graph/context/UseGraph";
import { getThemeColorMode } from "./themeColorModeStorage";

/**
 * Hook to get the current theme mode (light/dark)
 * @returns A memo that returns the current color mode
 */
export function useThemeMode() {
  const [graph] = useGraph();

  return createMemo(() => getThemeColorMode(graph));
}

/**
 * Hook to check if the current theme is dark mode
 * @returns A memo that returns true if dark mode is active
 */
export function useIsDarkMode() {
  const themeMode = useThemeMode();
  return createMemo(() => themeMode() === "dark");
}
