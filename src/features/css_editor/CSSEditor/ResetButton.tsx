import { Show } from "solid-js";
import { reconcile } from "solid-js/store";

import { IconButton } from "../../../components/styled/IconButton";
import { type CSSStore, useCssEditor } from "../context/CssEditorContext";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";

export function ResetButton(props: Readonly<{ onReset: () => void }>) {
  const [cssState, setCssState] = useCssEditor();

  return (
    <Show when={Object.entries(filterTruthyCSSStore(cssState)).length}>
      <As
        as="div"
        css={css`
  display: flex;
  justify-content: end;
`}
      >
        <IconButton
          css={(args: FunctionArgumentType) => css`
  color: ${args.theme.var.color.base_10};
  gap: 10px;
  padding-left: 16px; padding-right: 16px;
  padding-top: 8px; padding-bottom: 8px;
  border-radius: 6px;
  transition: background-color 200ms;
  background-color: transparent;
  border: none;
  &:hover {
    background-color: ${args.theme.var.color.error};
  }
`}
          icon="ph:x"
          onClick={() => {
            setCssState(reconcile({ "": {} }));
            props.onReset();
          }}
          title="Reset"
        >
          <span>Reset</span>
        </IconButton>
      </As>
    </Show>
  );
}

function filterTruthyCSSStore(store: CSSStore): Partial<CSSStore> {
  const filteredStore: Partial<CSSStore> = {};

  for (const state in store) {
    if (Object.prototype.hasOwnProperty.call(store, state)) {
      const stateObj = store[state];
      const filteredStateObj: {
        [key: string]: string | { [key: string]: any };
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

function isNonEmptyObject(obj: any): boolean {
  return typeof obj === "object" && obj !== null && Object.keys(obj).length > 0;
}
