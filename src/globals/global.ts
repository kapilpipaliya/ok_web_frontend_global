import {driver as createDriver} from "neo4j-driver";
import {createContext, createSignal} from "solid-js";
import {RuntimeCSS} from "@master/css-runtime";
export const isIntegerId = true;
export const driver = createDriver("bolt://65.109.174.193:1102", undefined,
  isIntegerId ? {disableLosslessIntegers: true} : undefined
);

export  const LoadingContext = createContext(createSignal(false));
