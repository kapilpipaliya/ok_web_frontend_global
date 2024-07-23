import { path } from "rambda";
import { createMemo } from "solid-js";

import type { ColorPickerField } from "../constants/FieldType";

import { useComponentMeta, useCssDefaultEditor, useCssEditor, useCssState } from "../CssEditorContext";
import { ContainerLabel } from "./ContainerLabel";

export function LabelWrapper(props: Readonly<{ onResetIconClick?: () => void }>) {
  const [cssState, setCssState] = useCssEditor();
  const [cssDefault] = useCssDefaultEditor();
  const [state] = useCssState();
  const meta = useComponentMeta() as ColorPickerField;

  const isValueConfigured = createMemo(
    () => {
      const projections = [state() || "", ...(meta.projections ?? []), meta.name];
      const value = path(projections, cssState);
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }
  );
  return (
    <ContainerLabel
      hashName={meta.hashName}
      info={meta.name ?? meta.info}
      onResetIconClick={() => {
        const projections = [state() || "", ...(meta.projections ?? []), meta.name];
        const value = path(projections, cssDefault);
        setCssState(state(), ...(meta.projections ?? []), {
          [meta.name]: value,
        });
        props.onResetIconClick?.();
      }}
      showResetIcon={isValueConfigured()}
      title={meta.label} />
  );
}
