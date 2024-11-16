import { type Accessor, createMemo } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { ColorPickerField, GenericField } from "../../constants/FieldSchemaType";

import { useRenderContext } from "../../context/RenderContext";
import { ContainerLabel } from "./ContainerLabel";

export function LabelWrapper(
  props: Readonly<{ onResetIconClick?: () => void; value?: any, meta: GenericField }>,
) {
  const isValueConfigured = createMemo(() => {
    if (Array.isArray(props.value)) {
      return props.value.length > 0;
    }
    return !!props.value;
  });
  return (
    <ContainerLabel
      hashName={props.meta.hashName}
      info={props.meta.info ?? props.meta.key}
      onResetIconClick={props.onResetIconClick}
      showResetIcon={isValueConfigured()}
      title={props.meta.label}
    />
  );
}
