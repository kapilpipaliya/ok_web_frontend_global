import clsx from "clsx";
import { createMemo, splitProps } from "solid-js";

import type { selectSizes } from "../core";

import SelectIndicator from "./SelectIndicator";

type SelectProps = {
  indicator?: JSX.Element;
  outlined?: boolean;
  size?: keyof typeof selectSizes | string;
} & JSX.SelectHTMLAttributes<HTMLSelectElement>;

const Select = (props: SelectProps) => {
  const [local, others] = splitProps(props, [
    "class",
    "size",
    "indicator",
    "outlined",
  ]);
  const indicator = createMemo(() => local.indicator || <SelectIndicator />);

  return (
    <label
      class={clsx(
        "select",
        `select-${local.size ?? "md"}`,
        local.class,
        local.outlined && "select-outlined",
      )}
    >
      <select {...others} class="select-control" />
      {indicator()}
    </label>
  );
};

export default Select;
