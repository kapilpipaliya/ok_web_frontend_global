import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";

export function NotFoundComponent() {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  return (
    <div
      class={"fg:error"}
    >{`${parentRenderContext()?.context.componentName ?? "Component"} Not implemented`}</div>
  );
}
