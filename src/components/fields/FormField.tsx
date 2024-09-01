import { onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { generateFormMetaAttributes } from "~/components/page_designer/functions/getChildrenAttrs";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { IdAttr, useGraph } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { FormContext, type FormStoreObject } from "../form/FormContext";
import { usePageRenderContext } from "../page_attr_render/PageRenderContext";

export function FormField(
  props: Readonly<
    {
      // For Root Level Forms we use Parent vertex label as form key
      label?: string;
      submitButton?: any;
    } & GenericComponentProps
  >,
) {
  const [graph, setGraph] = useGraph();
  const [previewStore] = usePreviewContext();
  const [parentItems] = usePageRenderContext();
  const meta = () => getLastItem(parentItems!.vertexes)!;
  const data = () => getLastItem(parentItems!.data)!;
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = graph.newTxnId;

  // const [dataVertex, setDataVertex] = createSignal<Vertex>();
  // const [metaVertex, setMetaVertex] = createSignal<Vertex>();

  const formFieldStore = createStore({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  } as unknown as FormStoreObject);
  const [formData, setFormData] = formFieldStore;

  if (data()?.id) {
    setFormData({
      formData: data(),
      formMeta: meta(),
      txnId,
    });
  } else {
    const form = generateFormMetaAttributes(graph, () => {}, meta());
    const defaultValues = form.attributes.reduce(
      (acc, attr) => {
        acc[attr.key] = attr.defaultValue;
        return acc;
      },
      {} as { [key: string]: any },
    );
    const createResult = createForm(
      graph,
      setGraph,
      txnId,
      props.label ?? previewStore.previewMeta?.P[IdAttr] ?? meta().P[IdAttr],
      defaultValues,
    );
    if (createResult.error) {
      return createResult.error;
    }
    setFormData({
      formData: createResult.vertex!,
      formMeta: meta(),
      txnId,
    });
  }

  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || []) {
      revertTransaction(rowMetaTxnId, graph);
    }
  });

  return (
    <FormContext.Provider value={formFieldStore}>
      <div class="">
        <PageAttrRender data={formData.formData} metaVertex={meta()} />
      </div>
      <div />
    </FormContext.Provider>
  );
}
