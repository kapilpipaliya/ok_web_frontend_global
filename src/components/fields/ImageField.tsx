import type { JSX } from "solid-js";

import { splitProps } from "solid-js";

import { getLastItem } from "~/lib/data_structure/array/getLastItem";
import { useGraph } from "~/lib/graph/graph";

import type { GenericComponentProps } from "./FieldType";

import { replacePlaceholderWithUrl } from "../css_properties/utils/cssStateToString";
import { usePageRenderContext } from "../page_attr_render/context/PageRenderContext";

interface ImageFieldProps
  extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "onChange">,
    GenericComponentProps {}

export function ImageField(props: ImageFieldProps) {
  const [graph] = useGraph();
  const parentItems = usePageRenderContext();
  const parentRenderContext = () => getLastItem(parentItems)?.[0];
  const meta = () => parentRenderContext()?.context.meta!;
  const [local, others] = splitProps(props, ["children", "src"]);

  return (
    <img
      loading="lazy"
      {...others}
      src={replacePlaceholderWithUrl(local.src ?? "", "$0Src", meta(), graph)}
    />
  );
}
