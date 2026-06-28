import { Show } from "solid-js";
import { untrack } from "solid-js";

import type { FormStoreObject } from "~/components/form/context/FormContext";

import { FunctionEditor } from "~/features/page_designer/settings/properties/FunctionEditor";
import { evalExpression } from "~/lib/expression_eval";
import { setSelectionValue } from "~/lib/graph/mutate/selection/setSelectionValue";
import { saveUndoPoint } from "~/lib/graph/transaction/steps/saveUndoPoint";

import {
  useDesignerFormIdContext,
  useDesignerLayoutStore,
  type PageLayoutObject,
} from "../../context/LayoutContext";
import { getPropertiesAttrId } from "../../functions/layout/layoutHoverState";
import { ComponentVariantsInput } from "./ComponentVariantsInput";
import { FormGroupProperties } from "./formgroup/FormGroupProperties";
import { mergeVertexProperties } from "~/lib/graph/mutate/core/vertex/mergeVertexProperties";
import type { Vertex } from "~/lib/graph/type/vertex";
import { useGraph } from "~/lib/graph/context/UseGraph";
import type { Id } from "~/lib/graph/type/id";
import { findVertexByLabelAndUniqueId } from "~/lib/graph/get/sync/entity/findVertex";

export function PropertiesBody(props: { openedFormId: Id }) {
  const [graph, setGraph] = useGraph();

  const formStoreId = useDesignerFormIdContext();
  const layoutStoreId = useDesignerLayoutStore();
  const formStoreVertex = () =>
    graph.vertexes[formStoreId!] as Vertex<FormStoreObject>;
  const layoutStore = () =>
    graph.vertexes[layoutStoreId]?.P as PageLayoutObject | undefined;
  const propertiesAttrId = () =>
    getPropertiesAttrId(formStoreVertex()?.P, layoutStore());
  const selectedAttr = () => graph.vertexes[propertiesAttrId()];
  const selectedComp = () =>
    selectedAttr()?.P.componentName
      ? findVertexByLabelAndUniqueId(
          graph,
          "Component",
          "key",
          selectedAttr().P.componentName,
        )
      : undefined;
  const clearFileSelection = (meta: Vertex) => {
    const txnId = formStoreVertex()?.P.txnId;
    if (!txnId) {
      return;
    }

    setSelectionValue(
      txnId,
      graph.vertexes[propertiesAttrId()],
      graph,
      setGraph,
      meta,
    );
  };

  const setPropertyValue = (meta: Vertex, value: unknown) => {
    const attrId = propertiesAttrId();
    if (attrId !== -1) {
      untrack(() => {
        mergeVertexProperties(
          formStoreVertex()?.P.txnId,
          graph.vertexes[attrId].id,
          graph,
          setGraph,
          {
            [meta.P.key]: value,
          },
        );
      });
      if (value === null) {
        clearFileSelection(meta);
      }
      saveUndoPoint(formStoreVertex()?.P.txnId, graph, setGraph);
    }
  };

  const selectedComponentProperties = () => {
    const compVertex = selectedComp();
    if (!compVertex) {
      return [];
    }
    return evalExpression("->$0Prop", {
      graph,
      setGraph,
      vertexes: [compVertex],
    });
  };

  return (
    <Show when={propertiesAttrId() !== -1 && selectedAttr()}>
      {/* <As as="div" css={`return \`._id {
  display: flex;
  gap: 2px;
  justify-content: start;
}\`;`}>
      <button onClick={toggleImportsModal}>Import HTML</As>
      </As> */}

      {/* <Show when={selectedAttr()?.P.componentName === "Data"}>
        <CollAndData />
      </Show> */}

      <FunctionEditor
        keyName="fns"
        label="fns"
        setPropertyValue={setPropertyValue}
        vertexId={propertiesAttrId()}
      />
      <FunctionEditor
        keyName="props"
        label="prop"
        setPropertyValue={setPropertyValue}
        vertexId={propertiesAttrId()}
      />

      <Show when={selectedAttr()?.P.componentName === "Component"}>
        <ComponentVariantsInput
          compVertex={selectedComp()}
          dataVertex={selectedAttr()}
          setPropertyValue={setPropertyValue}
        />
      </Show>

      <Show when={selectedAttr()?.L?.[0]?.endsWith("Attr")}>
        <FormGroupProperties
          metaAttributes={selectedComponentProperties() ?? []}
          onChange={setPropertyValue}
          openedFormId={props.openedFormId}
          selectedLayout={selectedAttr()}
          txnId={formStoreVertex()?.P.txnId}
        />
      </Show>
      {/* <JsonEditorFieldComponent 
        // height="400px" 
        replaceProperties={replacePropertiesValue}
      /> */}
    </Show>
  );
}
