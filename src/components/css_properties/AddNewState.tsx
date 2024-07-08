import { Icon } from "@iconify-icon/solid";
import { createSignal } from "solid-js";

import { MultiSelectField, type Option } from "../MultiSelect";
import { PROPERTIES } from "../page_designer/settings/properties/constant";
import { cssSelectorTree } from "./constants/StateSelector";
import { useCssEditor, useCssState } from "./context";


export function AddNewState(props: Readonly<{ onClose: () => void }>) {
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
              class={`${PROPERTIES.Css.TextBox} h:100%`}
              onInput={(e) => setStateName(e.target.value)}
              placeholder="Enter State Name"
              ref={inputRef!}
              value={stateName()}
            />
          </div>
        </label>
        <label class="flex flex:column">
          Find and add State Name
          <div class="items-center flex ">
            <MultiSelectField
              displayValueChild="title"
              onRemove={() => {
                setSelectedAllState([]);
              }}
              onSelect={(value) => {
                setSelectedAllState(value);
                // @ts-expect-error ignore
                const joinedState = selectedAllState().map((option) => option.selector).join("");
                if (!stateName().includes(joinedState)) {
                  setStateName((prev) => `${prev}${joinedState}`);
                  // move text input cursor to the end
                }
                setSelectedAllState([]);
              }}
              optionValueKey="selector"
              options={cssSelectorTree as unknown as Option[]}
              selectedValues={selectedAllState}
              selectionLimit={1} />

          </div>
        </label>

        <button onClick={addNewState}>
              <Icon class="ml:2" height={21} icon="ic:round-check" width={21} />
            </button>
      </div>
    </div>
  );
}


