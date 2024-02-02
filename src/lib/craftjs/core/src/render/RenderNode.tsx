import { Component, JSXElement, Show } from 'solid-js';

import { DefaultRender } from './DefaultRender';

import { useInternalEditor } from '../editor/useInternalEditor';
import { useInternalNode } from '../nodes/useInternalNode';

type RenderNodeToElementType = {
  render?: JSXElement;
};
export const RenderNodeToElement: Component<
  RenderNodeToElementType & {children?: JSXElement}
> = ({ render }) => {
  const { hidden } = useInternalNode((node) => ({
    hidden: node.data.hidden,
  }));

  const { onRender: OnRenderComponent } = useInternalEditor((state) => ({
    onRender: state.options.onRender,
  }));
  
  // don't display the node since it's hidden
  return <Show when={!hidden}>
      <OnRenderComponent render={render || <DefaultRender />} />
    </Show>;
};
