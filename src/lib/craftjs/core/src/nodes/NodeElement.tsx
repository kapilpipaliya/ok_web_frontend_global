import { JSXElement } from 'solid-js';

import { NodeProvider } from './NodeContext';
import { NodeId } from '../interfaces';
import { RenderNodeToElement } from '../render/RenderNode';

export type NodeElementProps = {
  id: NodeId;
  render?: JSXElement;
};

export const NodeElement = (props: NodeElementProps) => {

  return (
    <NodeProvider id={props.id}>
      <RenderNodeToElement render={props.render} />
    </NodeProvider>
  );
};
