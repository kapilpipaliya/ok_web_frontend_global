
import { FormElementTabs } from "./FormElementTabs";
import { Icon } from "@iconify-icon/solid";
import { useDesignerLayoutStore } from "../LayoutContext";

function CloseIconTopRight(props: Readonly<{ onClick: () => void }>) {
  return <div class="flex ai:center jc:space-between position:relative">
    <Icon
      class="cursor:pointer bg:white:hover position:absolute top:0 right:0 z:2"
      onClick={props.onClick}
      icon={"iconamoon:close-duotone"}
      height={30}
      width={30}
      style={{ color: "#c1c1c1" }}
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
            "scrollbar-width": "thin",
            "scrollbar-color": "lightgrey",
          }}
        >
          <CloseIconTopRight onClick={() => setLayoutStore("isLeftOpen", false)} />
          <FormElementTabs/>
        </div>
      </div>
    </nav>
  );
}
