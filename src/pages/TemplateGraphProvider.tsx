import { ParentProps } from "solid-js";

import { KeyedContext } from "~/components/fields/KeyedContext";
import { createAppState } from "~/createAppState";
import { GetInitialData } from "~/GetInitialData";
import { GraphContext } from "~/lib/graph/graph";

export const TemplateGraphProvider = (props: ParentProps) => {
  const graph = createAppState();
  graph[1]("url", "fetchTemplate");

  return (
    <KeyedContext context={graph} name="templateGraph">
      <GraphContext.Provider value={graph}>
        <GetInitialData/>
      </GraphContext.Provider>
      {props.children}
    </KeyedContext>
  );
};
