import { DynamicComponent } from "~/components/form/DynamicComponent";
import { isUniqueIdUsed } from "~/components/page_designer/functions/getChildrenAttrs";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { useDesignerLayoutStore } from "../../../LayoutContext";
import { Label } from "./Label";

export function UniqueNameField(
  props: Readonly<{
    meta: Vertex;
    onChange: (meta: Vertex, data: any) => void;
    selectedLayout: Vertex;
    txnId: number;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const [layoutStore] = useDesignerLayoutStore();
  function setUniqueNameValue(metaVertex: Vertex, data: string) {
    if (metaVertex.P.name === "name") {
      if (data.length) {
        if (
          isUniqueIdUsed(
            graph,
            setGraph,
            layoutStore.formStore[0].formData,
            props.selectedLayout,
            data,
          )
        ) {
          return mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: "Name is not unique",
          });
        }
        mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: null,
        });
        return props.onChange(metaVertex, data);
      }
      return mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
        error: "Name is required",
      });
    }
    mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
      error: null,
    });
    return props.onChange(metaVertex, data);
  }
  return (
    <div
      class={`${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5">
        <Label meta={props.meta} />
      </span>
      <span class="f:15 flex:1">
        <DynamicComponent
          componentName={"TextBox"}
          data={props.selectedLayout}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={props.meta}
          onChange={(data: string) => setUniqueNameValue(props.meta, data)}
          txnId={0}
        />
      </span>
    </div>
  );
}
