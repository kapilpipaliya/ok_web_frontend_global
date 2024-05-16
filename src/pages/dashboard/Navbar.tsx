import { Icon } from "@iconify-icon/solid";
import { JSX, JSXElement, Show, splitProps } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "~/css/sideBarSearch.css";
import "~/css/table.css";
import { APP_BASE_URL } from "~/lib/Utils";
import { DisplayComponentProps } from "~/components/ComponentType";

function NavToggleBtn(props: { toggleSidebar: () => void }) {
  return (
    <>
      <input type="checkbox" id="checkbox" onClick={props.toggleSidebar} />
      <label for="checkbox" class="toggle">
        <div class="bars" id="bar1"></div>
        <div class="bars" id="bar2"></div>
        <div class="bars" id="bar3"></div>
      </label>
    </>
  );
}

export function Navbar(
  p: DisplayComponentProps & {
    left?: JSXElement;
    right?: JSXElement;
    showCloseDrawerBtn: boolean;
    toggleSidebar: () => void;
  },
) {
  const [field, others] = splitProps(p, [
    "showCloseDrawerBtn",
    "right",
    "left",
    "toggleSidebar",
    "meta",
    "data",
  ]);
  // let {events} = useContext(PageContext);
  // bg:white box-shadow:1|1|10|#ddd
  const navigate = useNavigate();
  const navbarStyle = () =>
    ({
      "background-color": "white",
      padding: "6px",
      display: "flex",
      width: "-webkit-fill-available",
      "justify-content": "space-between",
      "align-items": "center",
    }) as JSX.CSSProperties;
  return (
    <div
      class="p:5|10 bb:1|solid|rgb(212,219,231) r:0|0|10|10"
      style={navbarStyle()}
    >
      <Show
        when={
          field.meta?.P.menuPosition === "left" || !field.meta?.P.menuPosition
        }
      >
        <Show
          when={field.showCloseDrawerBtn}
          fallback={
            <div
              class="bg:rgb(255,253,253,.5) flex ai:center jc:center bg:rgb(232,229,229):hover r:5|5|5|5 h:30px w:30px cursor:pointer"
              onclick={() => {
                navigate(`${APP_BASE_URL}/Page`);
              }}
              title="Back"
            >
              <Icon
                icon={"flowbite:caret-left-outline"}
                class={"color:black:hover color:lightgrey"}
                height={30}
                width={30}
              />
            </div>
          }
        >
          <NavToggleBtn toggleSidebar={field.toggleSidebar} />
        </Show>
      </Show>

      {field.left}

      {/*<div class="f:16 font-weight:bold">{meta?.P?.title}</div>*/}
      {/*  Theme Change Button*/}
      {/*<button class="px:5x r:2x font:18 h:48 bg:slate-10@light bg:gray-80@dark fg:strong rel">
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
        {field.right}
        <Show when={field.meta?.P.menuPosition === "right"}>
          <NavToggleBtn toggleSidebar={field.toggleSidebar} />
        </Show>
      </div>
    </div>
  );
}
