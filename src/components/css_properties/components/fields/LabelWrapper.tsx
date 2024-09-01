import { type Accessor, createMemo } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { ColorPickerField } from "../../constants/FieldSchemaType";

import { useRenderContext } from "../../RenderContext";
import { ContainerLabel } from "./ContainerLabel";

export function LabelWrapper(
  props: Readonly<{ onResetIconClick?: () => void; value?: any }>,
) {
  const [parentItems] = useRenderContext();
  const meta = getLastItem(
    parentItems?.meta || [],
  ) as Accessor<ColorPickerField>;

  const isValueConfigured = createMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value.length > 0;
    }
    return !!props.value;
  });
  return (
    <ContainerLabel
      hashName={meta().hashName}
      info={meta().info ?? meta().key}
      onResetIconClick={props.onResetIconClick}
      showResetIcon={isValueConfigured()}
      title={meta().label}
    />
  );
}
