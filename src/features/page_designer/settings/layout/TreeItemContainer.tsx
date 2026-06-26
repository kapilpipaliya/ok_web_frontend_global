import { createMemo, type Accessor, type JSX, splitProps } from "solid-js";
import { As } from "~/components/As";
import { ensureArray } from "~/lib/data_structure/array/ensureArray";
import { getHoveredItemStyle, getSelectedItemStyle } from "./treeUtils";
import type { CssType } from "~/components/form/type/CssType";

export interface TreeItemContainerProps {
  children: JSX.Element;
  class?: string;
  hasChildren: boolean;
  isDragOver?: boolean;
  isHovered?: boolean | Accessor<boolean>;
  isSelected?: boolean | Accessor<boolean>;
  itemId?: string | number;
  css?: CssType;
  // Include standard HTMLDivElement attributes
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onMouseEnter?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onmouseleave?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  onPointerDown?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  onPointerEnter?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  onPointerLeave?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  onPointerUp?: JSX.EventHandlerUnion<HTMLDivElement, PointerEvent>;
  ref?: (element: HTMLDivElement) => void;
  tabIndex?: number;
}

export function TreeItemContainer(props: TreeItemContainerProps) {
  const [local, others] = splitProps(props, [
    "class",
    "hasChildren",
    "isDragOver",
    "isHovered",
    "isSelected",
    "itemId",
    "css",
  ]);

  const resolveProp = <T,>(value: T | Accessor<T> | undefined) =>
    typeof value === "function" ? (value as Accessor<T>)() : value;

  // little dark shadow on top, little lite shadow on bottom
  const containerStyles = createMemo(() => {
    const hovered = resolveProp(props.isHovered);
    const selected = resolveProp(props.isSelected);
    return `return \`._id {
    align-items: center;
    display: flex;
    gap: 0.375rem;
    font-size: 14px;
    font-weight: ${props.hasChildren ? "bold" : "normal"};
    width: 100%;
    border-radius: ${props.hasChildren ? "5px" : "0 5px 5px 0"};
    ${hovered && !selected ? getHoveredItemStyle() : ""}
    ${selected ? getSelectedItemStyle() : ""}
    ${!props.isDragOver && props.hasChildren ? "box-shadow: rgba(0, 0, 0, 0.2) 0.15px -1px 5.15px -0.9px;" : ""}
    padding: 2px 0;
    transition: all 0.15s ease-in-out;
  }\`;`;
  });

  return (
    <As
      as="div"
      css={[containerStyles(), ...ensureArray(props.css)]}
      data-item-id={local.itemId ? String(local.itemId) : undefined}
      tabIndex={resolveProp(props.isSelected) ? 0 : -1}
      {...others}
    />
  );
}
