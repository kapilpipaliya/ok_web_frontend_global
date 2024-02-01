import { Icon } from "@iconify-icon/solid";
import { JSXElement, Show, useContext } from "solid-js";
import { PageContext } from "../lib/Record";
import { DisplayComponentProps } from "./ComponentType";

function NavToggleBtn(props: { toggleSidebar: () => void }) {
  return <Icon class="cursor:pointer" icon="mdi:hamburger-menu" width={20} onclick={() => props.toggleSidebar()} />;
}

export function Navbar(
  props: DisplayComponentProps & { left?: JSXElement; right?: JSXElement; toggleSidebar: () => void },
) {
  let { events } = useContext(PageContext);
  // bg:white box-shadow:1|1|10|#ddd
  return (
    <nav class={`p:7.5 flex jc:space-between ai:center ${props.meta?.P.class || ""}`}>
      <Show when={props.meta?.P.menuPosition === "left" || !props.meta?.P.menuPosition}>
        <NavToggleBtn toggleSidebar={props.toggleSidebar} />
      </Show>

      {props.left}

      <div>{props.meta?.P?.title}</div>

      {/* Actions */}
      <div class="flex ai:center jc:center gap:8">
        <Icon icon="material-symbols:search" width={20} class="cursor:pointer" />

        {props.right}

        <Show when={props.meta?.P.menuPosition === "right"}>
          <NavToggleBtn toggleSidebar={props.toggleSidebar} />
        </Show>
      </div>
    </nav>
  );
}
