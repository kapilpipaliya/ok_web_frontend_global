import { useNavigate } from "@solidjs/router";
import { Show } from "solid-js";

import logo from "~/assets/graphics/sidebarLogo.svg";
import { IconButton } from "~/components/IconButton";
import { removeLastPathSegment } from "~/lib/url/removeLastPathSegment";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { LeftToggleButton } from "./LeftToggleButton";

export const LeftIcons = () => {
  const navigate = useNavigate();
  const [layoutStore] = useDesignerLayoutStore();
  return (
    <div class="flex ai:center">
      <IconButton
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer jc:center r:5|5|5|5"
        icon="flowbite:caret-left-outline"
        iconClass={"color:lightgrey color:black:hover"}
        onClick={() => navigate(removeLastPathSegment())}
        size={30}
        title="Back"
      />
      <a href="/admin">
        <img alt="logo" class="h:30px" src={logo} />
      </a>
      <Show when={!layoutStore.isLeftOpen || layoutStore.isSmallScreen}>
        <LeftToggleButton />
      </Show>
    </div>
  );
};
