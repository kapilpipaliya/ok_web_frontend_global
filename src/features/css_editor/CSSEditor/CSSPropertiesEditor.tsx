import { Icon } from "@iconify-icon/solid";
import { batch, createSignal, Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { DropdownMenu } from "~/components/styled/DropdownMenu";
import { IframeHelpDialog } from "~/components/styled/IframeHelpDialog";
import { TextEditor } from "~/features/css_editor/CSSEditor/TextEditor";
import { StyleEditor } from "~/features/css_editor/StyleEditor/StyleEditor";
import { getGlobalStore } from "~/lib/graph/get/sync/store/getGlobalStore";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteEdge } from "~/lib/graph/mutate/core/edge";

import type { CSSStore } from "../context/CssEditorContext";

import {
  type FormStoreObject,
  useFormContext,
} from "../../../components/form/context/FormContext";
import { DynamicComponent } from "../../../components/form/DynamicComponent";
import { MultiSelectField } from "../../../components/styled/MultiSelect";
import { useCssEditor } from "../context/CssEditorContext";
import { useCssEditorProps } from "../context/CSSEditorPropsContext";
import { useCssState } from "../context/CssStateContext";
import { cssStateToString } from "../utils/cssStateToString";
import { getCssSelectedFileEdgeName } from "../utils/getCssSelectedFileEdgeName";
import { AddNewCssState } from "./AddNewCssState";
import { ResetButton } from "./ResetButton";

const defaultStateLabel = "Default";

export function CSSPropertiesEditor() {
  const cssEditorProps = useCssEditorProps();
  const [graph, setGraph] = useGraph();
  const [state, setState] = useCssState();
  const [cssState, setCssState] = useCssEditor();
  const [showDropdown, setShowDropdown] = createSignal(false);
  const formId = useFormContext();
  const formVertex = () => graph.vertexes[formId!] as Vertex<FormStoreObject>;
  let buttonRef: HTMLInputElement;
  let addNewStateButtonRef: HTMLButtonElement;

  function getSelectedValues() {
    const label =
      state() in cssState
        ? `${state() === "" ? defaultStateLabel : state()} (${Object.keys(cssState[state()] ?? {}).length})`
        : state();
    return [{ id: state(), label }];
  }

  const handleAddNewClick = () => {
    setShowDropdown(!showDropdown());
  };

  const clearStateFileSelection = (currentState: string) => {
    const txnId = formVertex()?.P.txnId;
    if (!txnId) {
      return;
    }
    if (!(cssEditorProps!.meta && cssEditorProps!.data)) {
      return;
    }
    const edgesPrefixToRemove = getCssSelectedFileEdgeName(
      cssEditorProps!.data.L[0],
      cssEditorProps!.meta.P.key,
      currentState,
      "",
    );
    for (const edgeName in cssEditorProps!.data.OUT) {
      if (edgeName.startsWith(edgesPrefixToRemove)) {
        for (const edgeId of cssEditorProps!.data.OUT[edgeName]) {
          deleteEdge(txnId, edgeId, graph, setGraph);
        }
      }
    }
  };

  const removeState = () => {
    batch(() => {
      clearStateFileSelection(state());
      setCssState(state(), reconcile({}));
      setState("");
    });
  };

  const resetCssState = () => {
    clearStateFileSelection("");
    setCssState(reconcile({ "": {} }));
  };

  return (
    <>
      <Show when={graph.vertexes[formVertex()?.P.formDataId!]?.L[0] === "Comp"}>
        <span>Preview:</span>
        <br />
        <DynamicComponent
          componentName={graph.vertexes[formVertex()!.P.formDataId]?.P.key}
          data={graph.vertexes[formVertex()!.P.formDataId]}
          isNoPermissionCheck
          meta={
            { P: { class: cssEditorProps!.data.P.value } } as unknown as Vertex
          }
        />
        <br />
      </Show>
      {getGlobalStore(graph).P.isDevelopment ? JSON.stringify(cssState) : null}
      <ResetButton onReset={resetCssState} />
      <TextEditor
        disabled={true}
        value={cssStateToString(
          cssState,
          cssEditorProps!.meta,
          cssEditorProps!.data,
          graph,
        )}
      />
      Current State
      <div class="flex" ref={buttonRef!}>
        <MultiSelectField
          onRemove={() => setState("")}
          onSelect={(_, value) => setState(value as string)}
          options={getOptions(cssState)}
          placeholder="Select Current State"
          selectedValues={getSelectedValues}
          selectionLimit={1}
        />
        <Show when={Object.keys(cssState[state()] || {}).length > 0}>
          <button
            class="ai:center d:inline-flex"
            onClick={removeState}
            title="Remove State"
          >
            <Icon height={21} icon="ph:minus" noobserver width={21} />
          </button>
        </Show>
        <button
          class="ai:center d:inline-flex"
          onClick={handleAddNewClick}
          ref={addNewStateButtonRef!}
          title="Add New State"
        >
          <Icon height={21} icon="ph:plus" noobserver width={21} />
        </button>
        <IframeHelpDialog
          icon="ph:question"
          iconSize={21}
          iframeSrc="https://rc.css.master.co/guide/state-selectors"
          iframeTitle="State Selectors"
          title="State Selectors"
        />
        <Show when={showDropdown()}>
          <DropdownMenu
            parentRef={addNewStateButtonRef!}
            placement="bottom-end"
          >
            <div
              class={`${
                Object.keys(cssState[state()] || {}).length > 0
                  ? "bb:1px|solid|secondary m:1 pb:5"
                  : ""
              } flex ai:center jc:space-between mb:6px`}
            >
              <AddNewCssState onClose={() => setShowDropdown(false)} />
            </div>
          </DropdownMenu>
        </Show>
      </div>
      <StyleEditor />
    </>
  );
}

function getOptions(cssState: CSSStore) {
  const pseudoClasses = [
    "",
    ":active",
    ":hover",
    ":focus",
    ":disabled",
    ":visited",
    ":focus-within",
    ":focus-visible",
    ":target",
    "@xs",
    "@sm",
    "@md",
    "@lg",
  ];
  const uniqueStates = new Set([...Object.keys(cssState), ...pseudoClasses]);

  return Array.from(uniqueStates).map((value) => {
    const label =
      value in cssState
        ? `${value === "" ? defaultStateLabel : value} (${Object.values(cssState[value]).length})`
        : value;
    return { id: value, label };
  });
}
