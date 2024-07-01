import type { JSX } from "solid-js";

import {
  type Accessor,
  type Component,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import "./tooltip.css";

export type TooltipTrigger =
  | "focus"
  | "hover"
  | ("focus" | "hover" | Accessor<boolean>)[]
  | Accessor<boolean>
  | boolean;

export type TooltipPosition = "e" | "n" | "ne" | "nw" | "s" | "se" | "sw" | "w";

export type TooltipProps = {
  arrow?: boolean;
  content: JSX.Element;
  nowrap?: boolean;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
} & JSX.HTMLAttributes<HTMLSpanElement>;

declare module "solid-js" {
  namespace JSX {
    interface CustomCaptureEvents {
      blur: FocusEvent;
      focus: FocusEvent;
    }
  }
}

const computeVisible = (
  trigger: TooltipTrigger | undefined,
  initial?: boolean,
): boolean =>
  trigger === undefined
    ? false
    : (Array.isArray(trigger) ? trigger : [trigger]).reduce<boolean>(
        (visible: boolean, trigger: TooltipTrigger) =>
          typeof trigger === "boolean"
            ? trigger
            : typeof trigger === "function"
              ? trigger()
              : visible,
        initial ?? false,
      );

const triggerHas = (
  trigger: TooltipProps["trigger"] | undefined,
  event: "focus" | "hover",
) =>
  trigger === undefined ||
  trigger === event ||
  (Array.isArray(trigger) && trigger.includes(event));

const wrapText = (children: JSX.Element): JSX.Element => {
  if (typeof children === "function") {
    return wrapText(children());
  }
  if (typeof children === "string") {
    return <span>{children}</span>;
  }
  if (Array.isArray(children)) {
    const result = children.map((child) =>
      typeof child === "function" ? child() : child,
    );
    if (result.every((child) => typeof child === "string")) {
      return <span>{result}</span>;
    }
    return result;
  }
  return children;
};

export const Tooltip: Component<TooltipProps> = (props) => {
  let wrapperRef!: HTMLSpanElement;

  const [local, spanProps] = splitProps(props, [
    "children",
    "position",
    "content",
    "trigger",
    "arrow",
    "nowrap",
  ]);
  const useFocus = createMemo(() => triggerHas(local.trigger, "focus"));
  const useHover = createMemo(() => triggerHas(local.trigger, "hover"));
  const children = createMemo(() =>
    triggerHas(local.trigger, "focus")
      ? wrapText(local.children)
      : local.children,
  );
  const [visible, setVisible] = createSignal(false);
  createEffect(() => setVisible(computeVisible(local.trigger)));

  const [positionStyle, setPositionStyle] = createSignal<JSX.CSSProperties>();

  const focusHandler = createMemo(
    () => (ev: FocusEvent) => useFocus() && setVisible(ev.type === "focus"),
  );
  const hoverHandler = createMemo(
    () => (ev: { toElement?: HTMLElement } & MouseEvent) =>
      useHover() &&
      setVisible(
        wrapperRef.contains((ev.toElement ?? ev.target) as Node | null),
      ),
  );

  createEffect(() => {
    if (!visible() || !wrapperRef?.offsetHeight) {
      return { top: "10px" };
    }
    setPositionStyle(
      local.position === "nw"
        ? {
            left: `${wrapperRef.offsetLeft}px`,
            top: `${wrapperRef.offsetTop}px`,
          }
        : local.position === "n"
          ? {
              left: `${
                wrapperRef.offsetLeft + (wrapperRef.offsetWidth >> 1)
              }px`,
              top: `${wrapperRef.offsetTop}px`,
            }
          : local.position === "ne"
            ? {
                left: `${wrapperRef.offsetLeft + wrapperRef.offsetWidth}px`,
                top: `${wrapperRef.offsetTop}px`,
              }
            : local.position === "e"
              ? {
                  left: `${wrapperRef.offsetLeft + wrapperRef.offsetWidth}px`,
                  top: `${
                    wrapperRef.offsetTop + (wrapperRef.offsetHeight >> 1)
                  }px`,
                }
              : local.position === "se"
                ? {
                    left: `${wrapperRef.offsetLeft + wrapperRef.offsetWidth}px`,
                    top: `${wrapperRef.offsetTop + wrapperRef.offsetHeight}px`,
                  }
                : local.position === "sw"
                  ? {
                      left: `${wrapperRef.offsetLeft}px`,
                      top: `${
                        wrapperRef.offsetTop + wrapperRef.offsetHeight
                      }px`,
                    }
                  : local.position === "w"
                    ? {
                        left: `${wrapperRef.offsetLeft}px`,
                        top: `${
                          wrapperRef.offsetTop + (wrapperRef.offsetHeight >> 1)
                        }px`,
                      }
                    : /* s is default */ {
                        left: `${
                          wrapperRef.offsetLeft + (wrapperRef.offsetWidth >> 1)
                        }px`,
                        top: `${
                          wrapperRef.offsetTop + wrapperRef.offsetHeight
                        }px`,
                      },
    );
  });

  return (
    <span
      aria-expanded={visible()}
      aria-haspopup="true"
      class={`sb-tooltip-wrapper position-${local.position ?? "s"}${
        local.arrow === false ? "" : " arrow"
      }${local.nowrap ? " nowrap" : ""}`}
      oncapture:blur={focusHandler()}
      oncapture:focus={focusHandler()}
      onmouseleave={hoverHandler()}
      onmouseover={hoverHandler()}
      ref={wrapperRef}
    >
      {children()}
      <span
        {...spanProps}
        hidden={!visible()}
        role="tooltip"
        style={positionStyle()}
      >
        {local.content}
      </span>
    </span>
  );
};
