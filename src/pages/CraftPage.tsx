import {
  Editor,
  Frame,
  UserComponent,
  useNode,
  Node,
  useEditor,
  Element
} from "@craftjs/core/src";
import "./styles.css";

const Column: UserComponent = (props) => {
  const {
    connectors: { connect, drag }
  } = useNode();

  return (
    <div
      ref={(ref) => {
        connect(drag(ref));
      }}
      style={{
        padding: "1rem",
        margin: "0.25rem",
        border: "1px dashed blue",
        "flex-grow": 1
      }}
    >
      {props.children}
    </div>
  );
};

Column.craft = {
  name: "Column"
};

const ColumnLayout: UserComponent = ({ children }) => {
  const {
    id,
    connectors: { connect }
  } = useNode();
  const { actions, query } = useEditor();

  const deleteLastColumn = () => {
    const item = query.node(id);

    const descendants = item.descendants();
    if (descendants.length > 0) {
      const lastChildId = descendants[descendants.length - 1];
      actions.delete(lastChildId);
    }
  }

  const appendColumn = () => {
    const freshNode = query
      .parseReactElement(<Column>New column</Column>)
      .toNodeTree();
    actions.addNodeTree(freshNode, id);
  }

  return (
    <div
      ref={connect}
      style={{
        padding: "1rem",
        border: "1px dashed red",
        "margin-bottom": "1rem",
        display: "flex",
        flexDirection: "row"
      }}
    >
      {children}
      <div>
        <button type="button" onClick={deleteLastColumn}>
          Delete last column
        </button>
        <button type="button" onClick={appendColumn}>
          Append column
        </button>
      </div>
    </div>
  );
};

ColumnLayout.craft = {
  name: "ColumnLayout",
  rules: {
    canMoveIn: (selectedNode: Node) => {
      debugger
      return selectedNode.data.displayName === "Column";
    }
  }
};

const CreateColumnLayout: UserComponent = () => {
  const { connectors } = useEditor();

  return (
    <button
      ref={(ref) => {
        connectors.create(
          ref,
          <Element canvas is={ColumnLayout}>
            <Element canvas is={Column}>
              1
            </Element>
            <Element canvas is={Column}>
              2
            </Element>
            <Element canvas is={Column}>
              3
            </Element>
          </Element>
        );
      }}
    >
      ColumnLayout
    </button>
  );
};

export function CraftPage() {
  return (
    <div class="App">
      <Editor resolver={{ ColumnLayout }}>

      </Editor>
    </div>
  );
}
