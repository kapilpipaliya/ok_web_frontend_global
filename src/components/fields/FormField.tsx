import { createMemo, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { IdAttr, useGraph } from "~/lib/graph/graph";
import { createFormVertex } from "~/lib/graph/mutate/form/createForm";
import { setGraphData } from "~/lib/graph/mutate/setGraphData";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { FormContext, type FormStoreObject, useFormContext } from "../form/FormContext";
import { getFormData } from "../form/functions/getFormData";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { generateFormMetaAttributes } from "../page_designer/functions/generateFormMetaAttributes";

// TODO: make this update when props.id and props.label changes
export function FormField(
  props: Readonly<
    {
      id?: string;
      // For Root Level Forms we use Parent vertex label as form key
      label?: string;
      submitButton?: any;
    } & GenericComponentProps
  >,
) {
  const [graph, setGraph] = useGraph();
  const [previewStore] = usePreviewContext();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = graph.newTxnId();
  const [formStore] = useFormContext();

  const formFieldStore = createStore({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  } as unknown as FormStoreObject);
  const [formData, setFormData] = formFieldStore;

  const id = createMemo(() => props.id ?? formStore?.id());
  const label = createMemo(() => props.label ?? previewStore.previewMeta?.P[IdAttr] ?? meta().P[IdAttr]);
  
  const form = generateFormMetaAttributes(graph, () => {}, meta());
  setFormData("formMetaData", form);

  if (!id()) {
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
      formData.txnId,
      label(),
      defaultValues,
    );
    if (createResult.error) {
      setFormData("error", createResult.error);
      return;
    }
    setFormData({
      get formDataId() {
        return createResult.vertex!.id;
      },
      formMetaId: meta().id,
      txnId,
    });
  } else {
    loadData();
  }
  async function loadData() {
    if (!id()) {
      return;
    }
    try {
      const { data, error } = await getFormData(
        graph,
        formData.formMetaData!.attributes,
        id()!
      );

      if (error || !Array.isArray(data?.result) || data.result.length === 0) {
        setFormData("error", `No ${label()} found`);
        return;
      }

      setGraphData(graph, setGraph, data!.graph!);
      setFormData({
        get formDataId() {
          return data!.result[0].id;
        },
      });
    } catch (e: any) {
      setFormData("error", `Error When Loading Form: ${e.message}`);
    }
  }

  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || []) {
      revertTransaction(rowMetaTxnId, graph, setGraph);
    }
  });

  return (
    <FormContext.Provider value={formFieldStore}>
      <div class="">
        <PageAttrRender data={graph.vertexes[formData.formDataId!]} metaVertex={meta()!} />
      </div>
      <div />
    </FormContext.Provider>
  );
}
