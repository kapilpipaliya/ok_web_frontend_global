import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";
import { createEffect, createMemo, Show, splitProps } from "solid-js";

import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { Button } from "~/kobalte/packages/core/src/button";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { getNamedIndex } from "~/lib/graph/transaction/getNamedIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";

import { useFormContext } from "../form/FormContext";
import { isAnyFieldInvalid } from "../page_designer/functions/getChildrenAttrs";
import { createForwardRef } from "../terracotta/utils/dynamic-prop";
import useEventListener from "../terracotta/utils/use-event-listener";
import { useToast } from "../Toast";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: string;
  children?: JSX.Element;
  data: Vertex;
  meta: Vertex;
}

export function ButtonField(props: Readonly<ButtonProps>) {
  const [local, others] = splitProps(props, [
    "ref",
    "data",
    "meta",
    "children",
    "onChange"
  ]);
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const [formStore] = useFormContext();
  const navigate = useNavigate();
  const [previewStore] = usePreviewContext();
  const [internalRef, setInternalRef] = createForwardRef(props);

  createEffect(() => {
    const current = internalRef();
    if (current instanceof HTMLElement) {
      // This behavior is redundant for buttons
      if (current.tagName !== "BUTTON") {
        useEventListener(current, "keydown", (e) => {
          switch (e.key) {
            case "Enter":
            case " ": {
              current.click();
              break;
            }
          }
        });
      }
    }
  });

  const onSubmit = async () => {
    if (isAnyFieldInvalid(graph, setGraph, props.meta, formStore!.formData)) {
      return;
    }
    const data = commitTxn(formStore!.txnId, graph);
    await showLoadingToast({
      loadMessage: "Submitting Data...",
      onSuccess: (_data) => {
        // setTimeout(() => navigate(-1), 0);
      },
      promise: submitDataCall(data, graph, setGraph, formStore!.txnId),
      successMessage: "Data submitted successfully",
    });
  };

  const onCancel = () => {
    revertTransaction(formStore!.txnId, graph);
    setTimeout(() => navigate(-1));
  };

  const onReset = () => {
    const initialIndex = getNamedIndex(formStore!.txnId, "initial", graph);
    if (initialIndex === undefined) {
      return;
    }
    revertTransactionUpToIndex(formStore!.txnId, initialIndex - 1, graph);
  };
  const extraProps = createMemo(() => {
    return {
      onClick: () => {
        if (previewStore.isDesignMode) {
          return;
        }
        if (props.meta.P.type === "submit") {
          if (previewStore.isViewOnly) {
            return;
          }
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
    <Show when={!(previewStore.isViewOnly && props.meta.P.type === "submit")}>
      {/* @ts-expect-error children is not a valid prop */}
      <Button
        ref={setInternalRef}
        {...others}
        {...extraProps}
      >
        {local.data?.P?.[local.meta.P.name] ??
          local.meta.P.text ??
          local.meta.P.children}
        {local.children}
      </Button>
    </Show>
  );
}
