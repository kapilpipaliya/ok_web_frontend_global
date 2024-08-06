import { createSignal, type JSX, onMount } from "solid-js";

import type { Vertex } from "~/lib/graph/graph";

import { IconButton } from "~/components/IconButton";
import { PROPERTIES } from "~/components/page_designer/settings/properties/constant";

export function CommonAddComponent(
  props: Readonly<{
    addNewState: (name: string) => void;
    children?: JSX.Element;
    label: string;
    onClose: (rowVertex?: Vertex) => void;
    placeholder: string;
    title: string;
  }>,
) {
  const [stateName, setStateName] = createSignal("");
  let inputRef: HTMLInputElement;

  onMount(() => inputRef?.focus());

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      props.addNewState(stateName());
    }
  };

  return (
    <div class="radius-b:5 flex flex:column px:2 py:5">
      <span>{props.title}</span>
      <div class="flex flex:column gap:4 jc:space-between mt:10">
        <label class="flex flex:column">
          {props.label}
          <div class="items-center flex ">
            <input
              class={`${PROPERTIES.Css.TextBox} h:100%`}
              onInput={(e) => setStateName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={props.placeholder}
              ref={inputRef!}
              value={stateName()}
            />
          </div>
        </label>
        <IconButton
          icon="ic:round-check"
          iconClass="ml:2"
          onClick={() => props.addNewState(stateName())}
          size={21}
        />
        {props.children}
      </div>
    </div>
  );
}
