import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";
import { createMemo, splitProps } from "solid-js";

import { submitDataCall } from "~/lib/api/api_functions";
import { useFormContext, usePreviewContext } from "~/lib/contexts";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { getNamedIndex } from "~/lib/graph/transaction/getNamedIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";

import { useToast } from "../Toast";
import { isAnyFieldInvalid } from "../page_designer/functions/getChildrenAttrs";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: JSX.Element;
  data: Vertex;
  meta: Vertex
}

export function ButtonInput(props: Readonly<ButtonProps>) {
  const [local, others] = splitProps(props, ['data', 'meta', 'children']);
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const { formData, txnId } = useFormContext();
  const navigate = useNavigate();
  const {previewData, previewMeta} = usePreviewContext();

  const onSubmit = async () => {
    if (isAnyFieldInvalid(graph, setGraph, props.meta, formData)) {
      return;
    }
    const data = commitTxn(txnId, graph);
    await showLoadingToast({
      loadMessage: "Submitting Data...",
      onSuccess: (data) => {
        // setTimeout(() => navigate(-1), 0);
      },
      promise: submitDataCall(data, graph, setGraph, txnId),
      successMessage: "Data submitted successfully",
    });
  };

  const onCancel = () => {
    revertTransaction(txnId, graph);
    setTimeout(() => navigate(-1));
  };

  const onReset = () => {
    const initialIndex = getNamedIndex(txnId, "initial", graph);
    if (initialIndex === undefined) return;
    revertTransactionUpToIndex(txnId, initialIndex, graph);
  };
  const extraProps = createMemo(() => {
    return {
      onClick: () => {
        if (!previewMeta) {
          return;
        }
        if (props.meta.P.type === "submit") {
          onSubmit();
        } else if (props.meta.P.type === "cancel") {
          onCancel();
        } else if (props.meta.P.type === "reset") {
          onReset();
        }
      },
    };
  });
  return (
    <button {...others} {...extraProps}>
      {local.data?.P?.[local.meta.P.name] ??
        local.meta.P.text ??
        local.meta.P.children}
      {local.children}
    </button>
  );
}
