import { Icon } from "@iconify-icon/solid";

import { useZIndex } from "~/components/fields/ZIndex";
import { getComponentLabel } from "~/features/page_designer/functions/getComponentLabel";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { iconMap } from "~/lib/ui/iconMap";

import { ComponentName } from "./ComponentName";
import {ICON_BUTTON_STYLES} from "~/pages/settings/constants";

export const HoverAttrConfigPopOver = (props: Readonly<{ item: Vertex }>) => {
  const zIndex = useZIndex();
  const [graph] = useGraph();
  const getComponentName = () => getComponentLabel(graph, props.item);
  return (
    <span class="position:relative ">
      <div
        class={`flex ai:center bg:primary-40 bottom:100% color:base-5 p:0.25rem position:absolute r:5px|5px|0px|0px right:0 z:${zIndex}`}
      >
        <Icon
          class={`${ICON_BUTTON_STYLES.base} ${ICON_BUTTON_STYLES.default}`}
          icon={iconMap[getComponentName() as keyof typeof iconMap]}
          noobserver
        />
        <ComponentName componentName={getComponentName()!} />
      </div>
    </span>
  );
};
