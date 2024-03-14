import { Icon } from "@iconify-icon/solid";
import { JSXElement, Show, createSignal } from "solid-js";
import { DisplayComponentProps } from "./ComponentType";
import { themeMode } from "./css/Theme";

function NavToggleBtn(props: { toggleSidebar: () => void }) {
  return (
    <Icon
      class="cursor:pointer bg:white@dark bg:black@light"
      icon="mdi:hamburger-menu"
      width={20}
      onclick={() => props.toggleSidebar()}
    />
  );
}

export function Navbar(
  props: DisplayComponentProps & {
    left?: JSXElement;
    right?: JSXElement;
    toggleSidebar: () => void;
  }
) {
  // let {events} = useContext(PageContext);
  const [currentTheme, setCurrentTheme] = createSignal(themeMode.preference);
  // bg:white box-shadow:1|1|10|#ddd

  const onChangeTheme = (e: any) => {
    themeMode.preference = e.target.value;
    setCurrentTheme(e.target.value);
  };
  return (
    <nav
      class={`p:7.5 flex jc:space-between ai:center ${
        props.meta?.P.class || ""
      }`}
    >
      <Show
        when={
          props.meta?.P.menuPosition === "left" || !props.meta?.P.menuPosition
        }
      >
        <NavToggleBtn toggleSidebar={props.toggleSidebar} />
      </Show>

      {props.left}

      <div>{props.meta?.P?.title}</div>
      <button class="px:5x r:2x font:18 h:48 bg:slate-10@light bg:gray-80@dark fg:strong rel">
        {currentTheme() === "dark" ? "🌜" : "☀️"} {currentTheme()}
        <select
          class="abs full inset:0 opacity:0"
          value={currentTheme()}
          onChange={onChangeTheme}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌜 Dark</option>
          <option value="system">System</option>
        </select>
      </button>
      {/* Actions */}
      <div class="flex ai:center jc:center gap:8">
        {props.right}

        <Show when={props.meta?.P.menuPosition === "right"}>
          <NavToggleBtn toggleSidebar={props.toggleSidebar} />
        </Show>
      </div>
    </nav>
  );
}
