
import { Icon } from "@iconify-icon/solid";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormElementTabs } from "./FormElementTabs";

function CloseIconTopRight(props: Readonly<{ onClick: () => void }>) {
  return <div class="flex ai:center jc:space-between position:relative">
    <Icon
      class="cursor:pointer bg:white:hover position:absolute top:0 right:0 z:2"
      height={30}
      icon={"iconamoon:close-duotone"}
      onClick={props.onClick}
      style={{ color: "#c1c1c1" }}
      width={30}
    />
  </div>;
}

export function FormElementsWrapper() {
  const [_, setLayoutStore] = useDesignerLayoutStore();
  return (
    <nav
    >
      <div class={"rel"}>
        <div
          class={"h:100vh  flex-col overflow:auto border:1|solid|lightgrey m:5 r:5|5|5|5 direction:rtl"}
          style={{
            "max-height": "calc(100vh - 120px)",
            "scrollbar-color": "lightgrey",
            "scrollbar-width": "thin",
          }}
        >
          <CloseIconTopRight onClick={() => setLayoutStore("isLeftOpen", false)} />
          <FormElementTabs/>
        </div>
      </div>
    </nav>
  );
}
