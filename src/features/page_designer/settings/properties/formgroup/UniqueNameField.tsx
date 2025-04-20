import type { FormStoreObject } from "~/components/form/context/FormContext";

import { DynamicComponent } from "~/components/form/DynamicComponent";
import { uniqueNameKey } from "~/features/page_designer/constants/constant";
import { isUniqueIdUsed } from "~/features/page_designer/functions/form/generateFormMetaAttributes";
import { IdAttr, type Vertex } from "~/lib/graph/graph";
import { useGraph } from "~/lib/graph/GraphContext";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex";

import { useDesignerFormIdContext } from "../../../context/LayoutContext";
import { Label } from "./Label";
import { css } from "~/lib/styles";
import { As } from "~/components/As";

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
    <As as="div"
      css={css`
    ${props.selectedLayout?.P[props.meta.P[IdAttr]] !== undefined && props.selectedLayout?.P[props.meta.P[IdAttr]] !== null ? `
  border: 2px solid #008000;
  border-bottom: none;
  border-top: none;
  padding: 2px 3px;
  border-radius: 5px;
` : ""}
  display: flex;
  align-items: center;
  gap: 2px;
  justify-content: space-between;
  margin-top: 6px;
`}
  >
      <As as="span" css={css`
  font-size: 15px;
  flex: 0.5;
`}>
        <Label meta={props.meta} />
      </As>
      <As as="span" css={css`
  font-size: 15px;
  flex: 1;
`}>
        <DynamicComponent
          data={props.selectedLayout}
          isNoPermissionCheck={true}
          isRealTime={false}
          meta={props.meta}
          noLabel
          onChange={(data: string) => setUniqueNameValue(props.meta, data)}
          txnId={0}
        />
      </As>
    </As>
  );
}
