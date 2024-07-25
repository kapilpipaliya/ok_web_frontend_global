"use client";

import clsx from "clsx";
import { type JSX, splitProps } from "solid-js";

import { useTabView } from "./TabView";

type TabControlProps = {
  as?: any;
  disabled?: boolean;
  name: string;
} & JSX.HTMLAttributes<HTMLElement>;

export default function TabControl(props: Readonly<TabControlProps>) {
  const [local, others] = splitProps(props, [
    "as",
    "class",
    "disabled",
    "name",
  ]);
  const tabView = useTabView();
  const Component = local.as || "button";
  return (
    <Component
      {...others}
      class={clsx(
        !local.as && "tab",
        local.class,
        tabView.activeTab === local.name && "active",
      )}
      disabled={Component === "button" ? local.disabled : undefined}
      onClick={() => tabView.setActiveTab(local.name)}
    />
  );
}
