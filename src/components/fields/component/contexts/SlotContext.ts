import { createContext } from "solid-js";

export type SlotContextType = (props: { slot: string; class?: string }) => any

export const SlotContext = createContext<SlotContextType[]>([]);
