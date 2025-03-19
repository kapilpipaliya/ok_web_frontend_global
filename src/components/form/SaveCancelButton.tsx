import { useNavigate } from "@solidjs/router";
import { type JSXElement, Show } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { useGraph } from "~/lib/graph/GraphContext";
import { SETTINGS_CONSTANTS } from "~/pages/settings/constants";

import { useToast } from "../styled/Toast";
import { type FormStoreObject, useFormContext } from "./context/FormContext";
import { formCancel } from "./functions/formCancel";
import { formSubmit } from "./functions/formSubmit";

export function SaveCancelButton(
  props: Readonly<{
    buttonAlign?: string;
    closePopUp?: () => void;
    customSubmitButton?: JSXElement;
    disabled?: boolean;
  }>,
) {
  const [graph, setGraph] = useGraph();
  const formId = useFormContext();
  const { showErrorToast, showLoadingToast, showWarningToast } = useToast();
  const navigate = useNavigate();
  const formStoreVertex = () =>
    graph.vertexes[formId!] as Vertex<FormStoreObject>;
  const onSubmit = formSubmit(
    formStoreVertex,
    graph,
    setGraph,
    props.closePopUp ?? (() => {}),
    showErrorToast,
    showLoadingToast,
    showWarningToast,
  );
  const onCancel = formCancel(
    formStoreVertex,
    graph,
    setGraph,
    props.closePopUp ?? (() => {}),
    navigate,
  );
  return (
    <div
      class={`${props.buttonAlign ? `jc:${props.buttonAlign}` : "jc:start"} flex`}
    >
      <button
        class={`${SETTINGS_CONSTANTS.MODAL.BUTTONS.CANCEL_CLASS} mr:7`}
        onClick={onCancel}
        type="button"
      >
        Cancel
      </button>
      <Show
        fallback={
          <button
            class={SETTINGS_CONSTANTS.MODAL.BUTTONS.SAVE_CLASS}
            disabled={props.disabled}
            onClick={onSubmit}
            type="button"
          >
            Save
          </button>
        }
        when={props.customSubmitButton}
      >
        {props.customSubmitButton}
      </Show>
    </div>
  );
}
