import type { Accessor } from "solid-js";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { isUniqueIdUsed } from "~/components/page_designer/functions/getChildrenAttrs";
import { IdAttr, type Vertex, useGraph } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/vertex";

import { useDesignerLayoutStore } from "../../../LayoutContext";
import { Label } from "./Label";

export function UniqueNameField(
  props: Readonly<{
    id: string;
    meta: Accessor<Vertex>;
    metaVertex: Vertex;
    selectedLayout: Vertex;
    setValue: (meta: Vertex, data: any) => void;
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
            layoutStore.formData.formData,
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
        return props.setValue(metaVertex, data);
      } else {
        return mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: "Name is required",
        });
      }
    }
    mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
      error: null,
    });
    return props.setValue(metaVertex, data);
  }
  return (
    <div
      class={`${props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.metaVertex.P[IdAttr]] !== null ? "b:2px|solid|#008000 bb:none bt:none p:2|3 r:5px" : ""} flex ai:center gap:2 justify-content:space-between mt:6`}
    >
      <span class="f:15 flex:.5" id={props.id}>
        <Label metaVertex={props.metaVertex} />
      </span>
      <span class="f:15 flex:1">
        <DynamicComponent
          component={"TextBox"}
          data={props.selectedLayout}
          isRealTime={false}
          meta={props.meta()}
          setValue={(data: string) =>
            setUniqueNameValue(props.metaVertex, data)
          }
          txnId={0}
        />
      </span>
    </div>
  );
}
