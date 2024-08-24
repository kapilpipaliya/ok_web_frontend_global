import { path } from "rambda";
import { type Accessor, createMemo } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";

import type { ColorPickerField } from "../constants/FieldSchemaType";

import {
  useCssDefaultEditor,
  useCssEditor,
  useCssState,
} from "../CssEditorContext";
import { useRenderContext } from "../RenderContext";
import { ContainerLabel } from "./ContainerLabel";

export function LabelWrapper(
  props: Readonly<{ onResetIconClick?: () => void }>,
) {
  const [cssState, setCssState] = useCssEditor();
  const [cssDefault] = useCssDefaultEditor();
  const [state] = useCssState();
  const [parentItems] = useRenderContext();
  const meta = getLastItem(parentItems?.meta || []) as Accessor<ColorPickerField>;

  const isValueConfigured = createMemo(() => {
    const projections = [state() || "", ...(meta().projections ?? []), meta().name];
    const value = path(projections, cssState);
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return !!value;
  });
  return (
    <ContainerLabel
      hashName={meta().hashName}
      info={meta().name ?? meta().info}
      onResetIconClick={() => {
        const projections = [
          state() || "",
          ...(meta().projections ?? []),
          meta().name,
        ];
        const value = path(projections, cssDefault);
        setCssState(state(), ...(meta().projections ?? []), {
          [meta().name]: value,
        });
        props.onResetIconClick?.();
      }}
      showResetIcon={isValueConfigured()}
      title={meta().label}
    />
  );
}
