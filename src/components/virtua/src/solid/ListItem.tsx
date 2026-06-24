/**
 * @jsxImportSource solid-js
 */
import type { ItemResizeObserver } from "../core/index.js";
import {
  type Component,
  type JSX,
  createEffect,
  createMemo,
  mergeProps,
  onCleanup,
  type ParentProps,
  type ValidComponent,
} from "solid-js";
import { Dynamic } from "solid-js/web";

interface ListItemProps extends ParentProps {
  resizer: ItemResizeObserver;
  index: number;
  offset: number;
  hide: boolean;
  isHorizontal: boolean;
  as?: ValidComponent;
}

/**
 * @internal
 */
export const ListItem: Component<ListItemProps> = (props) => {
  let elementRef: HTMLDivElement | undefined;
  props = mergeProps<[Partial<ListItemProps>, ListItemProps]>(
    { as: "div" },
    props,
  );

  createEffect(() => {
    if (!elementRef) return;
    onCleanup(props.resizer(elementRef, props.index));
  });

  const style = createMemo(() => {
    const isHorizontal = props.isHorizontal;
    const style: JSX.CSSProperties = {
      contain: "layout style",
      position: "absolute",
      [isHorizontal ? "height" : "width"]: "100%",
      [isHorizontal ? "top" : "left"]: "0px",
      [isHorizontal ? "left" : "top"]: props.offset + "px",
      visibility: props.hide ? "hidden" : undefined,
    };
    if (isHorizontal) {
      style.display = "inline-flex";
    }
    return style;
  });

  return (
    <Dynamic
      component={props.as}
      index={props.index}
      ref={elementRef}
      style={style()}
    >
      {props.children}
    </Dynamic>
  );
};
