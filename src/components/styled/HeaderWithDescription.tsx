import type { JSX } from "solid-js";

interface WithDescriptionProps {
  backgroundColor?: string;
  borderColor?: string;
  class?: string;
  description?: JSX.Element | string;
  descriptionColor?: string;
  paddingX?: string;
  paddingXSm?: string;
  paddingY?: string;
  title?: string;
  titleColor?: string;
}

export function HeaderWithDescription(
  props: Readonly<WithDescriptionProps>,
): JSX.Element {
  return (
    <div
      classList={{
        [`bg:${props.backgroundColor || "rgb(255,255,255)"}`]: true,
        [`border-color:${props.borderColor || "rgb(229,231,235)"}`]: true, // border-gray-200
        [`px:${props.paddingXSm || "1.5rem"}@sm`]: true,
        [`px:${props.paddingX || "1rem"}`]: true,
        [`py:${props.paddingY || "1.25rem"}`]: true,
        "border-bottom-width:1px": true,
        [props.class || ""]: !!props.class,
      }}
    >
      <h3
        classList={{
          [`color:${props.titleColor || "rgb(17,24,39)"}`]: true, // text-gray-900
          "f:1rem": true,
          "font-weight:600": true,
          "leading:1.5rem": true,
          "lh:1.5rem": true,
        }}
      >
        {props.title || ""}
      </h3>
      <p
        classList={{
          [`color:${props.descriptionColor || "rgb(107,114,128)"}`]: true, // text-gray-500
          "f:0.875rem": true,
          "lh:1.25rem": true,
          "mt:0.25rem": true,
        }}
      >
        {props.description || ""}
      </p>
    </div>
  );
}
