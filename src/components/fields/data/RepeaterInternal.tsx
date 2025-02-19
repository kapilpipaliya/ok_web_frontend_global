import type { Vertex } from "~/lib/graph/graph";

import {
  RepeaterVertexContext,
  useRepeaterVertexContext,
} from "~/features/page_attr_render/context/PageAttrContext";
import { PageAttrRender } from "~/features/page_attr_render/PageAttrRender";
import { isVertex } from "~/lib/graph/mutate/vertex";

export function RepeaterInternal(props: {
  data: any;
  index: number;
  meta: Vertex;
  name: string;
  repeaterValue: any;
}) {
  const context = useRepeaterVertexContext();
  const repeaterStore = new Proxy(context, {
    get(target, key) {
      if (key === props.name) {
        return props.repeaterValue;
      }
      if (key === `${props.name}Index`) {
        return props.index;
      }
      return target[key];
    },
  });
  return (
    <RepeaterVertexContext.Provider value={repeaterStore}>
      <PageAttrRender
        data={isVertex(props.repeaterValue) ? props.repeaterValue : props.data}
        metaVertex={props.meta}
      />
    </RepeaterVertexContext.Provider>
  );
}
