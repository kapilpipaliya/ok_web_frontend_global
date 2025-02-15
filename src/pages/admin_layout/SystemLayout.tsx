import type { JSX } from "solid-js";

interface SystemLayoutProps {
  children?: JSX.Element;
}

export function SystemLayout(props: Readonly<SystemLayoutProps>): JSX.Element {
  return (
    <>{props.children}</>
  );
}
