import { useNavigate } from "@solidjs/router";
import { Show, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

import type { GenericComponentProps } from "~/components/fields/ComponentType";

import { useToast } from "~/components/Toast";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import {
  getFormMetaData,
  isAnyFieldInvalid,
} from "~/components/page_designer/functions/getChildrenAttrs";
import { submitDataCall } from "~/lib/api/api_functions";
import { FormContext, type IFormContext } from "~/lib/contexts";
import { IdAttr, useGraph } from "~/lib/graph/graph";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

export function FormWrapper(
  props: {
    // For Root Level Forms we use Parent vertex label as form name
    label?: string;
    submitButton?: any;
  } & GenericComponentProps,
) {
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const navigate = useNavigate();

  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = graph.newTxnId;

  // const [dataVertex, setDataVertex] = createSignal<Vertex>();
  // const [metaVertex, setMetaVertex] = createSignal<Vertex>();

  const [formData, setFormData] = createStore({
    cleanUpConfig: () => cleanUpConfig,
    txnId,
  } as unknown as IFormContext);

  // if (!props.data?.id) {
  const form = getFormMetaData(graph, () => { }, props.meta);
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
    props.label ?? props.meta.P[IdAttr],
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

  // } else {
  //   const loadResult = loadForm(graph, props.id);
  //   if (loadResult.error) return loadResult.error;
  //   dataVertex = loadResult.vertex!;
  // }

  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();
  onCleanup(() => {
    for (const rowMetaTxnId of cleanUpConfig.rowMetaTxnIds || [])
      revertTransaction(rowMetaTxnId, graph);
  });
  const SubmitCancelButtons = () => {
    const onSubmit = async () => {
      if (isAnyFieldInvalid(graph, setGraph, props.meta, formData.formData)) {
        return;
      }
      const data = commitTxn(txnId, graph);
      await showLoadingToast({
        loadMessage: "Submitting Data...",
        onSuccess: (value) => {
          setTimeout(() => navigate(-1), 0);
        },
        promise: submitDataCall(data, graph, setGraph, txnId),
        successMessage: "Data submitted successfully",
      });
    };

    const onCancel = () => {
      revertTransaction(txnId, graph);
      setTimeout(() => navigate(-1));
    };
    return (
      <div class="flex gap:1">
        <Show
          fallback={<button onClick={onSubmit}>Submit</button>}
          when={props.submitButton}
        >
          {props.submitButton}
        </Show>
        <button
          class="danger border-color:#FF0000 color:#FF0000 margin-left:7px"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  };

  return (
    <FormContext.Provider value={formData}>
      <div class="">
        <PageAttrRender data={formData.formData} metaVertex={props.meta} />
      </div>
      <div />
      {/* <SubmitCancelButtons /> */}
    </FormContext.Provider>
  );
}
