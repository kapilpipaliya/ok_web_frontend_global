import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";

const SelectChevronIndicator = (props: Readonly<JSX.SvgSVGAttributes<SVGSVGElement>>) => {
  const [local, others] = splitProps(props, ["class"]);
  return (
    <svg
      {...others}
      class={clsx("select-indicator right:.5em", local.class)}
      fill="none"
      height="1em"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.2"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 9l6 6l6 -6" />
    </svg>
  );
};

export default SelectChevronIndicator;
