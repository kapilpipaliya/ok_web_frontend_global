import { createContext } from "solid-js";
import { AlertMessage } from "../types/Type";
import { SetStoreFunction, Store } from "solid-js/store";

export const AlertMessageContext = createContext(
  {} as {
    alerts: Store<AlertMessage[]>;
    setAlert: SetStoreFunction<AlertMessage[]>;
  },
);
