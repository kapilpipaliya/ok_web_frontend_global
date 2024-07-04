
import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";
import { type JSX, type JSXElement, Show, splitProps, useContext } from "solid-js";

import type { DisplayComponentProps } from "~/components/fields/ComponentType";

import { GraphContext } from "~/lib/graph/graph";

function NavToggleBtn(props: Readonly<{ toggleSidebar: () => void }>) {
  const [graph, setGraph] = useContext(GraphContext)!;
  return (
    <button onClick={props.toggleSidebar} style={{ transition: "transform 0.3s ease" }}>
      <Icon
        height="24"
        icon={graph.isSideBarOpen ? "mdi:close" : "mdi:menu"}
        width="24"
              />
    </button>
  );
}

export function Navbar(
  p: {
    left?: JSXElement;
    right?: JSXElement;
    showCloseDrawerBtn: boolean;
    toggleSidebar: () => void;
  } & DisplayComponentProps,
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
      "align-items": "center",
      "background-color": "white",
      "box-shadow": "3px -1px 4px 3px lightgrey",
      display: "flex",
      "justify-content": "space-between",
      padding: "6px",
      width: "-webkit-fill-available",
    }) as JSX.CSSProperties;
  return (
    <div
      class="bb:1|solid|rgb(212,219,231) p:5|10 r:0|0|10|10"
      style={navbarStyle()}
    >
      <Show
        when={
          field.meta?.P.menuPosition === "left" || !field.meta?.P.menuPosition
        }
      >
        <Show
          when={field.showCloseDrawerBtn}
          
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
      <div class="flex ai:center gap:8 jc:center">
        {field.right}
        <Show when={field.meta?.P.menuPosition === "right"}>
          <NavToggleBtn toggleSidebar={field.toggleSidebar} />
        </Show>
      </div>
    </div>
  );
}
