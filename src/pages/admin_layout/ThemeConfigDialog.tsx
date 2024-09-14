import { createSignal } from "solid-js";

import { getDefaultTheme } from "./getDefaultTheme";

export function ThemeConfigDialog(props: Readonly<{ onClose: () => void; theme: string; }>) {
  const [colors, setColors] = createSignal(getDefaultTheme());

  const handleChange = (value: string) => {
    setColors(value);
  };

  const handleSave = () => {
    // Logic to save the theme colors
    props.onClose();
  };

  return (
    <div class="theme-config-dialog">
      <h2>Configure Theme</h2>
      <div>
        <label>Theme Colors</label>
        <textarea
          onInput={(e) => handleChange(e.target.value)}
          value={colors()} />
      </div>
      <button onClick={handleSave}>Save</button>
      <button onClick={props.onClose}>Cancel</button>
    </div>
  );
}
