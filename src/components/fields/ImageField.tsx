
import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

export function ImageField(props: Readonly<GenericComponentProps>) {
  const [_local, others] = splitProps(props, ['componentName', 'meta', 'data', 'setValue', 'value', 'isRealTime', 'isTableInside', 'setValue', 'txnId', 'children']);

  return <img
    loading="lazy"
    {...others}
  />
}