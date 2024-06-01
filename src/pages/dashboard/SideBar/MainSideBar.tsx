import { Icon } from "@iconify-icon/solid";
import { type Accessor, For, Resource, type Setter, Show } from "solid-js";
import logo from "~/assets/graphics/sidebarLogo.svg";

type MainSideBarProps = {
  activeSection: Accessor<string>;
  setActiveSection: Setter<string>;
  navData: any;
  mainIcon: any;
  isCollapsed: Accessor<boolean>;
  toggleCollapse: () => void;
};

export const MainSideBar = (props: MainSideBarProps) => {
  return (
    <div
      class="rel bg:#E5EAFE r:0|15|15|0"
      style={"display: flex; padding-bottom: 2rem; flex-direction: column; align-items: center; width: 4rem; height: 100vh"}
    >
      <nav style="display: flex; margin-top: 1rem; padding-top: .5rem; flex-direction: column; flex: 1 1 0%; align-items: center;">
        <a href="/">
          <img style="height: 35px; " src={logo} alt="logo" />
        </a>
        <div class="flex flex-direction:column gap:10 mt:20">
          <For each={props.navData}>
            {(navNode) => (
              <Show when={navNode.P.url !== "undefined"}>
                <a
                  class={`${props.activeSection() === navNode.P.name ? "bg:white color:#37c" : ""} gap:10 `}
                  href={navNode.P.url}
                  style={"display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; "}
                  onClick={() => props.setActiveSection(navNode.P.name)}
                >
                  <Icon
                    color={`${props.activeSection() === navNode.P.name ? "#3B82F6" : "#4B5563"}`}
                    icon={props.mainIcon[navNode.P.url]}
                    height={24}
                    width={24}
                  />
                </a>
              </Show>
            )}
          </For>
          <Icon
            height={19}
            width={19}
            icon={
              !props.isCollapsed()
                ? "mingcute:arrows-left-line"
                : "mingcute:arrows-right-line"
            }
            style={{
              "box-shadow": "1px 0px 9px darkgrey",
              color: "rgb(161,161,169)",
            }}
            class="b:1px|solid|lightgrey abs bg:#f3f3f4 r:50% top:2px right:-13px p:3 cursor:pointer text:center"
            onClick={props.toggleCollapse}
          />
        </div>
      </nav>
    </div>
  );
};
