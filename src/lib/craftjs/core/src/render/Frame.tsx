import { deprecationWarning, ROOT_NODE } from "@craftjs/utils/src";

import { Accessor, children, Component, createEffect, JSXElement, Show } from "solid-js";
import { useInternalEditor } from "../editor/useInternalEditor";
import { SerializedNodes } from "../interfaces";
import { NodeElement } from "../nodes/NodeElement";

export type FrameProps = {
  json?: string;
  data?: string | SerializedNodes;
};

const RenderRootNode = () => {
  const { timestamp } = useInternalEditor((state) => ({
    timestamp: state.nodes[ROOT_NODE] && state.nodes[ROOT_NODE]._hydrationTimestamp,
  }));

  return (
    <Show when={timestamp}>
      <NodeElement id={ROOT_NODE} />
    </Show>
  );
};

/**
 * A React Component that defines the editable area
 */
export const Frame: Component<FrameProps & { children?: JSXElement }> = (props) => {
  const { actions, query } = useInternalEditor();

  if (!!props.json) {
    deprecationWarning("<Frame json={...} />", {
      suggest: "<Frame data={...} />",
    });
  }

  let isInitialChildrenLoadedRef = false;

  const resolvedChildren = children(() => props.children) as Accessor<any>;

  createEffect(() => {
    const { initialChildren, initialData } = {
      initialChildren: resolvedChildren(),
      initialData: props.data || props.json,
    };

    if (initialData) {
      actions.history.ignore().deserialize(initialData);
      return;
    }

    // Prevent recreating Nodes from child elements if we already did it the first time
    // Usually an issue in React Strict Mode where this hook is called twice which results in orphaned Nodes
    const isInitialChildrenLoaded = isInitialChildrenLoadedRef;

    if (!initialChildren || isInitialChildrenLoaded) {
      return;
    }

    let rootNode: JSXElement;
    if (Array.isArray(initialChildren) && initialChildren.length === 1) {
      rootNode = initialChildren[0]; // Assuming the child is a JSX element
    } else {
      throw new Error("Expected exactly one child.");
    }

    const node = query.parseReactElement(rootNode).toNodeTree((node, jsx) => {
      if (jsx === rootNode) {
        node.id = ROOT_NODE;
      }
      return node;
    });

    actions.history.ignore().addNodeTree(node);
    isInitialChildrenLoadedRef = true;
  });

  return <RenderRootNode />;
};
