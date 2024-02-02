import { JSX } from 'solid-js';

import { createNode } from './createNode';
import { Node } from '../interfaces';

export function parseNodeFromJSX(
  jsx: JSX.Element | string,
  normalize?: (node: Node, jsx: JSX.Element) => void
) {
  // In SolidJS, JSX elements are already functions or strings, so no need to transform them
  let actualType = typeof jsx === 'string' ? 'text' : 'element';

  return createNode(
   {
      data: {
        type: actualType,
        props: { ...element.props },
      },
    },
    (node) => {
      if (normalize) {
        normalize(node, jsx);
      }
    }
  );
}
