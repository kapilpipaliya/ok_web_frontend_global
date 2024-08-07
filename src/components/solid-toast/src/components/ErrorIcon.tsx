import type { Component } from "solid-js";

import type { IconProps } from "../types";

import { genSVGCubicBezier } from "../util";
import { MainCircle, SecondaryCircle } from "./IconCircle";

export const Error: Component<IconProps> = (props) => {
  const fill = props.primary || "#FF3B30";
  return (
    <svg
      height="1.25rem"
      style={{ overflow: "visible" }}
      viewBox="0 0 32 32"
      width="1.25rem"
    >
      <MainCircle fill={fill} />
      <SecondaryCircle fill={fill} />
      <path
        d="M16,7l0,9"
        fill="none"
        stroke={props.secondary || "#FFFFFF"}
        stroke-dasharray="9"
        stroke-dashoffset="9"
        stroke-linecap="round"
        stroke-width="4"
      >
        <animate
          attributeName="stroke-dashoffset"
          begin="250ms"
          dur="0.2s"
          fill="freeze"
          values="9;0"
          {...genSVGCubicBezier("0.0, 0.0, 0.58, 1.0")}
        />
      </path>
      <circle
        cx="16"
        cy="23"
        fill={props.secondary || "#FFFFFF"}
        opacity="0"
        r="2.5"
      >
        <animate
          attributeName="opacity"
          begin="350ms"
          dur="0.25s"
          fill="freeze"
          values="0;1"
          {...genSVGCubicBezier("0.0, 0.0, 0.58, 1.0")}
        />
      </circle>
    </svg>
  );
};
