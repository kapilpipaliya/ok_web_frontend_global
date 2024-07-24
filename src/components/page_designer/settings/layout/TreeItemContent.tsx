import { Icon } from "@iconify-icon/solid";
import { type Accessor, Show, createMemo } from "solid-js";

import { getChildrenAttrs } from "~/components/page_designer/functions/getChildrenAttrs";
import { iconMap } from "~/lib/constants";
import { getChildVertex } from "~/lib/graph/get/sync/traverse";
import { type Id, type Vertex, useGraph } from "~/lib/graph/graph";

import { nameExpr } from "../utils/nameExpr";

export function TreeItemContent(
  props: Readonly<{
    collapsedKeys: Accessor<Id[]>;
    metaVertex: Vertex;
    toggleExpand: (itemId: Id) => void;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const children = createMemo(() =>
    getChildrenAttrs(graph, setGraph, props.metaVertex),
  );
  const getComponent = () =>
    getChildVertex(graph, ["$0Comp"], props.metaVertex).vertex?.P
      .name as string;

  return (
    <div
      classList={{
        "bl:1px|dashed|black pl:10": !children().length,
        "d:flex ai:center": true,
      }}
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
            classList={{
              "mt:7px": true,
              "transform 2s ease-in-out": true,
              "transform:rotate(0deg)": props
                .collapsedKeys()
                .includes(props.metaVertex.id),
              "transform:rotate(180deg)": !props
                .collapsedKeys()
                .includes(props.metaVertex.id),
              "transition:transform 0.2s|linear": true,
            }}
            icon="mingcute:down-fill"
          />
        </button>
      </Show>
      &nbsp;
      <Icon
        height={17}
        icon={
          iconMap[getComponent() as keyof typeof iconMap] ?? "material-symbols:widgets-outline-rounded"
        }
        width={17}
      />
      &nbsp;&nbsp;
      {nameExpr(props.metaVertex, getComponent())}
    </div>
  );
}
