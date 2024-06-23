
import { createSignal, Match, For, Switch, Show } from "solid-js";
import type { Vertex } from "~/lib/graph/graph";
import { createStore } from "solid-js/store";
import { validateInput } from "./validateInput";

interface ValidationProps {
  componentMeta: Vertex;
  meta: Vertex;
  data: Vertex;
  setValue(meta: Vertex, data: any): void;
}

export const validations = {
  TextBox: 'required|email|minLength|maxLength|regex',
  TextArea: 'required|minLength|maxLength|regex',
  DropDown: 'required|minLength|maxLength|regex',
  CheckBox: 'required',
  RadioButton: 'required',
  CheckBoxGroup: 'required',
  RadioButtonGroup: 'required',
};

export interface ValidationConfigType {
  required: boolean;
  email: boolean;
  minLength: number;
  maxLength: number;
  regex: {
    value: string;
    enabled: boolean;
    message: string;
  }[];
}

export function ValidationConfig(props: ValidationProps) {
  const rules = validations[props.componentMeta.P.name as keyof typeof validations]?.split('|') || [];
  const [values, setValues] = createStore<ValidationConfigType>(props.data.P.validation || {});

  const addRegex = () => {
    setValues('regex', [...(values.regex || []), { value: '', enabled: true, message: '' }]);
  };

  const deleteRegex = (index: number) => {
    setValues('regex', values.regex.filter((_, i) => i !== index));
    props.setValue(props.meta, values);
  };

  const RuleInput = (inputProps: { rule: string, label: string, type: string, value: any, onChange: (e: any) => void }) => (
    <div class="flex gap:2 mt:6 justify-content:space-between ai:center ">
      <label class="flex:.5 f:15">{inputProps.label}</label>
      <input
        type={inputProps.type}
        value={inputProps.value}
        checked={inputProps.type === "checkbox" ? inputProps.value : undefined}
        onChange={(e) => {
          inputProps.onChange(e);
          props.setValue(props.meta, values);
        }}
        class="flex:1 f:15 border:1px|solid|#ccc p:2"
      />
    </div>
  );

  const RegexInput = (regexprops: { index: number, }) => (
    <div class="">
      <div class="flex gap:2 mt:6 justify-content:space-between ai:center ">
        <label class="flex:.5 f:15">Regex</label>
        <input
          type="text"
          value={values.regex[regexprops.index].value}
          onChange={(e) => setValues('regex', regexprops.index, 'value', e.target.value)}
          class="flex:1 f:15 border:1px|solid|#ccc p:2"
        />
      </div>
      <div class="flex gap:2 mt:6 justify-content:space-between ai:center ">
        <label class="flex:.5 f:15">Enabled</label>
        <input
          type="checkbox"
          checked={values.regex[regexprops.index].enabled}
          onChange={(e) => setValues('regex', regexprops.index, 'enabled', e.target.checked)}
          class="flex:1 f:15 border:1px|solid|#ccc p:2"
        />
      </div>
      <div class="flex gap:2 mt:6 justify-content:space-between ai:center ">
        <label class="flex:.5 f:15">Message</label>
        <input
          type="text"
          value={values.regex[regexprops.index].message}
          onChange={(e) => setValues('regex', regexprops.index, 'message', e.target.value)}
          class="flex:1 f:15 border:1px|solid|#ccc p:2"
        />
      </div>
      <div>
        <button type="button" onClick={() => deleteRegex(regexprops.index)} class="border:1px|solid|#ccc p:2">Delete Regex</button>
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
              <Match when={rule === 'required'}>
                <RuleInput
                  rule={rule}
                  label="Required"
                  type="checkbox"
                  value={values.required}
                  onChange={(e) => setValues('required', e.target.checked)}
                />
              </Match>
              <Match when={rule === 'email'}>
                <RuleInput
                  rule={rule}
                  label="Email"
                  type="checkbox"
                  value={values.email}
                  onChange={(e) => setValues('email', e.target.checked)}
                />
              </Match>
              <Match when={rule === 'minLength'}>
                <RuleInput
                  rule={rule}
                  label="Min Length"
                  type="number"
                  value={values.minLength}
                  onChange={(e) => setValues('minLength', Number.parseInt(e.target.value))}
                />
              </Match>
              <Match when={rule === 'maxLength'}>
                <RuleInput
                  rule={rule}
                  label="Max Length"
                  type="number"
                  value={values.maxLength}
                  onChange={(e) => setValues('maxLength', Number.parseInt(e.target.value))}
                />
              </Match>
              <Match when={rule === 'regex'}>
                <button type="button" onClick={addRegex}>Add Regex</button>
                <For each={values.regex}>
                  {(regex, index) => (
                    <RegexInput index={index()} />
                  )}
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
      <input type="text" value={values()} onChange={handleChange} />
      {error() && <div class="error">{error()}</div>}
    </div>
  );
};

