import { toTitle } from "case-switcher-js";

import { IdAttr, type Vertex } from "~/lib/graph/graph";

export function Label(props: Readonly<{ metaVertex: Vertex }>) {
  return (
    <>
      {toTitle(
        props.metaVertex.P.displayName ||
          props.metaVertex.P[IdAttr] ||
          props.metaVertex.P.key ||
          "",
      )}
    </>
  );
}
