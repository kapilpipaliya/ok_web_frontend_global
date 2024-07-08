import { Icon } from "@iconify-icon/solid";

import { useGraph } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";

export function PropertiesHeader() {
    const [graph, setGraph] = useGraph();
    const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
    
    const getComponentName = () =>
        (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) ? graph.vertexes[layoutStore.selectedComponent].P.name || "" : "";
    return (
        <div
            class="flex ai:center cursor:pointer jc:space-between"
        >
            <div
                class="f:16 flex:grow font-weight:bold mb:2px ml:5px p:3|0 text-align:left"
            >
                {getComponentName()} Properties <OpenComponentSettings id={layoutStore.selectedComponent as string} />
            </div>
            <Icon
                class="bg:#ededed:hover color:lightgray cursor:pointer r:50%"
                height={24}
                icon={"iconamoon:close-light"}
                onclick={()=>setLayoutStore('showPropertiesDrawer', false)}
                width={24}
            />
        </div>
    );
}
