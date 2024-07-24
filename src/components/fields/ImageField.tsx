
import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./ComponentType";

export function ImageField(props: Readonly<GenericComponentProps>) {
  const [local, others] = splitProps(props, ['componentName', 'meta', 'data', 'setValue', 'value', 'isRealTime', 'isTableInside', 'setValue', 'txnId', 'children']);

  return <img
    loading="lazy"
    {...others}
  />
}