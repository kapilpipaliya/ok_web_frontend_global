import { Icon } from "@iconify-icon/solid";
import { Show, batch, createSignal } from "solid-js";
import { reconcile } from "solid-js/store";

import { StyleEditor } from "~/components/css_properties/StyleEditor";
import { TextEditor } from "~/components/css_properties/TextEditor";
import { type Vertex, useGraph } from "~/lib/graph/graph";

import type { CSSStore } from "./CssEditorContext";

import { DropdownMenu } from "../DropdownMenu";
import { MultiSelectField } from "../MultiSelect";
import { ZIndex } from "../ZIndex";
import { DynamicComponent } from "../form/DynamicComponent";
import { useFormContext } from "../form/FormContext";
import { AddNewCssState } from "./AddNewCssState";
import { useCssEditor, useCssState } from "./CssEditorContext";
import { ResetButton } from "./ResetButton";
import { cssStateToString } from "./utils/cssStateToString";
import { parseAndApplyCssRules } from "./utils/parseAndApplyCssRules";
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
  props: Readonly<{ data: Vertex, meta: Vertex, setValue?: (data: CSSStore) => void }>,
) {
  const [graph] = useGraph();
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

  const handleCSSStateChange = (valueString: string) => {
    setCssState(reconcile(parseAndApplyCssRules(valueString)));
    props.setValue?.(JSON.parse(JSON.stringify(cssState)));
  };

  const handleAddNewClick = () => {
    setShowDropdown(!showDropdown());
  };
  const removeState = () => {
    batch(() => {
      setCssState(state(), reconcile({}));
      setState("");
    });
  };

  return <>
    <Show when={formStore?.formData?.L[0] === "Comp"}>
      <span>Preview:</span><br/>
      <DynamicComponent
        componentName={formStore!.formData!.P.name}
        data={formStore!.formData}
        isNoPermissionCheck
        meta={{P: {class: props.data.P.value}} as unknown as Vertex}
      /><br/>
    </Show>
    {graph.isDevelopment ? JSON.stringify(cssState) : null}
    <ResetButton />
    <TextEditor
      disabled={true}
      onValueChange={handleCSSStateChange}
      value={cssStateToString(cssState)}
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

}
