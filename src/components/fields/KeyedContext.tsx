import type { ParentProps } from "solid-js";

import { createKeyedContext } from "@corvu/utils/create/keyedContext";

export function KeyedContext(
  props: ParentProps<{ context: any; name: string }>,
) {
  const SelectOptionContext = createKeyedContext(props.name);
  const contextValue =
    typeof props.context === "function" ? props.context() : props.context;

  return (
    <SelectOptionContext.Provider value={contextValue}>
      {props.children}
    </SelectOptionContext.Provider>
  );
}
