import { createContextProvider } from "@solid-primitives/context";

import type { Vertex } from "~/lib/graph/type/vertex";

export const [CssEditorPropsProvider, useCssEditorProps] =
  createContextProvider((props: { value: { data: Vertex; meta: Vertex } }) => {
    return props.value;
  });
