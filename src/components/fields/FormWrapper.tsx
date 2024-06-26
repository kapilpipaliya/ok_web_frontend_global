import type { ComponentProps } from "~/components/fields/ComponentType";
import { Show, useContext } from "solid-js";
import { WsContext } from "~/lib/websocket/ws_events_dispatcher";
import { GraphContext, IdAttr, type Vertex } from "~/lib/graph/graph";
import { useToast } from "~/components/Toast";
import { useNavigate } from "@solidjs/router";
import { commitTxn, getNewTxnId, revertTransaction } from "~/lib/graph/transaction";
import { FormContext } from "~/lib/contexts";
import { createStore } from "solid-js/store";
import { createForm } from "~/lib/graph/mutate/form/createForm";
import { submitDataCall } from "~/lib/api/api_functions";
import { PageAttrRender } from "~/components/page_attr_render/PageAttrRender";
import { isAnyFieldInvalid } from "~/lib/drag_drop/getChildrenAttrs";

export function FormWrapper(
  props: ComponentProps & {
    submitButton?: any;
    // For Root Level Forms we use Parent vertex label as form name
    label?: string;
  },
) {
  const { Ws } = useContext(WsContext);
  const [graph, setGraph] = useContext(GraphContext)!;
  const { showLoadingToast } = useToast();
  const navigate = useNavigate();

  const cleanUpConfig = {} as { [key: string]: any };
  const txnId = getNewTxnId(graph, setGraph);

  // const [dataVertex, setDataVertex] = createSignal<Vertex>();
  // const [metaVertex, setMetaVertex] = createSignal<Vertex>();


  const [formData, setFormData] = createStore({
    txnId,
    cleanUpConfig: () => cleanUpConfig,
  } as {
    cleanUpConfig: () => { [key: string]: any };
    txnId: number;
    formMeta: Vertex;
    formData: Vertex;
    tabs: string[];
    groupByTabsAndGroup: {
      [tab: string]: {
        [group: string]: Vertex[];
      };
    };
  });


  // if (!props.data?.id) {

  const createResult = createForm(graph, setGraph, txnId, Ws, props.label ?? props.meta!.P[IdAttr]);
  if (createResult.error) return createResult.error;
  setFormData('formData', createResult.vertex!);

  // } else {
  //   const loadResult = loadForm(graph, props.id);
  //   if (loadResult.error) return loadResult.error;
  //   dataVertex = loadResult.vertex!;
  // }

  // const [divRef, setDivRef] = createSignal<HTMLDivElement>();



  const SubmitCancelButtons = () => {
    const onSubmit = async () => {
      if (isAnyFieldInvalid(graph, setGraph, props.meta, formData.formData)) {
        return;
      }
      const data = commitTxn(txnId, graph);
      await showLoadingToast({
        promise: submitDataCall(data, graph, setGraph, txnId),
        loadMessage: "Submitting Data...",
        successMessage: "Data submitted successfully",
        onSuccess: (value) => {
          setTimeout(() => navigate(-1), 0);
        },
      });
    };

    const onCancel = () => {
      revertTransaction(txnId, graph);
      setTimeout(() => navigate(-1));
    };
    return (
      <div class="flex gap:1">
        <Show
          when={props.submitButton}
          fallback={
            <button onClick={onSubmit}>Submit</button>
          }
        >
          {props.submitButton}
        </Show>
        <button style={{ "margin-left": "7px" }} class="danger border-color:#FF0000 color:#FF0000" onClick={onCancel}>Cancel</button>
      </div>
    );
  };

  return (
    <div
      ref={(el) => {
        // setDivRef(el);
      }}
    >
      <FormContext.Provider value={formData}>
        <div class="">
          <PageAttrRender metaVertex={props.meta} data={formData.formData} />
        </div>
        <div />
        <SubmitCancelButtons />

      </FormContext.Provider>
    </div>
  );
}