import { Icon } from "@iconify-icon/solid";
import { graph } from "neo4j-driver";
import { useContext } from "solid-js";
import { SelectedComponentContext, SelectedIdContext } from "~/lib/contexts";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext } from "~/lib/graph/graph";

export function PropertiesHeader(props: { setShowDrawer: (show: boolean) => void }) {
    const [graph, setGraph] = useContext(GraphContext)!;
    const [selectedId, setSelectedId] = useContext(SelectedIdContext);
    const [selectedComponent, setSelectedComponent] = useContext(SelectedComponentContext);
    
    const getComponentName = () =>
        (selectedId() !== -1 && selectedComponent().vertexId !== -1) ? graph.vertexes[selectedComponent().vertexId].P.name || "" : "";
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
                {getComponentName()} Properties
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
