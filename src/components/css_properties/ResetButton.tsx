import { Icon } from "@iconify-icon/solid";
import { Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { type CSSStore, useCssEditor } from "./context";


function isNonEmptyObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null && Object.keys(obj).length > 0;
}

function filterTruthyCSSStore(store: CSSStore): Partial<CSSStore> {
  const filteredStore: Partial<CSSStore> = {};

  for (const state in store) {
    if (Object.prototype.hasOwnProperty.call(store, state)) {
      const stateObj = store[state];
      const filteredStateObj: { [key: string]: { [key: string]: any } | string } = {};

      for (const key in stateObj) {
        if (Object.prototype.hasOwnProperty.call(stateObj, key)) {
          const value = stateObj[key];

          if (value) {
            if (Array.isArray(value) && value.length > 0) {
              filteredStateObj[key] = value;
            } else if (!Array.isArray(value) && typeof value !== 'object') {
              filteredStateObj[key] = value;
            } else if (isNonEmptyObject(value)) {
              filteredStateObj[key] = value;
            }
          }
        }
      }

      if (isNonEmptyObject(filteredStateObj)) {
        filteredStore[state] = filteredStateObj;
      }
    }
  }

  return filteredStore;
}

export function ResetButton() {
  const [cssState, setCssState] = useCssEditor();

  return (
    <Show when={Object.entries(filterTruthyCSSStore(cssState)).length}>
      <div class="flex jc:end p:10|0">
        <button class="display:flex" onClick={() => setCssState(reconcile({"": {}}))}>
          <Icon icon="mdi:close" /> Reset
        </button>
      </div>
    </Show>
  );
}
