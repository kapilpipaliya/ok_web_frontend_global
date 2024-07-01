import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";

import { LoaderNew } from "./LoaderSimple";

interface TableTabProps {
  setActiveTab?: (tab: string) => string;
  tabs: string[];
}

export function TableTabs(props: TableTabProps) {
  const [currentTab, setCurrentTab] = createSignal<string>(props.tabs[0]);

  const dynamicIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      Attribute: "carbon:data-1",
      Events: "codicon:symbol-method",
      Permission: "icon-park-outline:permissions",
      Properties: "carbon:logical-partition",
      Rules: "carbon:subnet-acl-rules",
      Transform: "icon-park-outline:transform",
      "Unique Constrain": "material-symbols:inbox-customize-outline",
    };
    return icons[name] ? <Icon height={22} icon={icons[name]} width={22} /> : <div />;
  };

  const handleTabClick = (item: string) => {
    if (props.setActiveTab) {
      props.setActiveTab(item);
    }
    setCurrentTab(item);
  };

  return (
    <div class="flex flex:row gap-x:30 border-bottom:0.7 bb:#E0E0E0 mt:1rem overflow:auto">
      <For each={props.tabs} fallback={<LoaderNew loaderHeight="55vh" />}>
        {(item) => (
          <div
            class={`${currentTab() === item ? 'f:16' : 'f:14 color:slategray'} p:5|0 bb:2px|solid|lightgrey:hover cursor:pointer`}
            id={`tabletab-${item}`}
            onClick={() => handleTabClick(item)}
            style={{
              "border-bottom": currentTab() === item ? "2px solid #37c" : '',
            }}
          >
            <div
              class={"f-15"}
              style={{
                "align-items": "center",
                cursor: "pointer",
                display: "flex",
                "font-weight": "bold",
              }}
            >
              {dynamicIcon(item)}&nbsp;{item}
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
