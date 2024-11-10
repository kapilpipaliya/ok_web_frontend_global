import { createMemo, ParentProps, Show } from "solid-js";

import { usePageRenderContext } from "../page_attr_render/PageRenderContext";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";

export function FragmentField(_props: ParentProps) {
  const [parentContext] = usePageRenderContext();

  return (
    <Show when={parentContext?.context.meta?.id}>
      <PageAttrRender data={parentContext!.context.data!} metaVertex={parentContext!.context.meta!} />
    </Show>
  );
}
