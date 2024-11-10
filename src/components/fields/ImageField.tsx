import type { JSX } from "solid-js";

import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

interface ImageFieldProps
  extends Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, "onChange">,
    GenericComponentProps {}

export function ImageField(props: ImageFieldProps) {
  const [_local, others] = splitProps(props, ["children"]);

  return <img loading="lazy" {...others} />;
}
