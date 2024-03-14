import {Icon} from "@iconify-icon/solid";
import {JSXElement, Show} from "solid-js";
import {DisplayComponentProps} from "./ComponentType";
import { useThemeMode } from "./css/ThemeModeProvider";

function NavToggleBtn(props: { toggleSidebar: () => void }) {
    return <Icon class="cursor:pointer" icon="mdi:hamburger-menu" width={20} onclick={() => props.toggleSidebar()}/>;
}

export function Navbar(
    props: DisplayComponentProps & { left?: JSXElement; right?: JSXElement; toggleSidebar: () => void },
) {
        const themeMode = useThemeMode();

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

        {/* Actions */}
        <button class="px:5x r:2x font:18 h:48 bg:slate-10@light bg:gray-80@dark fg:strong rel">
          {themeMode.value === "dark" ? "🌜" : "☀️"} {themeMode.preference}
          <select
            class="abs full inset:0 opacity:0"
            value={themeMode.preference}
            onChange={(event) => (themeMode.preference = event.target.value)}
          >
            <option value="light">☀️ Light</option>
            <option value="dark">🌜 Dark</option>
            <option value="system">System</option>
          </select>
        </button>
        <div class="flex ai:center jc:center gap:8">
          {props.right}

          <Show when={props.meta?.P.menuPosition === "right"}>
            <NavToggleBtn toggleSidebar={props.toggleSidebar} />
          </Show>
        </div>
      </nav>
    );
}


