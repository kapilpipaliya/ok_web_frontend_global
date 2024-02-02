import { Component, JSXElement, createContext, useContext } from 'solid-js';

import { NodeId } from '../interfaces';

export type NodeContextType = {
  id: NodeId;
  related?: boolean;
};

export const NodeContext = createContext<NodeContextType>(null);

export type NodeProviderProps = Omit<NodeContextType, 'connectors'>;

export const NodeProvider: Component<
  NodeProviderProps & {children?: JSXElement}
> = ({ id, related = false, children }) => {
  return (
    <NodeContext.Provider value={{ id, related }}>
      {children}
    </NodeContext.Provider>
  );
};
