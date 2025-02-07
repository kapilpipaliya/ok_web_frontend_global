import { Icon } from "@iconify-icon/solid";
import {
  type Accessor,
  createContext,
  createSignal,
  type JSX,
  type Setter,
  Show,
  useContext,
} from "solid-js";

import { evalExpression } from "~/lib/expression_eval";
import { type Id, useGraph, type Vertex } from "~/lib/graph/graph";

export const treeContext = createContext<[Accessor<Id[]>, Setter<Id[]>] | null>(
  null,
);
const [expandedItems, setExpandedItems] = createSignal(new Set());

// Function to toggle the expansion of a tree node
const toggleExpansion = (id: Id) => {
  const expandedSet = new Set(expandedItems());
  if (expandedSet.has(id)) {
    expandedSet.delete(id);
  } else {
    expandedSet.add(id);
  }
  setExpandedItems(expandedSet);
};

export function TreeView(
  props: Readonly<{ children: JSX.Element; meta: Vertex; title: string }>,
) {
  let parentValues = useContext(treeContext);
  const [graph, setGraph] = useGraph();
  // Recursive function to render tree nodes
  const RenderTreeNode = (TreeItemProps: any) => {
    const isExpanded = () => expandedItems().has(props.meta.id);
    const childrenLength = () =>
      evalExpression("->Attr", {
        graph,
        vertexes: [props.meta],
      })?.length || 0;
    return (
      <div class={`ml:${isExpanded() ? "50px" : "0px"};`}>
        <span class={"display:inline-flex"}>
          <Show when={childrenLength() > 0}>
            <span
              onClick={() => toggleExpansion(props.meta.id)}
              style="cursor: pointer;"
            >
              <Icon
                class="flex-1"
                icon={"mdi:chevron-right"}
                noobserver
                style={{
                  "border-radius": "50%",
                  "font-size": "24px",
                  transform: `${
                    isExpanded() ? "rotate(90deg)" : "rotate(0deg)"
                  }`,
                  transition: "transform 0.2s linear",
                }}
              />
            </span>
          </Show>
          {TreeItemProps.title}
        </span>
        {isExpanded() && <span class={"ml:40px"}>{props.children}</span>}
      </div>
    );
  };

  if (parentValues) {
    parentValues[1]((prev) => [...prev, props.meta.id]);
  } else {
    parentValues = createSignal([props.meta.id]);
  }

  return (
    <treeContext.Provider value={parentValues}>
      <RenderTreeNode title={props.title} />
    </treeContext.Provider>
  );
}
