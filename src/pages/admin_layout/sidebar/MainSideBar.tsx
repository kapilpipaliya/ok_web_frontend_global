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

/* deprecated */
export const MainSideBar = (props: Readonly<MainSideBarProps>) => {
  return (
    <nav class="flex rel align-items:center bg:#E5EAFE flex-direction:column flex:1 min-h:100vh pt:0.5rem r:0|15|15|0 w:4rem">
      <a href="/">
        <img alt="logo" src={logo} style="height: 35px; " />
      </a>
      <div class="flex flex-direction:column gap:10 mt:20">
        <For each={props.navData}>
          {(navNode) => (
            <Show when={navNode.P.url !== "undefined"}>
              <a
                class={`${
                  props.activeSection() === navNode.P.key
                    ? "bg:base-5 color:#37c"
                    : ""
                } gap:10 `}
                href={navNode.P.url}
                onClick={() => props.setActiveSection(navNode.P.key)}
                style={
                  "display: inline-block; padding: 5px 5px 0px 5px; transition-property: background-color, border-color, color, fill, stroke; transition-duration: 200ms; border-radius: 0.5rem; "
                }
              >
                <Icon
                  color={`${
                    props.activeSection() === navNode.P.key
                      ? "#3B82F6"
                      : "#4B5563"
                  }`}
                  height={24}
                  icon={props.mainIcon[navNode.P.url]}
                  noobserver
                  width={24}
                />
              </a>
            </Show>
          )}
        </For>
        <Icon
          class="abs b:1px|solid|lightgrey bg:#f3f3f4 cursor:pointer p:3 r:50% right:-13px text:center top:10px"
          height={19}
          icon={
            props.isCollapsed()
              ? "mingcute:arrows-right-line"
              : "mingcute:arrows-left-line"
          }
          noobserver
          onClick={props.toggleCollapse}
          style={{
            "box-shadow": "1px 0px 9px darkgrey",
            color: "rgb(161,161,169)",
          }}
          width={19}
        />
      </div>
    </nav>
  );
};
