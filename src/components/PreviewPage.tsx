import { Icon } from "@iconify-icon/solid";
import { For, createSignal } from "solid-js";

import { Tooltip } from "./solid_blocks";

const PreviewPage = (props: any) => {
  const [view, setView] = createSignal("Desktop");

  const handleViewChange = (newView: string) => {
    setView(newView);
  };
  const views = [
    { icon: true, key: "prime:mobile", value: "Mobile" },
    { icon: true, key: "uil:tablet", value: "Tablet" },
    { icon: true, key: "humbleicons:desktop", value: "Desktop" },
  ];
  return (
    <div class="flex flex:col ai:center bg:gray-100 p:5|20 min-h:100vh">
      <div class="flex mb:16">
        <For each={views}>
          {(viewData, index) => (
            <Tooltip content={viewData.value} position={"s"}>
              <button
                class={`rel d:inline-flex ai:center px:0.75rem py:0.5rem f:0.875rem font-weight:600 color:rgb(17,24,39) b:1px|solid|lightgrey cursor:default z:10:focus ${index() === 0 ? "r:5|0|0|5" : index() === 2 ? "r:0|5|5|0" : ""
                  }`}
                onclick={() => setView(viewData.value)}
                style={{
                  "background-color": viewData.value === view() ? "#E0E7F3" : "",
                  color: viewData.value === view() ? "#5252F1" : "grey",
                }}
                type="button"
              >
                <Icon height={22} icon={viewData.key} width={22} />
              </button>
            </Tooltip>
          )}
        </For>
      </div>
      <div class="w:full h:full flex ai:center jc:center">
        <div 
          class={`w:${view() === 'Mobile' ? '375px' : view() === 'Tablet' ? '768px' : 'full'} 
                 h:${view() === 'Mobile' || view() === 'Tablet' ? 'calc(100vh-130px)' : '90vh'} 
                 overflow:auto b:1px|solid|lightblue r:5 `}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
