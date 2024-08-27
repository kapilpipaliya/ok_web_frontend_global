import { createSignal, For } from "solid-js";

import { TextFieldWithSelect } from "./TextFieldWithSelect";

export function ArrayComponent(props: Readonly<{
  onChange: (value: number[] | string[]) => void;
  type?: "number" | "string";
  unitOptions?: string[];
  value: number[] | string[];
}>) {
  const [items, setItems] = createSignal<(number | string)[]>(props.value || []);

  const addItem = () => {
    const newItems = [...items(), props.type === "number" ? 0 : ""];
    setItems(newItems);
    props.onChange(newItems as number[] | string[]);
  };

  const removeItem = (index: number) => {
    const newItems = items().filter((_, i) => i !== index);
    setItems(newItems);
    props.onChange(newItems as number[] | string[]);
  };

  const updateItem = (index: number, value: number | string) => {
    const newItems = [...items()];
    newItems[index] = value;
    setItems(newItems);
    props.onChange(newItems as number[] | string[]);
  };

  return (
    <div class="d:flex flex:col gap:8">
      <For each={items()}>
        {(item, index) => (
          <div class="flex ai:center gap:8">
            <TextFieldWithSelect
              onChange={(value) => updateItem(index(), value)}
              type={props.type}
              unitOptions={props.unitOptions}
              value={item.toString()} />
            <button
              class="c:white rounded bg:red-50 px:8 py:4"
              onClick={() => removeItem(index())}
            >
              Remove
            </button>
          </div>
        )}
      </For>
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={addItem}
      >
        Add Item
      </button>
    </div>
  );
}
