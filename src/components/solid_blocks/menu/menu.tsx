import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { isServer } from "solid-js/web";

import { getElements } from "../tools";
import "./menu.css";

export type MenuProps = {
  align?: "center" | "left" | "right";
  ontoggle?: (open?: boolean) => void;
  open?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>;

const getFirstMenuButton = (open: Accessor<boolean>) => {
  let counter = 0;
  return (node: HTMLElement) => {
    const isButton =
      node.nodeName === "BUTTON" || node.getAttribute("role") === "button";
    const isMenuButton =
      isButton && node.getAttribute("aria-haspopup") === "menu";
    const isFirstMenuButton = isMenuButton && counter++ === 0;
    if (isFirstMenuButton) {
      if (open() && node.getAttribute("aria-expanded") !== "true") {
        node.setAttribute("aria-expanded", "true");
      } else if (!open() && node.getAttribute("aria-expanded") === "true") {
        node.setAttribute("aria-expanded", "false");
      }
    }
    return isFirstMenuButton;
  };
};

const getMenuItems = () => {
  let counter = 0;
  return (node: HTMLElement) => {
    const isButton =
      node.nodeName === "BUTTON" || node.getAttribute("role") === "button";
    const isMenuButton =
      isButton && node.getAttribute("aria-haspopup") === "menu";
    const isFirstMenuButton = isMenuButton && counter++ === 0;
    return !isFirstMenuButton;
  };
};

export function Menu(props: Readonly<MenuProps>) {
  const [open, setOpen] = createSignal(!!props.open);
  const [local, divProps] = splitProps(props, [
    "open",
    "children",
    "ontoggle",
    "align",
  ]);
  const opener = createMemo<HTMLElement | undefined>(
    () =>
      (getElements(props.children, getFirstMenuButton(open), [open()]) ??
        [])[0],
  );
  const menuItems = createMemo(
    () => getElements(props.children, getMenuItems(), [open()]) ?? [],
  );

  let menuRef!: HTMLDivElement;

  createEffect(() => {
    const visible = open();
    local.ontoggle?.(visible);
    if (visible) {
      menuItems()[0].focus();
    }
  });

  const clickHandler = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    const role = target?.getAttribute("role");
    const button = opener();
    if (!ev.defaultPrevented && button) {
      if (ev.target === button) {
        setOpen(
          (open) => !open && button.getAttribute("aria-disabled") !== "true",
        );
      } else if (
        !button.contains(target) &&
        role !== "menuitemradio" &&
        role !== "menuitemcheckbox"
      ) {
        setOpen(false);
      }
    }
  };

  onMount(
    () =>
      !isServer &&
      document.addEventListener("click", clickHandler, { capture: false }),
  );
  onCleanup(
    () => !isServer && document.removeEventListener("click", clickHandler),
  );

  let focusItem: HTMLElement | undefined;
  const overHandler = (ev: MouseEvent) => {
    const target = ev.target as HTMLElement;
    if (
      ["menuitem", "menuitemcheckbox", "menuitemradio"].includes(
        target?.getAttribute("role") ?? "",
      ) &&
      target?.tabIndex !== -1 &&
      target?.getAttribute("aria-disabled") !== "true"
    ) {
      focusItem = target;
      focusItem?.focus();
    }
  };

  const moveFocus = (step: -1 | 1) => {
    const menuItems = menuRef.querySelectorAll<HTMLElement>(
      '[role^=menuitem]:not([aria-disabled], [tabIndex="-1"])',
    );
    const currentPos = focusItem
      ? Array.prototype.findIndex.call(menuItems, (item) => item === focusItem)
      : -1;
    const newPos =
      currentPos === -1
        ? 1
        : (menuItems.length + step + currentPos) % menuItems.length;
    focusItem = menuItems[newPos];
    focusItem.focus();
  };

  const keyHandler = (ev: KeyboardEvent) => {
    const target = ev.target as HTMLElement;
    if (ev.key === "Escape" && open()) {
      setOpen(false);
      opener()?.focus();
    }
    const role = target?.getAttribute("role");
    if (
      ev.key === " " &&
      ["menuitem", "menuitemcheckbox", "menuitemradio"].includes(role ?? "")
    ) {
      target.click();
      if (role === "menuitemradio") {
        const radios =
          target.parentNode?.querySelectorAll<HTMLElement>(
            '[role="menuitemradio"]:not([aria-disabled], [tabIndex="-1"]',
          ) ?? [];
        const currentPos = Array.prototype.indexOf.call(radios, target);
        const newPos = (radios.length + 1 + currentPos) % radios.length;
        focusItem = radios[newPos];
        focusItem?.focus();
      }
      ev.preventDefault();
    }
    if (ev.key === "ArrowDown") {
      moveFocus(1);
      ev.preventDefault();
    } else if (ev.key === "ArrowUp") {
      moveFocus(-1);
      ev.preventDefault();
    }
  };

  return (
    <div
      ref={menuRef}
      {...divProps}
      class={`sb-menu${divProps.class ? ` ${divProps.class}` : ""}${
        local.align ? ` ${local.align}` : ""
      }`}
      onkeydown={keyHandler}
    >
      {opener()}
      <div hidden={!open()} onmouseover={overHandler} role="menu" tabIndex="-1">
        {menuItems()}
      </div>
    </div>
  );
}

export type MenuButtonProps = JSX.HTMLAttributes<HTMLButtonElement>;

export function MenuButton(props: Readonly<MenuButtonProps>) {
  return <button {...props} aria-haspopup="menu" />;
}

export type MenuItemProps = JSX.HTMLAttributes<HTMLDivElement>;

export function MenuItem(props: Readonly<MenuItemProps>) {
  return <div tabIndex="0" {...props} role="menuitem" />;
}

export type MenuItemGroupProps = {
  title?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function MenuItemGroup(props: Readonly<MenuItemGroupProps>) {
  const [local, divProps] = splitProps(props, ["title", "children"]);
  return (
    <div {...divProps} role="group">
      <Show fallback={local.title} when={typeof props.title === "string"}>
        <p>{local.title}</p>
      </Show>
      {local.children}
    </div>
  );
}

export type MenuOptionsContextValue = [
  value: Accessor<string[]>,
  change: (value: string) => void,
  type?: "checkbox" | "radio",
];

export const MenuOptionsContext = createContext<MenuOptionsContextValue>([
  () => [],
  (value) => console.warn("context default!", value),
]);

export type MenuOptionProps = {
  onchange?: (checked?: boolean) => void;
  value: string;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "onchange">;

export function MenuOption(props: Readonly<MenuOptionProps>) {
  const [_local, divProps] = splitProps(props, ["value", "onchange"]);
  const [value, change, type] = useContext(MenuOptionsContext);
  const selectedValue = createMemo(() => value().includes(props.value));
  const clickHandler = createMemo(
    () => () => props["aria-disabled"] !== "true" && change(props.value),
  );
  const keyHandler = createMemo(() => (ev: KeyboardEvent) => {
    if (ev.key === " ") {
      ev.preventDefault();
      props["aria-disabled"] !== "true" && change(props.value);
    }
  });

  createEffect(() => {
    props.onchange?.(selectedValue());
  });

  return (
    <div
      aria-selected={selectedValue()}
      tabIndex={
        (type === "checkbox" || !selectedValue()) &&
        props["aria-disabled"] !== "true"
          ? "0"
          : "-1"
      }
      {...divProps}
      onclick={clickHandler()}
      onkeypress={keyHandler()}
      role={type !== "checkbox" ? "menuitemradio" : "menuitemcheckbox"}
    />
  );
}

export type MenuOptionGroupProps = (
  | {
      onchange?: (value: string) => void;
      title?: JSX.Element;
      type?: "radio" | undefined;
      value?: [string] | string;
    }
  | {
      onchange?: (value: string[]) => void;
      title?: JSX.Element;
      type: "checkbox";
      value?: string[];
    }
) &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "onchange">;

export function MenuOptionGroup(props: Readonly<MenuOptionGroupProps>): JSX.Element {
  const [local, divProps] = splitProps(props, [
    "title",
    "value",
    "onchange",
    "children",
    "type",
  ]);
  const [value, setValue] = createSignal(
    Array.isArray(local.value) ? local.value : local.value ? [local.value] : [],
    {
      equals: (prev, next) =>
        prev.length === next.length && prev[0] === next[0],
    },
  );
  const change = createMemo<(value: string) => void>(() =>
    props.type === "checkbox"
      ? (value) =>
          setValue((prev) =>
            prev.includes(value)
              ? prev.filter((item) => item !== value)
              : [...prev, value],
          )
      : (value) => setValue((prev) => (prev[0] === value ? prev : [value])),
  );

  createEffect((lastVal?: [string] | string | string[]) => {
    if (lastVal !== local.value) {
      setValue(
        Array.isArray(local.value)
          ? local.value
          : local.value
            ? [local.value]
            : [],
      );
    }
    return local.value;
  }, local.value);

  createEffect((lastVal?: string[]) => {
    const newVal = value();
    if (
      props.type === "checkbox"
        ? newVal.length === lastVal?.length
        : newVal[0] === lastVal?.[0]
    ) {
      return lastVal;
    }
    props.type === "checkbox"
      ? props.onchange?.(newVal)
      : props.onchange?.(newVal[0]);
    return newVal;
  }, value());

  return (
    <div role="group" tabIndex="-1" {...divProps}>
      <Show fallback={local.title} when={typeof props.title === "string"}>
        <p>{local.title}</p>
      </Show>
      <MenuOptionsContext.Provider value={[value, change(), local.type]}>
        {local.children}
      </MenuOptionsContext.Provider>
    </div>
  );
}
