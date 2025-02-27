import { For } from "solid-js";

import { isObject } from "~/lib/data_structure/object/isObject";
import { evalExpression } from "~/lib/expression_eval";

export function TabsWithUnderline(
  props: Readonly<{
    displayValueKey: string;
    onTabClick: (key: string) => void;
    selectedKey: string;
    tabs: Array<{ key: string }>;
  }>,
) {
  const getOptionLabel = (option: any) => {
    if (isObject(option) && props.displayValueKey) {
      if (props.displayValueKey.includes("::")) {
        return evalExpression(props.displayValueKey, option);
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
          class="lh:1.5rem lh:1.25rem@sm border-color:base-5 border-color:primary:focus border-radius:0.375rem display:block outline-offset:2px:focus outline:2px|solid|transparent pl:0.75rem pr:2.5rem py:0.5rem width:100%"
          id="tabs"
          onChange={(e) => props.onTabClick(e.currentTarget.value)}
          value={props.selectedKey}
        >
          <For each={props.tabs}>
            {(tab) => (
              <option selected={tab.key === props.selectedKey} value={tab.key}>
                {getOptionLabel(tab)}
              </option>
            )}
          </For>
        </select>
      </div>

      <div class="display:none display:block@sm">
        <div class="border-bottom-width:1px border-color:base-5">
          <nav aria-label="Tabs" class="flex gap:0.5rem margin-bottom:-1px">
            <For each={props.tabs}>
              {(tab) => (
                <button
                  aria-current={
                    tab.key === props.selectedKey ? "page" : undefined
                  }
                  class={`lh:1.25rem ${tab.key === props.selectedKey ? "border:primary-50 text:primary-60" : "border-color:transparent border:base-30:hover color:secondary-50 color:secondary-70:hover"} border-bottom-width:2px font-weight:500 px:0.25rem py:0.5rem white-space:nowrap`}
                  onClick={() => props.onTabClick(tab.key)}
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
