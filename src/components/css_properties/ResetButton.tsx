import { Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { IconButton } from "../IconButton";
import { type CSSStore, useCssEditor } from "./CssEditorContext";

function isNonEmptyObject(obj: any): boolean {
  return typeof obj === "object" && obj !== null && Object.keys(obj).length > 0;
}

function filterTruthyCSSStore(store: CSSStore): Partial<CSSStore> {
  const filteredStore: Partial<CSSStore> = {};

  for (const state in store) {
    if (Object.prototype.hasOwnProperty.call(store, state)) {
      const stateObj = store[state];
      const filteredStateObj: {
        [key: string]: { [key: string]: any } | string;
      } = {};

      for (const key in stateObj) {
        if (Object.prototype.hasOwnProperty.call(stateObj, key)) {
          const value = stateObj[key];

          if (value) {
            if (Array.isArray(value) && value.length > 0) {
              filteredStateObj[key] = value;
            } else if (!Array.isArray(value) && typeof value !== "object") {
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

export function ResetButton(props: Readonly<{ onReset: () => void }>) {
  const [cssState, setCssState] = useCssEditor();

  return (
    <Show when={Object.entries(filterTruthyCSSStore(cssState)).length}>
      <div class="d:flex jc:end">
        <IconButton
          class="bg:red-50 bg:red-70:hover color:white gap:10px px:16px py:8px r:6 transition:background-color|200ms"
          icon="mdi:close"
          onClick={() => {
            setCssState(reconcile({ "": {} }));
            props.onReset();
          }}
          title="Reset"
        >
          <span>Reset</span>
        </IconButton>
      </div>
    </Show>
  );
}
