import { createContext, createSignal } from "solid-js";
import type { Id, Vertex } from "~/lib/graph/graph";
import { createStore } from "solid-js/store";

export const LoadingContext = createContext(createSignal(false));
export const IsPreviewContext = createContext(createSignal(false));


export const HoverIdContext = createContext(createSignal<Id | number>(-1));

export const SelectedCollContext = createContext(
  createSignal({ vertexId: -1 as Id | number }),
);

export const SelectedIdContext = createContext(createSignal<Id | number>(-1));

export const DragOverTargetIdContext = createContext(
  createSignal<Id | number>(-1),
);

export const ShowDrawerContext = createContext(createSignal<boolean>(false));

export const HiddenNodesContext = createContext(createSignal([] as Id[]));

export interface FormSettings {
  labelPosition: string;
  labelColor: string;
  inputBackground: string;
  activeStepId: Id | number;
  prevTxnIds: Array<Id | number>;
}

export const FormSettingsContext = createContext(
  createStore( {} as FormSettings ),
);

export const SelectedComponentContext = createContext(
  createSignal({
    vertexId: -1 as Id | number,
  }),
);

export const DraggedVertexContext = createContext(
  createSignal<Vertex[] | []>([]),
);

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

export interface IPageConfig { formData: IFormContext }

export const PageConfigContext = createContext(
  createStore({} as IPageConfig),
);

export interface IIndicatorPosition {
  activeItem: null | Id;
  position: null | "before" | "after" | "center" | "left" | "right";
}

export const IndicatorPositionContext = createContext(
  createSignal({
    activeItem: null,
    position: null,
  } as IIndicatorPosition),
);

export const FormContext = createContext({} as IFormContext);
export const PageContext = createContext({} as { [key: string]: any });