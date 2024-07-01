import { Icon } from "@iconify-icon/solid";
import { useContext } from "solid-js";

import { GraphContext } from "~/lib/graph/graph";

import { useDesignerLayoutStore } from "../../LayoutContext";
import { OpenComponentSettings } from "../../OpenComponentSettings";

export function PropertiesHeader() {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [layoutStore, setLayoutStore] = useDesignerLayoutStore();
    
    const getComponentName = () =>
        (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) ? graph.vertexes[layoutStore.selectedComponent].P.name || "" : "";
    return (
        <div
            style={{
                "align-items": "center",
                cursor: "pointer",
                display: "flex",
                "justify-content": "space-between",
            }}
        >
            <div
                class="f:16 mb:2px ml:5px p:3|0"
                style="flex-grow: 1; font-weight: bold;text-align-last: left;"
            >
                {getComponentName()} Properties <OpenComponentSettings id={layoutStore.selectedComponent as string} />
            </div>
            <Icon
                class="bg:#ededed:hover r:50%"
                height={24}
                icon={"iconamoon:close-light"}
                onclick={()=>setLayoutStore('showPropertiesDrawer', false)}
                style={{ color: "lightgray", cursor: "pointer" }}
                width={24}
            />
        </div>
    );
}
