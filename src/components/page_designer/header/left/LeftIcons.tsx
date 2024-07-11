import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import logo from "~/assets/graphics/sidebarLogo.svg";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { LeftToggleButton } from "./LeftToggleButton";

export const LeftIcons = () => {
  const navigate = useNavigate();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class="flex ai:center">
      <button
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer jc:center r:5|5|5|5"
        onclick={() => navigate(removeLastPathSegment())}
        title="Back"
      >
        <Icon
          class={"color:lightgrey color:black:hover"}
          height={30}
          icon={"flowbite:caret-left-outline"}
          width={30}
        />
      </button>
      <a href="/">
        <img alt="logo" class="h:35px" src={logo} />
      </a>
      <Show when={!layoutStore.isLeftOpen || layoutStore.isSmallScreen}>
        <LeftToggleButton />
      </Show>
    </div>
  );
};
