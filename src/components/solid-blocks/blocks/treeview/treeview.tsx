import {
  Accessor,
  createContext,
  createSignal,
  Setter,
  Show,
  useContext,
} from "solid-js";
import { GraphContext, Id, Vertex } from "~/lib/graph";
import { getChildVertexes } from "~/lib/Utils";
import { Icon } from "@iconify-icon/solid";

export const treeContext = createContext<null | [Accessor<Id[]>, Setter<Id[]>]>(
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

const TreeView = (props: { title: string; meta: Vertex; children: any }) => {
  let parentValues = useContext(treeContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  // Recursive function to render tree nodes
  const RenderTreeNode = (TreeItemProps: any) => {
    const isExpanded = () => expandedItems().has(props.meta.id);
    const childrenLength = () =>
      getChildVertexes(graph, ["Attr"], [props.meta]).vertexes?.length || 0;
    return (
      <div class={`ml:${isExpanded() ? "50px" : "0px"};`}>
        <span class={`display:inline-flex`}>
          <Show when={childrenLength() > 0}>
            <span
              style="cursor: pointer;"
              onClick={() => toggleExpansion(props.meta.id)}
            >
              <Icon
                icon={"mdi:chevron-right"}
                style={{
                  "font-size": "24px",
                  "border-radius": "50%",
                  transition: "transform 0.2s linear",
                  transform: `${
                    !isExpanded() ? "rotate(0deg)" : "rotate(90deg)"
                  }`,
                }}
                class="flex-1"
              />
            </span>
          </Show>
          {TreeItemProps.title}
        </span>
        {isExpanded() && <span class={`ml:40px`}>{props.children}</span>}
      </div>
    );
  };

  if (!parentValues) {
    parentValues = createSignal([props.meta.id]);
  } else {
    parentValues[1]((prev) => [...prev, props.meta.id]);
  }

  return (
    <treeContext.Provider value={parentValues}>
      <RenderTreeNode title={props.title} />
    </treeContext.Provider>
  );
};

export default TreeView;
