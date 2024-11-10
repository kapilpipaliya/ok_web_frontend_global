import type { JSX } from "solid-js";

import { splitProps } from "solid-js";

import type { GenericComponentProps } from "./FieldType";

interface UrlFieldProps
  extends Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, "onChange">,
    GenericComponentProps {
  href?: string;
}

export function UrlField(props: UrlFieldProps) {
  const [local, others] = splitProps(props, [
    "componentName",
    "onChange",
    "value",
    "children",
    "href",
    "error",
  ]);

  return (
    <a {...others} href={local.href}>
      {local.children}
    </a>
  );
}
