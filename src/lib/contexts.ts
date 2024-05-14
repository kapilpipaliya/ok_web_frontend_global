import { createContext, createSignal } from "solid-js";
import { Id, Vertex } from "~/lib/graph/graph";

export const LoadingContext = createContext(createSignal(false));

export const NewTxnIdContext = createContext(1);

export const HoverIdContext = createContext(createSignal<Id>(-1));

export const SelectedCollContext = createContext(createSignal({ vertexId: -1 }));

export const SelectedIdContext = createContext(createSignal<Id>(-1));

export const TargetIdContext = createContext(createSignal<Id>(-1));

export const HiddenNodesContext = createContext(createSignal([] as Id[]));

export const SelectedComponentContext = createContext(createSignal({
    vertexId: -1
}));

export const DraggedVertexContext = createContext(createSignal<Vertex | null>(null));

export const IndicatorPositionContext = createContext(createSignal({
    activeItem: null as null | Id, position: null as "before" | "after" | "center" | null
}));