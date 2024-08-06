import { createMemo, type JSX, splitProps } from "solid-js";

export interface TreeItemContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  class?: string;
  hasChildren: boolean;
  isDragOver?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
}

export function TreeItemContainer(props: TreeItemContainerProps) {
  const [local, others] = splitProps(props, ['class', 'hasChildren', 'isDragOver', 'isHovered', 'isSelected']);

  const divClasses = createMemo(() => ({
    "align-items:center": true,
    "bg:#F2EDED": local.isHovered,
    "bg:rgb(197,221,255)": local.isSelected,
    // little dark shadow on top, little lite shadow on bottom
    "box-shadow:rgba(0,0,0,0.2)|0.15px|-1px|5.15px|-0.9px": !local.isDragOver && local.hasChildren,
    "display:flex": true,
    "font-size:14px": true,
    "font-weight:bold": local.hasChildren,
    "font-weight:normal": !local.hasChildren,
    "justify-content:space-between": true,
    [local.class!]: !!local.class,
    "r:0|5|5|0": !local.hasChildren,
    "r:5|5|5|5": local.hasChildren,
    "w:100%": true,
  }));

  return (
    <div classList={divClasses()} {...others} />
  );
}
