import type { JSX } from "solid-js";

import "./breadcrumbs.css";

export type BreadcrumbsProps = {
  children: JSX.Element | JSX.Element[];
} & JSX.HTMLAttributes<HTMLOListElement>;

export function Breadcrumbs(props: BreadcrumbsProps) {
  return (
    <nav class="sb-breadcrumbs">
      <ol {...props}>
        {/* <For each={Array.isArray(props.children) ? props.children : [props.children]}
            >
              {(item) => <li>{item}</li>}
            </For> */}
        {props.children}
      </ol>
    </nav>
  );
}
