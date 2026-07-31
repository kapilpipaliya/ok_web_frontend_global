import type { JSX } from "solid-js";

import { STYLES } from "~/pages/settings/constants";
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
        `return \`._id {
      position: relative;
      border-radius: 10px;
    }\`;`,
        STYLES.overflowCss,
      ]}
    >
      <As
        as="div"
        css={[
          ...ensureArray(props.css),
          `return \`._id {
          display: grid;
          border-bottom: 2px solid \${t.var.color.primary};
          font-size: 0.9em;
          grid-template-columns: repeat(${props.headers}, 1fr);
          border-radius: 10px;
          width: 100%;
        }\`;`,
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
        `return \`._id {
        animation: fade 0.4s;
        align-content: center;
        padding: 2px;
        max-height: 150px;
        overflow: auto;
        
        /* Thin scrollbar styling */
        scrollbar-width: thin;
        scrollbar-color: \${t.var.color.border} transparent;
        
        &::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
          background: \${t.var.color.border};
          border-radius: 2px;
        }
        
        &::-webkit-scrollbar-thumb:hover {
          background: \${t.var.color.border_dark_200};
        }
      }\`;`,
        props.index && props.index % 2 !== 0
          ? "return `._id { background-color: ${t.var.color.primary_light_800}; color: ${t.var.color.primary_light_800_text}; }`;"
          : "",
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
      css={`return \`._id {
      background-color: \${t.var.color.primary};
      border: 1px solid \${t.var.color.primary_dark_100};
      color: \${t.var.color.primary_text};
      font-weight: 600;
      padding: 10px;
      text-align: center;
    }\`;`}
    >
      {props.children}
    </As>
  );
}
