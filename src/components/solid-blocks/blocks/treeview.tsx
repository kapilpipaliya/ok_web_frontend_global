import {Accessor, createContext, createSignal, Setter, useContext} from "solid-js";
import {Id, Vertex} from "../../../lib/graph";

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

const TreeView = (props: {title: string, meta: Vertex, children: any}) => {
    let parentValues = useContext(treeContext);

    // Recursive function to render tree nodes
    const RenderTreeNode = (TreeItemProps: any) => {
        // const isExpanded = expandedItems().has(TreeItemProps.node.id);
        return (
            <div style={"padding: 10px;"}>
                <div>
          <span
              class="caret"
              onClick={() => toggleExpansion(TreeItemProps.node.id)}
              // classList={{ "caret-down": isExpanded }}
          >
            {TreeItemProps.title}
          </span>
                </div>
              <div style="padding-left: 20px;">
                     {props.children}
                    </div>
                {/*{isExpanded && (*/}
                {/*    <div style="padding-left: 20px;">*/}
                {/*      {TreeItemProps.children}*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        );
    };

    if (parentValues) {
      parentValues = createSignal([props.meta.id]);
    } else {
      parentValues![1](prev => [...prev, props.meta.id]);
    }

    return <treeContext.Provider value={}>
      <RenderTreeNode title={props.title}/>
    </treeContext.Provider>
};

      export default TreeView;
