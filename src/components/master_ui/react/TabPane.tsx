"use client";

import { type JSX, splitProps } from "solid-js";

import { useTabView } from "./TabView";

type TabPaneProps = {
  as?: any;
  name: string;
} & JSX.HTMLAttributes<HTMLElement>;

const TabPane = (props: TabPaneProps) => {
  const [local, others] = splitProps(props, ["as", "name"]);
  const tabView = useTabView();
  const Component = local.as || "div";
  return <Component {...others} hidden={tabView.activeTab !== local.name} />;
};

export default TabPane;
