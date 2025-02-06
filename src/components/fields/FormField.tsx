import { createMemo, onCleanup } from "solid-js";
import { v7 as uuidv7 } from "uuid";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { IdAttr, useGraph, type Vertex } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { addNewVertex, deleteVertex, mergeVertexProperties, newVertex } from "~/lib/graph/mutate/vertex";
import {generateNewTxnId} from "~/lib/graph/transaction/generateNewTxnId";

import { FormContext, type FormStoreObject, useFormContext } from "../form/context/FormContext";
import { getFormData } from "../form/functions/getFormData";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { generateFormMetaAttributes } from "../page_designer/functions/generateFormMetaAttributes";

// TODO: make this update when props.id and props.label changes
export function FormField(
  props: Readonly<
    GenericComponentProps & {
      id?: string;
      // For Root Level Forms we use Parent vertex label as form key
      label?: string;
      submitButton?: any;
    }
  >,
) {
  const [graph, setGraph] = useGraph();
  const [previewStore] = usePreviewContext();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;
  const txnId = generateNewTxnId(graph, setGraph);
  const formId = useFormContext();
  const formVertex = () => formId ? graph.vertexes[formId] as Vertex<FormStoreObject> : undefined;

  const pageFormVertexObject = newVertex(uuidv7(), ["PageForm"], {
    txnId,
  });

  addNewVertex(0, pageFormVertexObject, graph, setGraph);

  onCleanup(() => {
    deleteVertex(0, pageFormVertexObject.id, graph, setGraph);
  })

  const id = createMemo(() => props.id ?? formVertex()?.P.id);
  const label = createMemo(() => props.label ?? previewStore.previewMeta?.P[IdAttr] ?? meta().P[IdAttr]);
  
  const formStore = () => graph.vertexes[pageFormVertexObject.id] as Vertex<FormStoreObject>;
  const setFormStore = (key: string, value: any) => {
    mergeVertexProperties<FormStoreObject>(0, pageFormVertexObject.id, graph, setGraph, { [key]: value });
  };
  
  const form = generateFormMetaAttributes(graph, () => {}, meta());
  setFormStore("formMetaData", form);

  if (id()) {
    loadData();
  } else {
    const defaultValues = form.attributes.reduce(
      (acc, attr) => {
        acc[attr.key] = attr.defaultValue;
        return acc;
      },
      {} as { [key: string]: any },
    );
    const createResult = createFormVertex(
      graph,
      setGraph,
      formStore().P.txnId,
      label(),
      defaultValues,
    );
    if (createResult.error) {
      setFormStore("error", createResult.error);
      return;
    }
    mergeVertexProperties<FormStoreObject>(0, pageFormVertexObject.id, graph, setGraph, {
      formDataId: createResult.vertex!.id,
      formMetaId: meta().id,
      txnId,
    });
  }
  async function loadData() {
    if (!id()) {
      return;
    }
    try {
      const { data, error } = await getFormData(
        graph,
        formStore().P.formMetaData!.attributes,
        id()!
      );

      if (error || !Array.isArray(data?.result) || data.result.length === 0) {
        setFormStore("error", `No ${label()} found`);
        return;
      }

      setGraphData(graph, setGraph, data!.graph!);
      setFormStore("formDataId", data!.result[0].id);
    } catch (e: any) {
      setFormStore("error", `Error When Loading Form: ${e.message}`);
    }
  }

  return (
    <FormContext.Provider value={pageFormVertexObject.id}>
      <div class="">
        <PageAttrRender data={graph.vertexes[formStore().P.formDataId!]} metaVertex={meta()!} />
      </div>
      <div />
    </FormContext.Provider>
  );
}
