
import { Icon } from "@iconify-icon/solid";
import { JSXElement, Show, useContext } from "solid-js";
import { PageContext } from "../lib/Record";
import {DisplayComponentProps} from "./ComponentType";

export function Navbar(props: DisplayComponentProps & { left?: JSXElement, right?: JSXElement }) {

  let { events } = useContext(PageContext);

  

  return (
    <nav class={`p:7.5 flex jc:space-between ai:center ${props.meta?.P.class || ''}`}>
      <Show when={props.meta?.P.menuPosition === "left" || !props.meta?.P.menuPosition}>
        <Icon icon="mdi:hamburger-menu" width={20} onclick={() => { events?.setSideBarOpen((v: any) => !v); }} />

        
      </Show>
      {props.left}
      <div>{props.meta?.P?.title}</div>
      {/* Actions */}
      <div class="flex ai:center jc:center gap:8">
        <Icon icon="material-symbols:search" width={20} class="cursor:pointer" />
        {props.right}
        <Show when={props.meta?.P.menuPosition === "right"}>
          <Icon icon="mdi:hamburger-menu" width={20} onclick={() => { events?.setSideBarOpen((v: any) => !v); }} />
        </Show>
      </div>
    </nav>
  );
}
