import { createContext, createSignal } from "solid-js";
import type { Id, Vertex } from "~/lib/graph/graph";

export const LoadingContext = createContext(createSignal(false));
export const IsPreviewContext = createContext(createSignal(false));

export interface IFormContext {
 cleanUpConfig: () => { [key: string]: any };
 validationGroup?: {};
 txnId: number;
 metaTxnId: number;
 formMeta: Vertex;
 formData: Vertex;
 tabs: string[];
  groupByTabsAndGroup: {
    [tab: string]: {
      [group: string]: Vertex[];
    };
  };
  changedIds: { vertexIds: Id[], edgeIds: Id[] };
}

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any });