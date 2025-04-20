import { createMemo, type JSX, splitProps } from "solid-js";
import { css } from "~/lib/styles";
import { As } from "~/components/As";
import type { CssType } from "~/components/form/type/FieldSchemaType";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";

export interface TreeItemContainerProps
  extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  class?: string;
  hasChildren: boolean;
  isDragOver?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
  css?: CssType;
}

export function TreeItemContainer(props: TreeItemContainerProps) {
  const [local, others] = splitProps(props, [
    "class",
    "hasChildren",
    "isDragOver",
    "isHovered",
    "isSelected",
    "css",
  ]);

  // little dark shadow on top, little lite shadow on bottom
  const containerStyles = createMemo(
    () => css`
    align-items: center;
    display: flex;
    gap: 0.375rem;
    font-size: 14px;
    font-weight: ${local.hasChildren ? "bold" : "normal"};
    width: 100%;
    border-radius: ${local.hasChildren ? "5px" : "0 5px 5px 0"};
    ${local.isHovered ? "background-color: #F2EDED;" : ""}
    ${local.isSelected ? "background-color: rgb(197, 221, 255);" : ""}
    ${!local.isDragOver && local.hasChildren ? "box-shadow: rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px;" : ""}
  `,
  );

  return (
    <As
      as="div"
      css={[containerStyles(), ...ensureArray(props.css)]}
      {...others}
    />
  );
}
