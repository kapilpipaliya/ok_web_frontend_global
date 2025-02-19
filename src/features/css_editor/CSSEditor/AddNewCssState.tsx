import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";

import { IframeHelpDialog } from "~/components/styled/IframeHelpDialog";
import { MultiSelectField, type Option } from "~/components/styled/MultiSelect";
import { cssSelectorTree } from "~/features/css_editor/constants/StateSelector";

import { PROPERTIES } from "../../../components/styled/constants/constant";
import { useCssEditor } from "../context/CssEditorContext";
import { useCssState } from "../context/CssStateContext";

export function AddNewCssState(props: Readonly<{ onClose: () => void }>) {
  const [selectedAllState, setSelectedAllState] = createSignal<Option[]>([]);
  const [stateName, setStateName] = createSignal("");
  const [cssState, setCssState] = useCssEditor();
  const [, setState] = useCssState();

  let inputRef: HTMLTextAreaElement;

  const addNewState = () => {
    if (!cssState[stateName()]) {
      setCssState(stateName(), {});
    }
    setSelectedAllState([]);
    setState(stateName());
    props.onClose();
  };

  return (
    <div class="radius-b:5 flex flex:column px:2 py:5">
      <span>Add New State</span>
      <div class="flex flex:column gap:4 jc:space-between mt:10">
        <label class="flex flex:column">
          Enter States
          <div class="items-center flex h:100%">
            <textarea
              class={`${PROPERTIES.Css.TextField} h:100%`}
              onInput={(e) => setStateName(e.target.value)}
              placeholder="Enter State Name"
              ref={inputRef!}
              value={stateName()}
            />
            <IframeHelpDialog
              icon="material-symbols:help-outline"
              iframeSrc="https://rc.css.master.co/guide/state-selectors"
              iframeTitle="State Selectors"
              title="State Selectors"
            />
          </div>
        </label>
        <label class="flex flex:column">
          Find and add State Name
          <div class="items-center flex ">
            <MultiSelectField
              displayValueKey="title"
              onRemove={() => {
                setSelectedAllState([]);
              }}
              onSelect={(value) => {
                setSelectedAllState(value);
                const joinedState = selectedAllState()
                  // @ts-expect-error ignore
                  .map((option) => option.selector)
                  .join("");
                if (!stateName().includes(joinedState)) {
                  setStateName((prev) => `${prev}${joinedState}`);
                  // move text input cursor to the end
                }
                setSelectedAllState([]);
              }}
              options={cssSelectorTree as unknown as Option[]}
              optionValueKey="selector"
              selectedValues={selectedAllState}
              selectionLimit={1}
            />
          </div>
        </label>

        <button onClick={addNewState}>
          <Icon
            class="ml:2"
            height={21}
            icon="ic:round-check"
            noobserver
            width={21}
          />
        </button>
      </div>
    </div>
  );
}
