import { createSignal } from "solid-js";

const TreeView = ({ data }) => {
    const [expandedItems, setExpandedItems] = createSignal(new Set());

    // Function to toggle the expansion of a tree node
    const toggleExpansion = (id) => {
        const expandedSet = new Set(expandedItems());
        if (expandedSet.has(id)) {
            expandedSet.delete(id);
        } else {
            expandedSet.add(id);
        }
        setExpandedItems(expandedSet);
    };

    // Recursive function to render tree nodes
    const renderTreeNode = (node) => {
        const isExpanded = expandedItems().has(node.id);
        return (
            <div>
                <div>
          <span
              class="caret"
              onClick={() => toggleExpansion(node.id)}
              classList={{ "caret-down": isExpanded }}
          >
            {node.name}
          </span>
                </div>
                {isExpanded && (
                    <div style="padding-left: 20px;">
                        {node.children.map((child) => renderTreeNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return <div>{data.map((node) => renderTreeNode(node))}</div>;
};

export default TreeView;
