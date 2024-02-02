import { JSXElement } from 'solid-js';

import { Node } from '../interfaces';

export function mapChildrenToNodes(
  children: JSXElement[] | JSXElement | string,
  cb: (JSX: JSXElement | string) => Node
): Node[] {
  // Ensure children is always an array
  const childrenArray = Array.isArray(children) ? children : [children];

  return childrenArray.reduce((result: Node[], child: JSXElement | string) => {
    const node = cb(child);
    result.push(node);
    return result;
  }, []);
}
