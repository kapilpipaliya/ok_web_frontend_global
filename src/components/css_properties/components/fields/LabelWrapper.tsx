import { createMemo } from "solid-js";

import type { GenericField } from "../../constants/FieldSchemaType";

import { ContainerLabel } from "./ContainerLabel";

export function LabelWrapper(
  props: Readonly<{
    meta: GenericField;
    onResetIconClick?: () => void;
    value?: any;
  }>,
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
