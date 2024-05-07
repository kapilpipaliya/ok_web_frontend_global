import ThemeMode from "theme-mode";
import { createSignal } from "solid-js";

export const themeMode = new ThemeMode({ preference: "system" }).init();

// Set `preference` anywhere to switch theme modes.
// themeMode.preference = "dark";
export const [currentTheme, setCurrentTheme] = createSignal(
  themeMode.preference,
);

const onThemeModeChange = () => setCurrentTheme(themeMode.preference);

themeMode.host?.addEventListener("themeModeChange", onThemeModeChange, {
  passive: true,
});

// themeMode.destroy();
// themeMode.host?.removeEventListener('themeModeChange', onThemeModeChange);

export const onChangeTheme = (e: any) => {
  setCurrentTheme(e.target.value);
  themeMode.preference = e.target.value;
};
