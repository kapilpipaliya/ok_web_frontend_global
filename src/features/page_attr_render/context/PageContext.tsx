import { createContext, useContext } from "solid-js";

// never use object as context, It's modified as Proxy letter, and then after it become proxy, it cant change and it keeps old data.
// use Record<string | symbol, any> instead
export const PageContext = createContext<Record<string | symbol, any>>();

export function usePageContext() {
  return useContext(PageContext);
}
