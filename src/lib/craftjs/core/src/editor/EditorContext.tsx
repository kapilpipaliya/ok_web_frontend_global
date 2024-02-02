import { createContext } from "solid-js";

import { EditorStore } from './store';

export type EditorContextType = EditorStore;
export const EditorContext = createContext<EditorContextType>(null);
