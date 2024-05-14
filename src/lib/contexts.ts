import { createContext, createSignal } from "solid-js";

export const LoadingContext = createContext(createSignal(false));

export const NewTxnIdContext = createContext(1);
