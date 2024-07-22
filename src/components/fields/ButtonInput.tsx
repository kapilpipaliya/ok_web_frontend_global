import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";
import { createMemo, splitProps } from "solid-js";

import { submitDataCall } from "~/lib/api/api_functions";
import { useFormContext, useIsPreview } from "~/lib/contexts";
import { type Vertex, useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";

import { useToast } from "../Toast";
import { isAnyFieldInvalid } from "../page_designer/functions/getChildrenAttrs";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: JSX.Element;
  data: Vertex;
  meta: Vertex
}

export function ButtonInput(props: ButtonProps) {
  const [local, others] = splitProps(props, ['data', 'meta', 'children']);
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const { formData, txnId } = useFormContext();
  const navigate = useNavigate();
  const [isPreview] = useIsPreview();

  const onSubmit = async () => {
    if (isAnyFieldInvalid(graph, setGraph, props.meta, formData)) {
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
  const extraProps = createMemo(() => {
    return {
      onClick: () => {
        if (!isPreview()) {
          return;
        }
        if (props.meta.P.type === "submit") {
          onSubmit();
        } else if (props.meta.P.type === "cancel") {
          onCancel();
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
