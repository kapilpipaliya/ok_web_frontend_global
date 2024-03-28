import {Accessor, createContext, createSignal, Setter, Show, useContext} from "solid-js";
import {Id, Vertex} from "../../../lib/graph";
import {getChildVertexes} from "../../../lib/Utils";
import {Icon} from "@iconify-icon/solid";

export const treeContext = createContext<null | [Accessor<Id[]>, Setter<Id[]>]>(null);
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

const TreeView = (props: { title: string, meta: Vertex, children: any }) => {
    let parentValues = useContext(treeContext);

    // Recursive function to render tree nodes
    const RenderTreeNode = (TreeItemProps: any) => {
        const isExpanded = () => expandedItems().has(props.meta.id);
        const childrenLength = () => getChildVertexes(["Attr"], [props.meta]).vertexes?.length || 0;
        return (
            <div>
          <span class={`display:inline-flex pr:${childrenLength() > 0 ? "40px" : ""}`}>
              <Show when={childrenLength() > 0}>

                  <span
                      onClick={() => toggleExpansion(props.meta.id)}
                  >+&nbsp;&nbsp;</span>
              </Show>
              <span>{TreeItemProps.title}</span>
          </span>
                {isExpanded() && (
                    <span>
                        {props.children}
                    </span>
                )}
            </div>
        );
    };

    if (!parentValues) {
        parentValues = createSignal([props.meta.id]);
    } else {
        parentValues[1](prev => [...prev, props.meta.id]);
    }

    return <treeContext.Provider value={parentValues}>
        <RenderTreeNode title={props.title}/>
    </treeContext.Provider>
};

export default TreeView;
