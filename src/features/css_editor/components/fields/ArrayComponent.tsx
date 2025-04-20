import { createSignal, For } from "solid-js";
import { As } from "~/components/As";
import { css } from "~/lib/styles";

import { TextFieldWithSelect } from "./textfield_with_unit/TextFieldWithSelect";

export function ArrayComponent(
  props: Readonly<{
    onChange: (value: number[] | string[]) => void;
    type?: "number" | "string";
    unitOptions?: string[];
    value: number[] | string[];
  }>,
) {
  const [items, setItems] = createSignal<(number | string)[]>(
    props.value || [],
  );

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
    <As
      as="div"
      css={css`
        display: flex;
        flex-direction: column;
        gap: 8px;
      `}
    >
      <For each={items()}>
        {(item, index) => (
          <As
            as="div"
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <TextFieldWithSelect
              // componentName="string"
              // key={`array-item-${index()}`}
              // label=""
              onChange={(value) => updateItem(index(), value)}
              // options={[]}
              type={props.type}
              unitOptions={props.unitOptions}
              value={item.toString()}
            />
            <As
              as="button"
              css={args => css`
                color: white;
                border-radius: 4px;
                background: ${args.theme.var.color.error};
                padding: 4px 8px;
              `}
              onClick={() => removeItem(index())}
            >
              Remove
            </As>
          </As>
        )}
      </For>
      <As
        as="button"
        css={args => css`
          color: white;
          border-radius: 4px;
          background: ${args.theme.var.color.primary};
          padding: 4px 8px;
        `}
        onClick={addItem}
      >
        Add Item
      </As>
    </As>
  );
}
