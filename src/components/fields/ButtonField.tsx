import type { JSX } from "solid-js";

import { mergeRefs, } from "@solid-primitives/refs";
import { useNavigate } from "@solidjs/router";
import {
  createEffect,
  getOwner,
  runWithOwner,
  Show,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

import { usePreviewContext } from "~/components/page_designer/context/PreviewContext";
import { submitDataCall } from "~/lib/api/service/data/submitDataCall";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { commitTxn } from "~/lib/graph/transaction/commitTxn";
import { getNamedIndex } from "~/lib/graph/transaction/getNamedIndex";
import { revertTransaction } from "~/lib/graph/transaction/revertTransaction";
import { revertTransactionUpToIndex } from "~/lib/graph/transaction/revertTransactionUpToIndex";
import { createLongPress } from "~/lib/hooks/createLongPress";

import type { FunctionArgumentType } from "../form/FieldSchemaType";
import type { GenericComponentProps } from "./FieldType";

import { useFormContext, type FormStoreObject } from "../form/FormContext";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { isAnyFieldInvalid } from "../page_designer/functions/generateFormMetaAttributes";
import { useToast } from "../styled/Toast";
import { createForwardRef } from "../terracotta/utils/dynamic-prop";
import useEventListener from "../terracotta/utils/use-event-listener";

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
  const owner = getOwner();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const data = () => parentRenderContext()?.context.data!;
  const [graph, setGraph] = useGraph();
  const { showLoadingToast } = useToast();
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
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
            case " ":
            case "Enter": {
              onClick();
              break;
            }
          }
        });
      }
    }
  });

  const onSubmit = async () => {
    if (isAnyFieldInvalid(graph, setGraph, meta(), graph.vertexes[formVertex()!.P.formDataId!])) {
      return;
    }
    const data = commitTxn(formVertex()!.P.txnId, graph);
    await showLoadingToast({
      loadMessage: "Submitting Data...",
      onSuccess: (_data) => {
        // setTimeout(() => navigate(-1), 0);
      },
      promise: submitDataCall(data, graph, setGraph, formVertex()!.P.txnId),
      successMessage: "Data submitted successfully",
    });
  };

  const onCancel = () => {
    revertTransaction(formVertex()!.P.txnId, graph, setGraph);
    setTimeout(() => navigate(-1));
  };

  const onReset = () => {
    const initialIndex = getNamedIndex(formVertex()!.P.txnId, "initial", graph);
    if (initialIndex === undefined) {
      return;
    }
    revertTransactionUpToIndex(formVertex()!.P.txnId, initialIndex - 1, graph, setGraph);
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
        local.onClick(
          parentRenderContext()?.context ?? ({} as FunctionArgumentType),
        );
      }
    });
  };

  const { handlePressEnd, handlePressStart } = createLongPress(local);

  return (
    // <Show when={!(previewStore.isViewOnly && local.type === "submit")}>
    <Show
      fallback={
        <Dynamic
          component={local.as ?? (others.href ? "a" : "button")}
          ref={mergeRefs(props.ref, setInternalRef)}
          tabIndex={props.disabled ? -1 : undefined}
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
      }
      when={props.onLongPress}
    >
      <Dynamic
        component={local.as ?? (others.href ? "a" : "button")}
        ref={mergeRefs(props.ref, setInternalRef)}
        tabIndex={props.disabled ? -1 : undefined}
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
