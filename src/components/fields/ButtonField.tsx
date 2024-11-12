import type { JSX } from "solid-js";

import { useNavigate } from "@solidjs/router";
import { createEffect, createMemo, getOwner, runWithOwner, Show, splitProps } from "solid-js";

import { usePreviewContext } from "~/components/page_designer/PreviewContext";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { getNamedIndex } from "~/lib/graph/transaction/getNamedIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";

import { useFormContext } from "../form/FormContext";
import { usePageRenderContext } from "../page_attr_render/PageRenderContext";
import { isAnyFieldInvalid } from "../page_designer/functions/generateFormMetaAttributes";
import { createForwardRef } from "../terracotta/utils/dynamic-prop";
import useEventListener from "../terracotta/utils/use-event-listener";
import { useToast } from "../Toast";
import { GenericComponentProps } from "./FieldType";
import { FunctionArgumentType } from "../form/FieldSchemaType";
import { Dynamic } from "solid-js/web";
import { createLongPress } from "~/lib/hooks/createLongPress";
import { mergeRefs, Ref } from "@solid-primitives/refs";

interface ButtonProps
  extends Omit<
      JSX.ButtonHTMLAttributes<HTMLButtonElement>,
      "onChange" | "onClick" | "value"
    >,
    GenericComponentProps {
  as?: string;
  buttonType: "cancel" | "reset" | "submit";
  href?: string;
  longPressDuration?: number;
  onClick?: (options: FunctionArgumentType) => void;
  onLongPress?: (event: Event) => void;
  text?: string;
}

export function ButtonField(props: Readonly<ButtonProps>) {
  const [parentContext] = usePageRenderContext();
  const owner = getOwner();
  const meta = () => getLastItem(parentContext?.vertexes || [])!;
  const data = () => getLastItem(parentContext?.data || [])!;
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const [formStore] = useFormContext();
  const navigate = useNavigate();
  const [previewStore] = usePreviewContext();
  const [internalRef, setInternalRef] = createForwardRef(props);

  const [local, others] = splitProps(props, [
    "as",
    "ref",
    "children",
    "value",
    "text",
    "onClick",
    "onChange",
    "onLongPress",
    "longPressDuration",
    "onMouseDown",
    "onMouseUp",
    "onMouseLeave",
    "onTouchStart",
    "onTouchEnd",
    "onTouchCancel",
    "buttonType",
  ]);

  createEffect(() => {
    const current = internalRef();
    if (current instanceof HTMLElement) {
      // This behavior is redundant for buttons
      if (current.tagName !== "BUTTON") {
        useEventListener(current, "keydown", (e) => {
          switch (e.key) {
            case "Enter":
            case " ": {
              onClick();
              break;
            }
          }
        });
      }
    }
  });

  const onSubmit = async () => {
    if (isAnyFieldInvalid(graph, setGraph, meta(), formStore!.formData)) {
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
  const onClick = () => {
    runWithOwner(owner, () => {
        if (previewStore.isDesignMode) {
          return;
        }
        if (local.buttonType === "submit") {
          if (previewStore.isViewOnly) {
            return;
          }
          onSubmit();
        } else if (local.buttonType === "cancel") {
          onCancel();
        } else if (local.buttonType === "reset") {
          onReset();
        } else if (local.onClick) {
          local.onClick(parentContext?.context ?? {} as FunctionArgumentType);
        }
      }
    );
  };

  const { handlePressEnd, handlePressStart } = createLongPress(local);

  return (
    // <Show when={!(previewStore.isViewOnly && local.type === "submit")}>
    <Show fallback={
      <Dynamic
        component={local.as ?? (others.href ? "a" : "button")}
        tabIndex={props.disabled ? -1 : undefined}
        ref={mergeRefs(props.ref, setInternalRef)}
        {...others}
        onClick={onClick}
        onMouseDown={local.onMouseDown}
        onMouseLeave={local.onMouseLeave}
        onMouseUp={local.onMouseUp}
        onTouchCancel={local.onTouchCancel}
        onTouchEnd={local.onTouchEnd}
        onTouchStart={local.onTouchStart}
      >
        {local.text}
        {local.children}
      </Dynamic>
    } when={props.onLongPress}>
      <Dynamic
        component={local.as ?? (others.href ? "a" : "button")}
        tabIndex={props.disabled ? -1 : undefined}
        ref={mergeRefs(props.ref, setInternalRef)}
        {...others}
        onClick={onClick}
        // setting event handlers here like {...getEventHandlers()} re-renders the childrens! not sure why that behaves that way, used <Show> to not set dynamic event handlers here
        // {...getEventHandlers()}
        onMouseDown={handlePressStart}
        onMouseLeave={handlePressEnd}
        onMouseUp={handlePressEnd}
        onTouchCancel={handlePressEnd}
        onTouchEnd={handlePressEnd}
        onTouchStart={handlePressStart}
      >
        {local.text}
        {local.value}
        {local.children}
      </Dynamic>
    </Show>
    // </Show>
  );
}
