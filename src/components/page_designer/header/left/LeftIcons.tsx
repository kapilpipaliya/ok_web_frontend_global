import { Icon } from "@iconify-icon/solid";
import { useNavigate } from "@solidjs/router";

import logo from "~/assets/graphics/sidebarLogo.svg";
import { removeLastPathSegment } from "~/lib/removeLastPathSegment";

export const LeftIcons = () => {
  const navigate = useNavigate();
  return (
    <div class="flex ai:center">
      <button
        class="flex ai:center bg:rgb(255,253,253,.5) bg:rgb(232,229,229):hover cursor:pointer h:30px jc:center r:5|5|5|5 w:30px"
        onclick={() => navigate(removeLastPathSegment())}
        title="Back"
      >
        <Icon
          class={"color:lightgrey color:black:hover"}
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
