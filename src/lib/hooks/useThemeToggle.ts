import { useGraph } from "~/lib/graph/context/UseGraph";
import { saveUserSetting } from "~/lib/api/saveUserSetting";
import {
  getThemeColorMode,
  hasUserSetting,
  setLocalThemeColorMode,
} from "~/lib/theme/themeColorModeStorage";
import type { ColorMode } from "~/lib/styles/types/types";

/**
 * A hook that provides theme toggle functionality and persists the theme preference
 * to the user settings in the database, or the global store and local storage when
 * no user setting exists.
 */
export function useThemeToggle() {
  const [graph, setGraph] = useGraph();

  /**
   * Toggle between light and dark mode and save the preference
   */
  const toggleTheme = () => {
    const currentMode = getThemeColorMode(graph);
    const newMode: ColorMode = currentMode === "dark" ? "light" : "dark";

    if (hasUserSetting(graph)) {
      saveUserSetting({ themeColorMode: newMode }, graph, setGraph);
      return;
    }

    setLocalThemeColorMode(newMode, graph, setGraph);
  };

  /**
   * Set a specific color mode and save the preference
   */
  const setColorMode = (mode: ColorMode) => {
    if (getThemeColorMode(graph) === mode) {
      return;
    }

    if (hasUserSetting(graph)) {
      saveUserSetting({ themeColorMode: mode }, graph, setGraph);
      return;
    }

    setLocalThemeColorMode(mode, graph, setGraph);
  };

  /**
   * Reset theme to default (light mode) and save the preference
   */
  const resetTheme = () => {
    setColorMode("light");
  };

  return {
    toggleTheme,
    setColorMode,
    resetTheme,
    currentMode: () => getThemeColorMode(graph),
  };
}
