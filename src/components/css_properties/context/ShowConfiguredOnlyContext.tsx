import { type Accessor, createContext } from "solid-js";

export const ShowConfiguredOnlyContext = createContext<Accessor<boolean>>(() => false);
