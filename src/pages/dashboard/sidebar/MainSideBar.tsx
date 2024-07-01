import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, type Setter, Show } from "solid-js";

import logo from "~/assets/graphics/sidebarLogo.svg";

type MainSideBarProps = {
  activeSection: Accessor<string>;
  isCollapsed: Accessor<boolean>;
  mainIcon: any;
  navData: any;
  setActiveSection: Setter<string>;
  toggleCollapse: () => void;
};

export const MainSideBar = (props: MainSideBarProps) => {
  return (
    <div
      class="rel bg:#E5EAFE r:0|15|15|0"
      style={
        "display: flex; padding-bottom: 2rem; flex-direction: column; align-items: center; width: 4rem; height: 100vh"
      }
    >
      <nav style="display: flex; margin-top: 1rem; padding-top: .5rem; flex-direction: column; flex: 1 1 0%; align-items: center;">
        <a href="/">
          <img alt="logo" src={logo} style="height: 35px; " />
        </a>
        <div class="flex flex-direction:column gap:10 mt:20">
          <For each={props.navData}>
            {(navNode) => (
              <Show when={navNode.P.url !== "undefined"}>
                <a
                  class={`${
                    props.activeSection() === navNode.P.name
                      ? "bg:white color:#37c"
                      : ""
                  } gap:10 `}
                  href={navNode.P.url}
                  onClick={() => props.setActiveSection(navNode.P.name)}
                  style={
                    "display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; "
                  }
                >
                  <Icon
                    color={`${
                      props.activeSection() === navNode.P.name
                        ? "#3B82F6"
                        : "#4B5563"
                    }`}
                    height={24}
                    icon={props.mainIcon[navNode.P.url]}
                    width={24}
                  />
                </a>
              </Show>
            )}
          </For>
          <Icon
            class="abs b:1px|solid|lightgrey bg:#f3f3f4 cursor:pointer p:3 r:50% right:-13px text:center top:2px"
            height={19}
            icon={
              !props.isCollapsed()
                ? "mingcute:arrows-left-line"
                : "mingcute:arrows-right-line"
            }
            onClick={props.toggleCollapse}
            style={{
              "box-shadow": "1px 0px 9px darkgrey",
              color: "rgb(161,161,169)",
            }}
            width={19}
          />
        </div>
      </nav>
    </div>
  );
};
