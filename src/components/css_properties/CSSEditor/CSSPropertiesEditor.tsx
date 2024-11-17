import { Icon } from "@iconify-icon/solid";
import { batch, createSignal, Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { StyleEditor } from "~/components/css_properties/StyleEditor/StyleEditor";
import { TextEditor } from "~/components/css_properties/CSSEditor/TextEditor";
import { useGraph, type Vertex } from "~/lib/graph/graph";
import { deleteEdge } from "~/lib/graph/mutate/edge";

import type { CSSStore } from "../context/CssEditorContext";

import { DropdownMenu } from "../../styled/DropdownMenu";
import { DynamicComponent } from "../../form/DynamicComponent";
import { useFormContext } from "../../form/FormContext";
import { MultiSelectField } from "../../styled/MultiSelect";
import { ZIndex } from "../../ZIndex";
import { AddNewCssState } from "./AddNewCssState";
import { useCssEditor } from "../context/CssEditorContext";
import { useCssState } from "../context/CssStateContext";
import { ResetButton } from "./ResetButton";
import { cssStateToString } from "../utils/cssStateToString";
import { getCssSelectedFileEdgeName } from "../utils/getCssSelectedFileEdgeName";
import { useCssEditorProps } from "../context/CSSEditorPropsContext";

const defaultStateLabel = "Default State";

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

export function CSSPropertiesEditor(
  props: Readonly<{}>,
) {
  const cssEditorProps = useCssEditorProps();
  const [graph, setGraph] = useGraph();
  const [state, setState] = useCssState();
  const [cssState, setCssState] = useCssEditor();
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [formStore] = useFormContext();
  let buttonRef: HTMLInputElement;

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
    const txnId = formStore?.txnId;
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
      <Show when={formStore?.formData?.L[0] === "Comp"}>
        <span>Preview:</span>
        <br />
        <DynamicComponent
          componentName={formStore!.formData.P.key}
          data={formStore!.formData}
          isNoPermissionCheck
          meta={{ P: { class: cssEditorProps!.data.P.value } } as unknown as Vertex}
        />
        <br />
      </Show>
      {graph.isDevelopment ? JSON.stringify(cssState) : null}
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
          <button onClick={removeState} title="Remove State">
            <Icon height={21} icon="ic:round-remove" width={21} />
          </button>
        </Show>
        <button onClick={handleAddNewClick} title="Add New State">
          <Icon height={21} icon="ic:round-add" width={21} />
        </button>
        <Show when={showDropdown()}>
          <ZIndex>
            <DropdownMenu
              class="r:5"
              onClickOutside={() => setShowDropdown(false)}
              parentRef={buttonRef!}
            >
              <AddNewCssState onClose={() => setShowDropdown(false)} />
            </DropdownMenu>
          </ZIndex>
        </Show>
      </div>
      <StyleEditor />
    </>
  );
}
