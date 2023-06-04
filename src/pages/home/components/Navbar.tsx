import { Icon } from "@iconify-icon/solid";
import { DisplayComponentProps } from "../../../components/core/Form";
import { Show, useContext } from "solid-js";
import { PageContext } from "../../../lib/Record";
import { MenuIcon } from "../../../components/MenuIcon";

export function Navbar(props: DisplayComponentProps) {
 let { events } = useContext(PageContext);

 return (
  <nav
   class="bg:white box-shadow:1|1|10|#ddd p:10 flex jc:space-between ai:center">

   <Show when={props.meta?.P.props?.menuPosition === "left" || !props.meta?.P.props?.menuPosition}>
    <MenuIcon icon="mdi:hamburger-menu" onclick={() => {events?.setSideBarOpen((v: any) => !v);}}/>
   </Show>

   <div>{props.meta?.P?.props.title}</div>

   {/* Actions */}
   <div class="flex ai:center jc:center gap:8">

    <div class="cursor:pointer">
     <Icon icon="material-symbols:search" width={20} />
    </div>

    <Show when={props.meta?.P.props?.menuPosition === "right"}>
     <MenuIcon icon="mdi:hamburger-menu" onclick={() => {events?.setSideBarOpen((v: any) => !v);}}/>
    </Show>

   </div>

  </nav>
 );
}
