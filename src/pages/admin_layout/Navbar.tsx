import { useNavigate } from "@solidjs/router";
import { type JSXElement, Show, splitProps } from "solid-js";

import type { DisplayComponentProps } from "~/components/fields/FieldType";

import { IconButton } from "~/components/IconButton";
import { useGraph } from "~/lib/graph/graph";

function NavToggleBtn(props: Readonly<{ toggleSidebar: () => void }>) {
  const [graph] = useGraph();
  return (
    <IconButton
      icon={graph.isSideBarOpen ? "mdi:close" : "mdi:menu"}
      iconClass={`${graph.isSideBarOpen ? "rotate(180deg)" : "rotate(0deg)"} transition:transform|.3s|ease-in-out`}
      onClick={props.toggleSidebar}
      size={24}
      type="button"
    />
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
  const [field, _others] = splitProps(p, [
    "showCloseDrawerBtn",
    "right",
    "left",
    "toggleSidebar",
    "meta",
    "data",
  ]);
  // bg:white box-shadow:1|1|10|#ddd
  const _navigate = useNavigate();
  return (
    <div class="flex bb:1px|solid|rgb(212,219,231) jc:space-between p:5|10">
      <Show
        when={
          field.meta?.P.menuPosition === "left" || !field.meta?.P.menuPosition
        }
      >
        <Show when={field.showCloseDrawerBtn}>
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
