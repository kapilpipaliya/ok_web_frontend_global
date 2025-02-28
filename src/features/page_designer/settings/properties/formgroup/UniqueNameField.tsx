import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { isUniqueIdUsed } from "~/features/page_designer/functions/generateFormMetaAttributes";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../../../context/LayoutContext";
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

  const formStoreId = useDesignerFormIdContext();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;

  function setUniqueNameValue(metaVertex: Vertex, data: string) {
    if (metaVertex.P.key === uniqueNameKey) {
      if (data.length) {
        if (
          isUniqueIdUsed(
            graph,
            setGraph,
            graph.vertexes[formStoreVertex()?.P.formDataId!],
            props.selectedLayout,
            data,
          )
        ) {
          mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: "Name is not unique",
          });
        } else {
          mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
            error: null,
          });
        }
      } else {
        mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
          error: "Name is required",
        });
      }
    } else {
      mergeVertexProperties(0, metaVertex.id, graph, setGraph, {
        error: null,
      });
    }
    props.onChange(metaVertex, data);
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
          data={props.selectedLayout}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={props.meta}
          noLabel
          onChange={(data: string) => setUniqueNameValue(props.meta, data)}
          txnId={0}
        />
      </span>
    </div>
  );
}
