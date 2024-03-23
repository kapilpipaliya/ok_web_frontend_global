import {createSelector, createSignal} from "solid-js";
import {Id} from "../lib/graph";

export const [hoverId, setHoverId] = createSignal<Id>(-1);
export const [selectedId, setSelectedId] = createSignal<Id>(-1);
export const [hiddenNodes, setHiddenNodes] = createSignal([] as Id[]);

