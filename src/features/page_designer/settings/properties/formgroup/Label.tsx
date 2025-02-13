import { toTitle } from "case-switcher-js";

import { IdAttr, type Vertex } from "~/lib/graph/graph";

export function Label(props: Readonly<{ meta: Vertex }>) {
  return (
    <>
      {toTitle(
        props.meta.P.displayName ||
          props.meta.P[IdAttr] ||
          props.meta.P.key ||
          "",
      )}
    </>
  );
}
