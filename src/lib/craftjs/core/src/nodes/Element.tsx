import { ERROR_TOP_LEVEL_ELEMENT_NO_ID, useEffectOnce } from "@craftjs/utils/src";

import invariant from "tiny-invariant";

import { NodeElement } from "./NodeElement";
import { useInternalNode } from "./useInternalNode";

import { ComponentProps, JSXElement, Show, createSignal } from "solid-js";
import { useInternalEditor } from "../editor/useInternalEditor";
import { NodeId } from "../interfaces";

export const defaultElementProps = {
  is: "div",
  canvas: false,
  custom: {},
  hidden: false,
};

export const elementPropToNodeData = {
  is: "type",
  canvas: "isCanvas",
};

export type ElementProps<T extends string> = {
  id?: NodeId;
  is?: T;
  custom?: Record<string, any>;
  children?: JSXElement;
  canvas?: boolean;
} & ComponentProps<T>;

export function Element<T extends string>({ id, children, ...elementProps }: ElementProps<T>) {
  const { is } = {
    ...defaultElementProps,
    ...elementProps,
  };

  const { query, actions } = useInternalEditor();
  const { node, inNodeContext } = useInternalNode((node) => ({
    node: {
      id: node.id,
      data: node.data,
    },
  }));

  const [linkedNodeId, setLinkedNodeId] = createSignal<NodeId | null>(null);

  useEffectOnce(() => {
    invariant(!!id, ERROR_TOP_LEVEL_ELEMENT_NO_ID);
    const { id: nodeId, data } = node;

    if (inNodeContext) {
      let linkedNodeId;

      const existingNode = data.linkedNodes && data.linkedNodes[id] && query.node(data.linkedNodes[id]).get();

      // Render existing linked Node if it already exists (and is the same type as the JSX)
      if (existingNode && existingNode.data.type === is) {
        linkedNodeId = existingNode.id;
      } else {
        // otherwise, create and render a new linked Node
        const linkedElement = <Element {...elementProps}>{children}</Element>;

        const tree = query.parseReactElement(linkedElement).toNodeTree();

        linkedNodeId = tree.rootNodeId;
        actions.history.ignore().addLinkedNodeFromTree(tree, nodeId, id);
      }

      setLinkedNodeId(linkedNodeId);
    }
  });

  return (
    <Show when={linkedNodeId()}>
      <NodeElement id={linkedNodeId()} />
    </Show>
  );
}
