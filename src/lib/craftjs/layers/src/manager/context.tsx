import { SubscriberAndCallbacksFor } from "@craftjs/utils/src";
import { createContext } from "solid-js";

import { LayerMethods } from "./actions";

export type LayerStore = SubscriberAndCallbacksFor<typeof LayerMethods>;
export type LayerManagerContextType = {
  store: LayerStore;
};

export const LayerManagerContext = createContext<LayerManagerContextType>({} as LayerManagerContextType);
