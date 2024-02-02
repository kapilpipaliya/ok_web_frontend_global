import { createMemo } from 'solid-js';

import { SimpleElement } from './SimpleElement';
import { NodeId } from '../interfaces';
import { NodeElement } from '../nodes/NodeElement';
import { useInternalNode } from '../nodes/useInternalNode';

export const DefaultRender = () => {
  const { type, props, nodes, hydrationTimestamp } = useInternalNode(
    (node) => ({
      type: node.data.type,
      props: node.data.props,
      nodes: node.data.nodes,
      hydrationTimestamp: node._hydrationTimestamp,
    })
  );

  const render = createMemo(() => {
    let childrenContent;

    if (nodes && nodes.length > 0) {
      childrenContent = (
        <>
          {nodes.map((id: NodeId) => (
            <NodeElement id={id} key={id} />
          ))}
        </>
      );
    } else {
      childrenContent = props.children;
    }

    if (typeof type === 'string') {
      // Assuming SimpleElement is adapted to SolidJS
      return <SimpleElement render={() => childrenContent} />;
    } else {
      // Dynamically render component based on 'type'
      const DynamicComponent = type;
      return <DynamicComponent {...props}>{childrenContent}</DynamicComponent>;
    }
  });

  return render();
};
