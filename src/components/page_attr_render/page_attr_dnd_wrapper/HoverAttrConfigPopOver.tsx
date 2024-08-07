import { Icon } from "@iconify-icon/solid";

import { useZIndex } from "~/components/ZIndex";
import { getChildVertex } from "~/lib/graph/get/sync/getChildVertex";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { ComponentName } from "./ComponentName";

export const HoverAttrConfigPopOver = (props: Readonly<{ item: Vertex }>) => {
  const zIndex = useZIndex();
  const [graph] = useGraph();
  const getComponentName = () =>
    getChildVertex(graph, ["$0Comp"], props.item).vertex?.P.name;
  return (
    <span class="position:relative ">
      <div
        class={`flex ai:center bg:rgb(37,99,235) bottom:100% color:white p:0.25rem position:absolute r:5px|5px|0px|0px right:0 z:${zIndex}`}
      >
        <Icon
          class="flex"
          icon={iconMap[getComponentName() as keyof typeof iconMap]}
        />
        <ComponentName componentName={getComponentName()} />
      </div>
    </span>
  );
};
