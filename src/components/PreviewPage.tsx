
import { createSignal, For, type JSX } from "solid-js";

import { IconButton } from "./IconButton";

const PreviewPage = (props: Readonly<{children: JSX.Element}>) => {
  const [view, setView] = createSignal("Desktop");

  const _handleViewChange = (newView: string) => {
    setView(newView);
  };
  const views = [
    { icon: true, key: "prime:mobile", value: "Mobile" },
    { icon: true, key: "uil:tablet", value: "Tablet" },
    { icon: true, key: "humbleicons:desktop", value: "Desktop" },
  ];
  return (
    <div class="flex ai:center bg:gray-100 flex:col min-h:100vh p:5|20">
      <div class="flex mb:16">
        <For each={views}>
          {(viewData, index) => (
            <IconButton
              classList={{
                "bg:#E0E7F3 color:#5252F1": viewData.value === view(),
                "color:grey": viewData.value !== view(),
                "r:0|5|5|0": index() === 2,
                "r:5|0|0|5": index() === 0,
                "rel b:1px|solid|lightgrey color:rgb(17,24,39) cursor:default f:0.875rem font-weight:600 px:0.75rem py:0.5rem": true,
              }}
              icon={viewData.key}
              onclick={() => setView(viewData.value)}
              size={22}
              title={viewData.value}
            />

          )}
        </For>
      </div>
      <div class="flex ai:center h:full jc:center w:full">
        <div
          classList={{
            "b:1px|solid|lightblue r:5 overflow:auto": true,
            "h:90vh": view() !== "Mobile" && view() !== "Tablet",
            "h:calc(100vh-130px)": view() === "Mobile" || view() === "Tablet",
            "w:375px": view() === "Mobile",
            "w:768px": view() === "Tablet",
            "w:full": view() === "Desktop",
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
