
import { ZIndex } from "~/components/ZIndex";

import { useDesignerLayoutStore } from "../LayoutContext";
import { CloseIconTopRight } from "./CloseIconTopRight";
import { FormElementTabs } from "./FormElementTabs";

export function FormElementsWrapper() {
  const [, setLayoutStore] = useDesignerLayoutStore();
  return (
    <nav
    >
      <div class={"rel"}>
        <div
          // TODO Fix height
          class={"flex-col scrollbar-color:lightgrey scrollbar-width:thin border:1|solid|lightgrey h:100vh m:5 max-h:calc(100vh-120px) overflow:auto r:5|5|5|5"}
        >
          <ZIndex>
            <CloseIconTopRight onClick={() => setLayoutStore("isLeftOpen", false)} />
          </ZIndex>
          <FormElementTabs />
        </div>
      </div>
    </nav>
  );
}
