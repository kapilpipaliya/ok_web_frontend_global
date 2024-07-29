
import { onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { GenericComponentProps } from "~/components/fields/FieldType";

import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import {
  generateFormMetaAttributes,
} from "~/components/page_designer/functions/getChildrenAttrs";
import { IdAttr, useGraph } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { FormContext, type IFormContext } from "../form/FormContext";


export function FormField(
  props: Readonly<{
    // For Root Level Forms we use Parent vertex label as form name
    label?: string;
    submitButton?: any;
  } & GenericComponentProps>,
) {
  const [graph, setGraph] = useGraph();
  const { previewData, previewMeta } = usePreviewContext();
  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = graph.newTxnId;

  // const [dataVertex, setDataVertex] = createSignal<Vertex>();
  // const [metaVertex, setMetaVertex] = createSignal<Vertex>();

  const [formData, setFormData] = createStore({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  } as unknown as IFormContext);

  if (!props.data?.id) {
    const form = generateFormMetaAttributes(graph, () => { }, props.meta);
    const defaultValues = form.attributes.reduce(
      (acc, attr) => {
        acc[attr.name] = attr.defaultValue;
        return acc;
      },
      {} as { [key: string]: any },
    );
    const createResult = createForm(
      graph,
      setGraph,
      txnId,
      props.label ?? previewMeta?.P[IdAttr] ?? props.meta.P[IdAttr],
      defaultValues,
    );
    if (createResult.error) return createResult.error;
    setFormData({
      formData: createResult.vertex!,
      formMeta: props.meta,
      groupByTabsAndGroup: {},
      tabs: [],
      txnId,
    });

  } else {
    setFormData({
      formData: props.data,
      formMeta: props.meta,
      groupByTabsAndGroup: {},
      tabs: [],
      txnId,
    });
  }

  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
  });

  return (
    <FormContext.Provider value={formData}>
      <div class="">
        <PageAttrRender data={formData.formData} metaVertex={props.meta} />
      </div>
      <div />
    </FormContext.Provider>
  );
}
