import { createMemo, ParentProps, Show } from "solid-js";

import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";
import { PageAttrRender } from "../page_attr_render/PageAttrRender";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

export function FragmentField(_props: ParentProps) {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta;
  const data = () => parentRenderContext()?.context.data;
  return (
    <Show when={meta()?.id}>
      <PageAttrRender data={data()!} metaVertex={meta()!} />
    </Show>
  );
}
