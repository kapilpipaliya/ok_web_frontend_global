import { Icon } from "@iconify-icon/solid";
import { createSignal, For } from "solid-js";

import { LoaderNew } from "./LoaderSimple";

interface TableTabProps {
  setActiveTab?: (tab: string) => string;
  tabs: string[];
}

export function TableTabs(props: Readonly<TableTabProps>) {
  const [currentTab, setCurrentTab] = createSignal<string>(props.tabs[0]);

  const dynamicIcon = (key: string) => {
    const icons: { [key: string]: string } = {
      Attribute: "carbon:data-1",
      Events: "codicon:symbol-method",
      Permission: "icon-park-outline:permissions",
      Properties: "carbon:logical-partition",
      Rules: "carbon:subnet-acl-rules",
      Transform: "icon-park-outline:transform",
      "Unique Constrain": "material-symbols:inbox-customize-outline",
    };
    return icons[key] ? (
      <Icon height={22} icon={icons[key]} width={22} />
    ) : (
      <div />
    );
  };

  const handleTabClick = (item: string) => {
    if (props.setActiveTab) {
      props.setActiveTab(item);
    }
    setCurrentTab(item);
  };

  return (
    <div class="flex bb:#E0E0E0 border-bottom:0.7 flex:row gap-x:30 mt:1rem overflow:auto">
      <For each={props.tabs} fallback={<LoaderNew loaderHeight="55vh" />}>
        {(item) => (
          <button
            classList={{
              "bb:2px|solid|#37c": currentTab() === item,
              "bb:2px|solid|lightgrey:hover": true,
              "color:slategray f:14": currentTab() !== item,
              "cursor:pointer": true,
              "f:16": currentTab() === item,
              "p:5|0": true,
            }}
            id={`tabletab-${item}`}
            onClick={() => handleTabClick(item)}
            type="button"
          >
            <div class="flex ai:center cursor:pointer f:15 font-weight:bold">
              {dynamicIcon(item)}&nbsp;{item}
            </div>
          </button>
        )}
      </For>
    </div>
  );
}
