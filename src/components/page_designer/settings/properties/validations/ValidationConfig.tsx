import { createSignal, For, Match, Show, Switch } from "solid-js";
import { createStore } from "solid-js/store";

import type { Vertex } from "~/lib/graph/graph";

import { validateInput } from "./validateInput";

interface ValidationProps {
  componentName: string;
  data: Vertex;
  meta: Vertex;
  onChange(meta: Vertex, data: any): void;
}

export const validations = {
  CheckBox: "required",
  TextInputField: "required|email|minLength|maxLength|regex",
};

export interface ValidationConfigType {
  email: boolean;
  maxLength: number;
  minLength: number;
  regex: {
    enabled: boolean;
    message: string;
    value: string;
  }[];
  required: boolean;
}

export function ValidationConfig(props: Readonly<ValidationProps>) {
  const rules =
    validations[props.componentName as keyof typeof validations]?.split(
      "|",
    ) || [];
  const [values, setValues] = createStore<ValidationConfigType>(
    props.data.P.validation || {},
  );

  const addRegex = () => {
    setValues("regex", [
      ...(values.regex || []),
      { enabled: true, message: "", value: "" },
    ]);
  };

  const deleteRegex = (index: number) => {
    setValues(
      "regex",
      values.regex.filter((_, i) => i !== index),
    );
    props.onChange(props.meta, values);
  };

  const RuleInput = (
    inputProps: Readonly<{
      label: string;
      onChange: (e: any) => void;
      rule: string;
      type: string;
      value: any;
    }>,
  ) => (
    <div class="flex ai:center gap:2 justify-content:space-between mt:6 ">
      <label class="f:15 flex:.5">{inputProps.label}</label>
      <input
        checked={inputProps.type === "checkbox" ? inputProps.value : undefined}
        class="border:1px|solid|#ccc f:15 flex:1 p:2"
        onChange={(e) => {
          inputProps.onChange(e);
          props.onChange(props.meta, values);
        }}
        type={inputProps.type}
        value={inputProps.value}
      />
    </div>
  );

  const RegexInput = (regexprops: Readonly<{ index: number }>) => (
    <div class="">
      <div class="flex ai:center gap:2 justify-content:space-between mt:6 ">
        <label class="f:15 flex:.5">Regex</label>
        <input
          class="border:1px|solid|#ccc f:15 flex:1 p:2"
          onChange={(e) =>
            setValues("regex", regexprops.index, "value", e.target.value)
          }
          type="text"
          value={values.regex[regexprops.index].value}
        />
      </div>
      <div class="flex ai:center gap:2 justify-content:space-between mt:6 ">
        <label class="f:15 flex:.5">Enabled</label>
        <input
          checked={values.regex[regexprops.index].enabled}
          class="border:1px|solid|#ccc f:15 flex:1 p:2"
          onChange={(e) =>
            setValues("regex", regexprops.index, "enabled", e.target.checked)
          }
          type="checkbox"
        />
      </div>
      <div class="flex ai:center gap:2 justify-content:space-between mt:6 ">
        <label class="f:15 flex:.5">Message</label>
        <input
          class="border:1px|solid|#ccc f:15 flex:1 p:2"
          onChange={(e) =>
            setValues("regex", regexprops.index, "message", e.target.value)
          }
          type="text"
          value={values.regex[regexprops.index].message}
        />
      </div>
      <div>
        <button
          class="border:1px|solid|#ccc p:2"
          onClick={() => deleteRegex(regexprops.index)}
          type="button"
        >
          Delete Regex
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <Show when={rules.length > 0}>
        <h3 class="font-weight:bold">Validations:</h3>
      </Show>
      <For each={rules}>
        {(rule) => (
          <div>
            <Switch>
              <Match when={rule === "required"}>
                <RuleInput
                  label="Required"
                  onChange={(e) => setValues("required", e.target.checked)}
                  rule={rule}
                  type="checkbox"
                  value={values.required}
                />
              </Match>
              <Match when={rule === "email"}>
                <RuleInput
                  label="Email"
                  onChange={(e) => setValues("email", e.target.checked)}
                  rule={rule}
                  type="checkbox"
                  value={values.email}
                />
              </Match>
              <Match when={rule === "minLength"}>
                <RuleInput
                  label="Min Length"
                  onChange={(e) =>
                    setValues("minLength", Number.parseInt(e.target.value))
                  }
                  rule={rule}
                  type="number"
                  value={values.minLength}
                />
              </Match>
              <Match when={rule === "maxLength"}>
                <RuleInput
                  label="Max Length"
                  onChange={(e) =>
                    setValues("maxLength", Number.parseInt(e.target.value))
                  }
                  rule={rule}
                  type="number"
                  value={values.maxLength}
                />
              </Match>
              <Match when={rule === "regex"}>
                <button onClick={addRegex} type="button">
                  Add Regex
                </button>
                <For each={values.regex}>
                  {(_regex, index) => <RegexInput index={index()} />}
                </For>
              </Match>
            </Switch>
          </div>
        )}
      </For>
    </div>
  );
}
export const ValidationConfigTest = (validations: ValidationConfigType) => {
  const [values, setValues] = createSignal("");
  const [error, setError] = createSignal("");

  const handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    setValues(value);
    setError("");
    const error = validateInput(validations, value);
    if (error) {
      setError(error);
    }
  };

  return (
    <div>
      <input onChange={handleChange} type="text" value={values()} />
      {error() && <div class="error">{error()}</div>}
    </div>
  );
};
