

import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../context/LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";
import { OpenComponentURL } from "../../OpenComponentURL";

export function PropertiesHeader() {
  const [graph] = useGraph();
  const [layoutStore, setLayoutStore] = useDesignerLayoutStore();

  const getComponentName = () =>
    layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1
      ? graph.vertexes[layoutStore.selectedComponent].P.key || ""
      : "";
  return (
    <div class="flex ai:center cursor:pointer jc:space-between">
      <div class="f:16 flex:grow font-weight:bold mb:2px ml:5px p:3|0 text-align:left">
        {getComponentName()} Properties{" "}
        <OpenComponentSettings id={layoutStore.selectedComponent as string} />
        <OpenComponentURL
          meta={graph.vertexes[layoutStore.selectedComponent]}
        />
      </div>
    </div>
  );
}
