import { createContext } from "solid-js";
import { SetStoreFunction, Store } from "solid-js/store";
import {AlertMessage} from "../components/ComponentType";

export const AlertMessageContext = createContext(
  {} as {
    alerts: Store<AlertMessage[]>;
    setAlert: SetStoreFunction<AlertMessage[]>;
  },
);
