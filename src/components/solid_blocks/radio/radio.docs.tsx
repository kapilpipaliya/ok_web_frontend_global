import { createSignal } from "solid-js";

import { Radio, RadioGroup } from "./radio";

export function RadioDocs() {
  const [value, setValue] = createSignal("2");
  const [events, setEvents] = createSignal("");
  return (
    <>
      <h2 id="radio-docs">Radio / RadioGroup</h2>
      <p>
        The radio component is a simple radio button. It has all the properties
        of a normal input with type="radio". However, wrapping it in a radio
        group allows an easy way to control it.
      </p>
      <h3>Properties</h3>
      <pre>
        {`
RadioProps {
  align?: 'left' | 'right';
  autofocus?: boolean;
  setChecked?: (checked: boolean) => void;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  value?: string;
}
RadioGroupProps {
  setValue?: (value?: string) => void;
  value?: () => string;
}`}
      </pre>
      <button onClick={() => setValue("1")} variant="secondary">
        Activate first
      </button>
      <button onClick={() => setValue("2")} variant="secondary">
        Activate second
      </button>
      <pre data-title="setValue-calls" style={{ "max-height": "9em" }}>
        {events()}
      </pre>
      <div class="example">
        <RadioGroup
          class="flex-row"
          setValue={(value) => {
            setEvents((e) => `setValue("${value}")\n${e}`);
            setValue(value);
          }}
          value={value}
        >
          <Radio value="1"> First</Radio>
          <Radio value="2"> Second</Radio>
          <Radio disabled value="3">
            {" "}
            Third
          </Radio>
          <Radio aria-invalid="true" value="4">
            {" "}
            Fourth
          </Radio>
        </RadioGroup>
      </div>
      <hr />
    </>
  );
}
