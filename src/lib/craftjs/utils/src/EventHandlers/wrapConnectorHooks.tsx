// https://github.com/react-dnd/react-dnd
import invariant from 'tiny-invariant';

import { ChainableConnectors, ConnectorsRecord } from './interfaces';
import { JSXElement } from 'solid-js';

export function wrapHookToRecognizeElement(
  hook: (node: any, ...args: any[]) => void
) {
  return (elementOrNode = null, ...args: any) => {
    // When passed a node, call the hook straight away.
    // if (!isValidElement(elementOrNode)) {
      if (!elementOrNode) {
        return;
      }

      const node = elementOrNode;
      node && hook(node, ...args);
      return node;
    // }
  };
}

// A React wrapper for our connectors
// Wrap all our connectors so that would additionally accept JSXElement
export function wrapConnectorHooks<H extends ConnectorsRecord>(
  connectors: H
): ChainableConnectors<H, JSXElement | HTMLElement> {
  return Object.keys(connectors).reduce((accum, key) => {
    accum[key] = wrapHookToRecognizeElement((...args) => {
      // @ts-ignore
      return connectors[key](...args);
    });

    return accum;
  }, {}) as any;
}
