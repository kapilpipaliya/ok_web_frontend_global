import { createComputed, For, Show } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Label } from "./Label";
import { focusLastInput } from "../../../utils/dom_utils";

interface Properties {
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  //isSaving?: boolean
  required?: boolean;
  value: string[];
  error?: string;
  placeholder?: string;
  label?: string;
  props?: {};
  dom?: HTMLInputElement;
  class?: string;

  ar?: boolean; // arrows
}

export const ArrayInput = (props: Properties) => {
  const tableElement: HTMLTableElement | undefined = undefined;

  const [state, setState] = createStore({ value: [] as string[] });

  createComputed(() => {
    if (props.value) setState({ value: props.value });
  });

  const handleAdd = () => {
    if (!props.disabled) {
      setState("value", state.value.length, "");
      setTimeout(() => focusLastInput(tableElement), 50);
    }
  };

  const handleDelete = (row: number) => (e: Event) => {
    e.stopPropagation();
    setState({ value: state.value.filter((_, i) => i !== row) });
    if (props.onChange) props.onChange(state.value);
  };

  const onReorder = (from: number, to: number) => (event: Event) => {
    event.stopPropagation();
    setState({ value: state.value.map((item, i, array) => (i === from ? array[to] : i === to ? array[from] : item)) });
    if (props.onChange) props.onChange(state.value);
  };

  const onChange = (i: number) => (e: Event & { currentTarget: HTMLInputElement; target: Element }) => {
    setState(
      "value",
      produce<string[]>((l) => {
        l[i] = (e.target as HTMLInputElement).value;
      })
    );
    if (props.onChange) props.onChange(state.value);
  };

  return (
    <>
      <Label name={props.label || ""} />

      <table ref={tableElement} class={"permissions"}>
        <tbody>
          <For each={state.value ?? []}>
            {(v, i) => (
              <tr>
                <td>
                  <input type="text" value={v} onChange={onChange(i())} required disabled={props.disabled} />
                </td>
                <Show when={props.ar}>
                  <td>
                    <button type="button" onClick={onReorder(i(), i() - 1)} disabled={props.disabled || i() == 0}>
                      ˄
                    </button>
                  </td>
                  <td>
                    <button type="button" onClick={onReorder(i(), i() + 1)} disabled={props.disabled || i() == props.value.length - 1}>
                      ˅
                    </button>
                  </td>
                </Show>
                <td>
                  <button type="button" onClick={handleDelete(i())} disabled={props.disabled}>
                    x
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <button type="button" onClick={handleAdd} disabled={props.disabled}>
        Add
      </button>
      <span>{props.error}</span>
    </>
  );
};
