import { Icon } from "@iconify-icon/solid";
import { useContext } from "solid-js";
import { GraphContext } from "~/lib/graph/graph";
import { OpenComponentSettings } from "../../OpenComponentSettings";
import { useDesignerLayoutStore } from "../../LayoutContext";

export function PropertiesHeader(props: Readonly<{ setShowDrawer: (show: boolean) => void }>) {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [layoutStore] = useDesignerLayoutStore();
    
    const getComponentName = () =>
        (layoutStore.selectedId !== -1 && layoutStore.selectedComponent !== -1) ? graph.vertexes[layoutStore.selectedComponent].P.name || "" : "";
    return (
        <div
            style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                cursor: "pointer",
            }}
        >
            <div
                class="mb:2px ml:5px p:3|0 f:16"
                style="flex-grow: 1; font-weight: bold;text-align-last: left;"
            >
                {getComponentName()} Properties <OpenComponentSettings id={layoutStore.selectedComponent as string} />
            </div>
            <Icon
                onclick={() => props.setShowDrawer(false)}
                icon={"iconamoon:close-light"}
                class="bg:#ededed:hover r:50%"
                height={24}
                width={24}
                style={{ color: "lightgray", cursor: "pointer" }}
            />
        </div>
    );
}
