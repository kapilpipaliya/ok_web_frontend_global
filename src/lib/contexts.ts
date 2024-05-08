import { createContext, createSignal } from "solid-js";

export const LoadingContext = createContext(createSignal(false));
