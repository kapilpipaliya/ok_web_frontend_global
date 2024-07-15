import { ZIndex } from "~/components/ZIndex";
import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../LayoutContext";
import { CloseIconTopRight } from "./CloseIconTopRight";
import { FormElementTabs } from "./FormElementTabs";

export function FormElementsWrapper() {
  const [graph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
  return (
    <aside class={"rel"} classList={{
        "hidden": !layoutStore.isRightOpen
      }}
    >
      <ZIndex>
        <CloseIconTopRight
          onClick={() => setLayoutStore("isLeftOpen", false)}
        />
      </ZIndex>
      <div
        class={
          `scrollbar-color:lightgrey scrollbar-width:thin flex border:1|solid|lightgrey flex:column h:calc(100vh-${graph.navBarHeight + 10}px) m:5 overflow:auto p:5 r:5|5|5|5`
        }
      >
        <FormElementTabs />
      </div>
    </aside>
  );
}
