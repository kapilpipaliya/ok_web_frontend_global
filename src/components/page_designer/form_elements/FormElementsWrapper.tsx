
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
          class={"flex-col  border:1|solid|lightgrey h:100vh m:5 overflow:auto r:5|5|5|5"}
          style={{
            "max-height": "calc(100vh - 120px)",
            "scrollbar-color": "lightgrey",
            "scrollbar-width": "thin",
          }}
        >
          <ZIndex>
            <ZIndex>
              <CloseIconTopRight onClick={() => setLayoutStore("isLeftOpen", false)} />
            </ZIndex>
              <FormElementTabs />
          </ZIndex>
        </div>
      </div>
    </nav>
  );
}
