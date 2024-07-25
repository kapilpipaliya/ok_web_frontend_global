import type { JSX } from "solid-js";

import clsx from "clsx";

import type { badgeColors, badgeSizes } from "../core";

type BadgeProps = {
  color?: ({} & string) | keyof typeof badgeColors;
  rounded?: boolean;
  size?: ({} & string) | keyof typeof badgeSizes;
} & JSX.IntrinsicElements["span"];

const Badge = (props: Readonly<BadgeProps>) => {
  return (
    <span
      {...props}
      class={clsx(
        "badge",
        props.size && `badge-${props.size}`,
        props.color && `badge-${props.color}`,
        props.rounded && "rounded",
        props.class,
      )}
    />
  );
};

export default Badge;
