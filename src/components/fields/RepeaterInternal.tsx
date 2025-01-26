import type { Vertex } from "~/lib/graph/graph";
import { isVertex } from "~/lib/graph/mutate/vertex";
import { useRepeaterVertexContext, RepeaterVertexContext } from "../page_attr_render/context/PageAttrContext";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";

export function RepeaterInternal(props: {
  meta: Vertex;
  data: any;
  index: number;
  repeaterValue: any;
}) {
  const context = useRepeaterVertexContext();
  const repeaterStore = new Proxy(context, {
    get(target, key) {
      if (key === props.meta.P.name) {
        return props.repeaterValue;
      }
      if (key === `${props.meta.P.name}Index`) {
        return props.index;
      }
      return target[key];
    },
  });
  return (
    <RepeaterVertexContext.Provider value={repeaterStore}>
      <PageAttrRender
        data={isVertex(props.repeaterValue) ? props.repeaterValue : props.data}
        metaVertex={props.meta} />
    </RepeaterVertexContext.Provider>
  );
}
