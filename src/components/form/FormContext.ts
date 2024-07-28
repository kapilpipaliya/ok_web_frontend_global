import { createContext, useContext } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

export interface IFormContext {
    cleanUpConfig: () => { [key: string]: any };
    formData: Vertex;
    formMeta: Vertex;
    groupByTabsAndGroup: {
      [tab: string]: {
        [group: string]: Vertex[];
      };
    };
    metaTxnId: number;
    tabs: string[];
    txnId: number;
  }

export const FormContext = createContext({} as IFormContext);

export const useFormContext = () => useContext(FormContext);