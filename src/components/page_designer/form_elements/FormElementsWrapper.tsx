
import { Icon } from "@iconify-icon/solid";

import { useDesignerLayoutStore } from "../LayoutContext";
import { FormElementTabs } from "./FormElementTabs";

function CloseIconTopRight(props: Readonly<{ onClick: () => void }>) {
  return <div class="flex ai:center jc:space-between position:relative">
    <Icon
      class="bg:white:hover cursor:pointer position:absolute right:0 top:0 z:2"
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
          class={"flex-col  border:1|solid|lightgrey direction:rtl h:100vh m:5 overflow:auto r:5|5|5|5"}
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
