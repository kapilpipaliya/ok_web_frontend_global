import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";

type TabProps = {
  active?: boolean;
} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

const Tab = (props: TabProps) => {
  const [local, others] = splitProps(props, ["class", "active"]);
  return (
    <a {...others} class={clsx("tab", local.class, local.active && "active")} />
  );
};

export default Tab;
