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
    switch (name) {
      case "Properties":
        return <Icon icon="carbon:logical-partition" height={22} width={22}/>;
      case "Events":
        return <Icon icon="codicon:symbol-method" height={22} width={22} />;
      case "Attribute":
        return <Icon icon="carbon:data-1" height={22} width={22} />;
      case "Rules":
        return <Icon icon="carbon:subnet-acl-rules" height={22} width={22} />;
      case "Transform":
        return <Icon icon="icon-park-outline:transform" height={22} width={22} />;
      case "Permission":
        return <Icon icon="icon-park-outline:permissions" height={22} width={22} />;
      case "Unique Constrain":
        return <Icon icon="material-symbols:inbox-customize-outline" height={22} width={22} />;
      default:
        return <div />;
    }
  };

  return (
    <div class="flex flex:row gap-x:30 border-bottom:0.7 bb:#E0E0E0 mt:1rem overflow:auto">
      <For each={props.tabs} fallback={<LoaderNew loaderHeight="55vh" />}>
        {(item) => (
          <div
            id={`tabletab-${item}`}
            style={{
              "border-bottom":
                currentTab() === `${item}`
                  ? "2px solid #37c":'',
            }}
            class={`${currentTab() === item
            ? 'f:16':'f:14 color:slategray'} p:5|0 bb:2px|solid|lightgrey:hover cursor:pointer`}
            onClick={() => {
              if (props.setActiveTab) {
                props.setActiveTab(item);
              }
              setCurrentTab(item);
            }}
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
