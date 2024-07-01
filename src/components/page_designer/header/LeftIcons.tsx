import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";

import logo from "~/assets/graphics/sidebarLogo.svg";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";

export const LeftIcons = () => {
  const navigate = useNavigate();
  return (
    <div class="flex ai:center">
      <button
        class="bg:rgb(255,253,253,.5) flex ai:center jc:center bg:rgb(232,229,229):hover r:5|5|5|5 h:30px w:30px cursor:pointer"
        onclick={() => navigate(removeLastPathSegment())}
        title="Back"
      >
        <Icon
          class={"color:black:hover color:lightgrey"}
          height={30}
          icon={"flowbite:caret-left-outline"}
          width={30} />
      </button>
      <a href="/">
        <img alt="logo" src={logo} style="height: 35px;" />
      </a>
    </div>
  );
};
