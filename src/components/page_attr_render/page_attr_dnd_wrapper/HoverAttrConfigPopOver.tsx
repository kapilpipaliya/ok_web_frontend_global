import { Icon } from "@iconify-icon/solid";
import { useContext } from "solid-js";

import { useZIndex } from "~/components/ZIndex";
import { Tooltip } from "~/components/solid_blocks";
import { iconMap } from "~/lib/constants";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { GraphContext, type Vertex } from "~/lib/graph/graph";

export const HoverAttrConfigPopOver = (props: { item: Vertex; }) => {
  const zIndex = useZIndex();
  const [graph] = useContext(GraphContext)!;
  const getComponentName = () => getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;
  return (
    <span class="position:relative ">
      <div class={`flex ai:center bg:rgb(37,99,235) bottom:100% color:white p:0.25rem position:absolute r:5px|5px|0px|0px right:0 z:${zIndex}`}>
        <Icon class="flex" icon={iconMap[getComponentName()]} />
        <Tooltip content={"Name"} nowrap>
          <div class="lh:1.25rem f:0.875rem ml:5px mr:5px">
            {getComponentName()}
          </div>
        </Tooltip>
      </div>
    </span>
  );
};
