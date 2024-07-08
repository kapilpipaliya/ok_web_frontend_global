import { Icon } from "@iconify-icon/solid";
import { type Accessor, Show, createMemo } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { iconMap } from "~/lib/constants";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { nameExpr } from "./utils/nameExpr";

export function TreeItemContent(props: Readonly<{ collapsedKeys: Accessor<Id[]>; metaVertex: Vertex; toggleExpand: (itemId: Id) => void; }>) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() => getChildrenAttrs(graph, setGraph, props.metaVertex));
  const getComponent = () => getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P.name as string;

  return <div
    class={`${!children().length ? "bl:1px|dashed|black pl:10" : ""}`}
    style="display: flex;align-items: center;"
  >
    &nbsp;
    <Show when={children().length}>
      <button
        class="cursor:pointer"
        onClick={(e) => {
          e.stopPropagation();
          props.toggleExpand(props.metaVertex.id);
        }}

      >
        <Icon
          class={"transform 2s ease-in-out"}
          icon="mingcute:down-fill"
          style={{
            "margin-top": "7px",
            transform: `${props.collapsedKeys().includes(props.metaVertex.id)
              ? "rotate(0deg)"
              : "rotate(180deg)"}`,
            transition: "transform 0.2s linear",
          }} />
      </button>
    </Show>
    &nbsp;
    <Icon
      height={17}
      icon={iconMap[getComponent()] ??
        "material-symbols:widgets-outline-rounded"}
      width={17} />
    &nbsp;&nbsp;
    {nameExpr(props.metaVertex, getComponent())}
  </div>;
}
