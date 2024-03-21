import { Icon } from "@iconify-icon/solid";
import { JSXElement, Show, createSignal, Match, Switch } from "solid-js";
import { DisplayComponentProps } from "./ComponentType";
import { isFormEditPage } from "../signals/common";
import { useNavigate } from "@solidjs/router";
// import {currentTheme, onChangeTheme, setCurrentTheme, themeMode} from "./css/Theme";

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
    showNavBar: boolean;
    toggleSidebar: () => void;
  }
) {
  // let {events} = useContext(PageContext);
  // bg:white box-shadow:1|1|10|#ddd
  const navigate = useNavigate();
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
        <Show
          when={props.showNavBar}
          fallback={
            <Icon
              class="pointer:cursor"
              onclick={() => {
                navigate(-1);
              }}
              icon={"ic:round-arrow-back-ios"}
            />
          }
        >
          <NavToggleBtn toggleSidebar={props.toggleSidebar} />
        </Show>
      </Show>

      {props.left}

      <div>{props.meta?.P?.title}</div>
      {/*   Theme Change Button
      <button class="px:5x r:2x font:18 h:48 bg:slate-10@light bg:gray-80@dark fg:strong rel">
        <Switch>
          <Match when={currentTheme() === 'dark'}>
            <span>🌜 Dark Theme</span>
          </Match>
          <Match when={currentTheme() === 'light'}>
            <span>☀️ Light Theme</span>
          </Match>
          <Match when={true}>
            <span>{currentTheme().charAt(0).toUpperCase() + currentTheme().slice(1)} Theme</span>
          </Match>
        </Switch>
        <select
          class="abs full inset:0 opacity:0"
          value={currentTheme()}
          onChange={onChangeTheme}
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌜 Dark</option>
          <option value="system">System</option>
        </select>
      </button>*/}
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
