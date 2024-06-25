import { createSignal, For } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import { LoaderNew } from "./LoaderSimple";

interface TableTabProps {
  tabs: string[];
  setActiveTab?: (tab: string) => string;
}

export function TableTabs(props: TableTabProps) {
  const [currentTab, setCurrentTab] = createSignal<string>(props.tabs[0]);

  const dynamicIcon = (name: string) => {
    const icons: { [key: string]: string } = {
      Properties: "carbon:logical-partition",
      Events: "codicon:symbol-method",
      Attribute: "carbon:data-1",
      Rules: "carbon:subnet-acl-rules",
      Transform: "icon-park-outline:transform",
      Permission: "icon-park-outline:permissions",
      "Unique Constrain": "material-symbols:inbox-customize-outline",
    };
    return icons[name] ? <Icon icon={icons[name]} height={22} width={22} /> : <div />;
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
            id={`tabletab-${item}`}
            style={{
              "border-bottom": currentTab() === item ? "2px solid #37c" : '',
            }}
            class={`${currentTab() === item ? 'f:16' : 'f:14 color:slategray'} p:5|0 bb:2px|solid|lightgrey:hover cursor:pointer`}
            onClick={() => handleTabClick(item)}
          >
            <div
              style={{
                cursor: "pointer",
                "align-items": "center",
                "font-weight": "bold",
                display: "flex",
              }}
              class={"f-15"}
            >
              {dynamicIcon(item)}&nbsp;{item}
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
