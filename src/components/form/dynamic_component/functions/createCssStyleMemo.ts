import type { Vertex } from "~/lib/graph/type/vertex";
import type { FunctionArgumentType } from "~/components/form/type/FieldSchemaType";
import { createMemo, type Accessor } from "solid-js";

import { scopeComponentCss } from "~/lib/styles/scopeComponentCss";
import { useComponentCssLifecycle } from "~/lib/styles/useComponentCssLifecycle";

export function createCssStyleMemo(
  props: {
    meta: Vertex;
  },
  options: {
    getFunctionArgumentWithValue: () => FunctionArgumentType;
  },
): {
  cssStyle: Accessor<string | undefined>;
  styleId: Accessor<string | undefined>;
} {
  const scopedCss = createMemo(() =>
    scopeComponentCss(props.meta.P.css, options.getFunctionArgumentWithValue()),
  );

  useComponentCssLifecycle(scopedCss);

  const cssStyle = () => scopedCss()?.scoped;
  const styleId = () => scopedCss()?.hash;

  return { cssStyle, styleId };
}
