import type { JSX } from "solid-js";

import { STYLES } from "~/pages/settings/constants";
import { css } from "~/lib/styles";
import { As } from "../As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import type { CssType } from "~/components/form/type/CssType";

export function Table(
  props: Readonly<{ children: JSX.Element; css?: string; headers: number }>,
) {
  return (
    <As
      as="div"
      css={[
        css`
      position: relative;
      border-radius: 10px;
    `,
        STYLES.overflowCss,
      ]}
    >
      <As
        as="div"
        css={[
          ...ensureArray(props.css),
          css`
          display: grid;
          border-bottom: 2px solid #37c;
          font-size: 0.9em;
          grid-template-columns: repeat(${props.headers}, 1fr);
          border-radius: 10px;
          width: 100%;
        `,
          STYLES.overflowCss,
        ]}
      >
        {props.children}
      </As>
    </As>
  );
}

export function TableBodyCell(
  props: Readonly<{
    children: JSX.Element;
    css?: CssType;
    index?: number;
  }>,
) {
  return (
    <As
      as="div"
      css={[
        css`
        animation: fade 0.4s;
        align-content: center;
        padding: 2px;
        text-align: center;
        ${props.index && props.index % 2 !== 0 ? "background-color: ${args.theme.var.color.primary_10};" : ""}
      `,
        ...ensureArray(props.css),
      ]}
    >
      {props.children}
    </As>
  );
}

export function TableHeadCell(props: Readonly<{ children: JSX.Element }>) {
  return (
    <As
      as="div"
      css={css`
      background-color: \${args.theme.var.color.primary_90};
      border: 1px solid \${args.theme.var.color.primary_200};
      color: \${args.theme.var.color.base_10};
      font-weight: 600;
      padding: 10px;
      text-align: center;
    `}
    >
      {props.children}
    </As>
  );
}
