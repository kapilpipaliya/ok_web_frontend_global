import { NodeId } from "@craftjs/core";
import { EventHandlerConnectors } from "@craftjs/utils/src";
import React from "react";

import { LayerHandlers } from "../events/LayerHandlers";

export type LayerContextType = {
  id: NodeId;
  depth: number;
  connectors: EventHandlerConnectors<LayerHandlers, JSXElement>;
};

export const LayerContext = React.createContext<LayerContextType>({} as LayerContextType);
