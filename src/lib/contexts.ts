import { createContext, createSignal } from "solid-js";
import type { Id, Vertex } from "~/lib/graph/graph";
import type { IFormContext } from "./Utils";
import { createStore } from "solid-js/store";
import { getNewGraphId } from "./graph/transaction";

export const LoadingContext = createContext(createSignal(false));
export const IsPreviewContext = createContext(createSignal(false));
export const NewTxnIdContext = createContext(1);

export const HoverIdContext = createContext(createSignal<Id | number>(-1));

export const SelectedCollContext = createContext(
  createSignal({ vertexId: -1 as Id | number }),
);

export const SelectedIdContext = createContext(createSignal<Id | number>(-1));

export const TargetIdContext = createContext(createSignal<Id | number>(-1));

export const ShowDrawerContext = createContext(createSignal<boolean>(false));

export const HiddenNodesContext = createContext(createSignal([] as Id[]));

export const FormSettingsContext = createContext(
  createStore(
    {} as {
      labelPosition: string;
      labelColor: string;
      inputBackground: string;
    },
  ),
);

export const SelectedComponentContext = createContext(
  createSignal({
    vertexId: -1 as Id | number,
  }),
);

export const PropertiesVertexIdContext = createContext(
  createSignal(getNewGraphId()),
);

export const DraggedVertexContext = createContext(
  createSignal<Vertex[] | []>([]),
);

export const PageConfigContext = createContext(
  createStore({} as { formData: IFormContext }),
);

export const IndicatorPositionContext = createContext(
  createSignal({
    activeItem: null as null | Id,
    position: null as "before" | "after" | "center" | null,
  }),
);
