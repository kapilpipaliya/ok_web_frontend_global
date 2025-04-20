import type { JSX } from "solid-js";
import { As } from "../As";
import { css } from "~/lib/styles";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

interface WithDescriptionProps {
  backgroundColor?: string;
  borderColor?: string;
  css?: string;
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
    <As
      as="div"
      css={[
        ...ensureArray(props.css),
        css`background-color: ${props.backgroundColor || "rgb(255,255,255)"};
        border-color: ${props.borderColor || "rgb(229,231,235)"};
        border-bottom-width: 1px;
        padding: ${props.paddingY || "1.25rem"} ${props.paddingX || "1rem"};`,
        css`@media (min-width: 640px) { padding: ${props.paddingY || "1.25rem"}; ${props.paddingXSm || "1.5rem"}; }`
      ]}
    >
      <As
        as="h3"
        css={[
          css`color: ${props.titleColor || "rgb(17,24,39)"};
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.5rem;`,
        ]}
      >
        {props.title || ""}
      </As>
      <As
        as="p"
        css={[
          css`color: ${props.descriptionColor || "rgb(107,114,128)"};
          font-size: 0.875rem;
          line-height: 1.25rem;
          margin-top: 0.25rem;`,
        ]}
      >
        {props.description || ""}
      </As>
    </As>
  );
}
