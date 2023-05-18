import { Icon } from "@iconify-icon/solid";
import { ComponentProps } from "../../../utils/Form";

export function Navbar(props: ComponentProps & { isSideBarOpen: any; setSideBarOpen: any }) {
  const { isSideBarOpen, setSideBarOpen } = props;

  return (
    <nav class="bg:white box-shadow:1|1|10|#ddd p:10 flex jc:space-between ai:center">
      <div>AVF App</div>

      {/* Actions */}
      <div class="flex ai:center jc:center gap:8">
        <div class="cursor:pointer">
          <Icon icon="material-symbols:search" width={20} />
        </div>
        <div
          class="cursor:pointer"
          onclick={() => {
            console.log("clicked");
            props.setSideBarOpen((v) => !v);
          }}
        >
          <Icon icon="mdi:hamburger-menu" width={25} height={25} />
        </div>
      </div>
    </nav>
  );
}
