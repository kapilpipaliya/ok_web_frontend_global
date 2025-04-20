import { usePageRenderContext } from "~/features/page_attr_render/context/PageRenderContext";
import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { As } from "../As";
import { css } from "~/lib/styles";

export function NotFoundComponent() {
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  return (
    <As as="div" css={args => css`
  color: ${args.theme.var.color.error};
`}>{`${parentRenderContext()?.context.componentName ?? "Component"} Not implemented`}</As>
  );
}
