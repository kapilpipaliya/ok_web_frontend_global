import jsep from "jsep";
import { For } from "solid-js";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evaluate } from "~/lib/expression_eval";

export function TabsWithUnderline(
  props: Readonly<{
    displayValueKey: string;
    onTabClick: (index: number) => void;
    selectedIndex: number;
    tabs: Array<{ name: string }>;
  }>,
) {
  const getOptionLabel = (option: any) => {
    if (isObject(option) && props.displayValueKey) {
      if (props.displayValueKey.includes("::")) {
        return evaluate(jsep(props.displayValueKey), option);
      }
      return option[props.displayValueKey];
    }

    return isObject(option) ? option.label : option;
  };
  return (
    <div>
      {/* Mobile view */}
      <div class="display:none@sm">
        <label class="sr-only" for="tabs">
          Select a tab
        </label>
        <select
          class="lh:1.5rem lh:1.25rem@sm border-color:rgb(209,213,219) border-color:rgb(99,102,241):focus border-radius:0.375rem display:block outline-offset:2px:focus outline:2px|solid|transparent pl:0.75rem pr:2.5rem py:0.5rem width:100%"
          id="tabs"
          name="tabs"
          onChange={(e) => props.onTabClick(e.currentTarget.selectedIndex)}
          value={props.selectedIndex}
        >
          <For each={props.tabs}>
            {(tab, index) => (
              <option
                selected={index() === props.selectedIndex}
                value={index()}
              >
                {getOptionLabel(tab)}
              </option>
            )}
          </For>
        </select>
      </div>

      <div class="display:none display:block@sm">
        <div class="border-bottom-width:1px border-color:rgb(229,231,235)">
          <nav aria-label="Tabs" class="flex gap:0.5rem margin-bottom:-1px">
            <For each={props.tabs}>
              {(tab, index) => (
                <button
                  aria-current={
                    index() === props.selectedIndex ? "page" : undefined
                  }
                  class={`lh:1.25rem ${index() === props.selectedIndex ? "border:indigo-50 text:indigo-60" : "border-color:transparent border:gray-30:hover color:gray-50 color:gray-70:hover"} border-bottom-width:2px  font-weight:500 px:0.25rem py:0.5rem white-space:nowrap`}
                  onClick={() => props.onTabClick(index())}
                  type="button"
                >
                  {getOptionLabel(tab)}
                </button>
              )}
            </For>
          </nav>
        </div>
      </div>
    </div>
  );
}
