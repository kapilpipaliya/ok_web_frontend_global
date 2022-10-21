import { JSX, createSignal, For } from "solid-js";
import clsx from "clsx";
import { Link, Route, Routes, useNavigate } from "solid-app-router";

import { DynamicFormSequence } from "./core/dynamicForm";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { BackupRestore } from "./core/BackupRestore";
import { useDebugger } from "./core/SolidDebug";
import { graph } from "../lib/graph";
import { Home } from "./Home";

interface NavigationItem {
  name: string;
  href?: string;
  icon: () => JSX.Element;
  children?: NavigationItem[]
}

// hint: Make a Menu Collection and save it in database.
const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Base",
    type: "group",
    children: [
      { name: "FormAttributeTypes", href: "/FormAttributeType" },
      { name: "ServerAttributeTypes", href: "/ServerAttributeType" },
      { name: "Attributes", href: "/Attribute" },
      { name: "Collections", href: "/Collection" },
      { name: "Form Layout", href: "/FormLayout" },
      { name: "Table Layout", href: "/TableLayout" },
      { name: "Card Layout", href: "/CardLayout" }
    ]
  },
  {
    name: "Auth",
    type: "group",
    children: [
      { name: "Users", href: "/User" },
      { name: "Roles", href: "/Role" },
      { name: "Permissions", href: "/Permission" }
    ]
  },
  { name: "Backup & Restore", href: "/backup_restore" },
];

const secondaryNavigation = [
  { name: "Settings", href: "#" },
  { name: "Help", href: "#" },
  { name: "Privacy", href: "#" }
];

const [isSideBarOpen, setSidebarOpen] = createSignal(true);

export const StaticSideBar = () => {
  return (<>
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div class="flex flex-col flex-grow bg-cyan-700 pt-5 pb-4 overflow-y-auto">
        <div class="flex items-center flex-shrink-0 px-4">
          <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/easywire-logo-cyan-300-mark-white-text.svg"
               alt="Easywire logo" />
        </div>
        <nav class="mt-5 flex-1 flex flex-col divide-y divide-cyan-800 overflow-y-auto" aria-label="Sidebar">
          <div class="px-2 space-y-1">
            <For each={navigation} fallback={<div>Loading...</div>}>
              {(item) => (
                <Link
                  href={item.href}
                  class={clsx(
                    item.current ? "bg-cyan-800 text-white" : "text-cyan-100 hover:text-white hover:bg-cyan-600",
                    "group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  <span class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" aria-hidden="true" >{item.icon}</span>
                  {item.name}
                </Link>
              )}
            </For>
          </div>
          <div class="mt-6 pt-6">
            <div class="px-2 space-y-1">
              <For each={secondaryNavigation} fallback={<div>Loading...</div>}>
                {(item) => (
                  <a href={item.href}
                     class="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600">
                    <span class="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" >{item.icon}</span>
                    {item.name}
                  </a>
                )}
              </For>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

// https://sap.github.io/ui5-webcomponents/playground/components/SideNavigation/
// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
export const UI5StaticSideBar = () => {
  const navigate = useNavigate();
  const onMenuItemClick = (e: any) => {
    if (e.detail?.item?.href) {
      navigate(e.detail.item.href);
    }
  };
  /* @mount */
  {
    const sideNavigation = document.querySelector("ui5-side-navigation");
    // document.querySelector("#startButton").addEventListener("click", event => sideNavigation.collapsed = !sideNavigation.collapsed);
    // sideNavigation.addEventListener('selection-change', (...e)=>console.log('hi', e))
  }

  const Children = (props: { items: NavigationItem[] }) => {
    return <For each={props.items} fallback={<div>Loading...</div>}>
      {(item) => <ui5-side-navigation-sub-item text={item.name} icon="home" href={item.href}></ui5-side-navigation-sub-item>}
    </For>;
  };
  return <>
    {/*<ui5-shellbar*/}
    {/*  primary-title="UI5 Web Components"*/}
    {/*  secondary-title="The Best Run SAP"*/}
    {/*  show-co-pilot*/}
    {/*>*/}
    {/*  <ui5-button icon="menu" slot="startButton" id="startButton"></ui5-button>*/}
    {/*</ui5-shellbar>*/}

    <ui5-side-navigation onselection-change={onMenuItemClick}>
      <For each={navigation} fallback={<div>Loading...</div>}>
        {(item) =>
          <solid:switch fallback={<ui5-side-navigation-item text={item.name} icon="home" href={item.href}></ui5-side-navigation-item>}>
            <solid:match when={item.type === "group"}>
              <ui5-side-navigation-item text={item.name} icon="group">
                <Children items={item.children} />
              </ui5-side-navigation-item>
            </solid:match>
          </solid:switch>}
      </For>
      <ui5-side-navigation-item text={"Forms"} icon="group">
        {/*TODO*/}
        {/*<Children items={graph.vertexLabelIdMap['FormLayout'].map()} />*/}
      </ui5-side-navigation-item>
      {/*<ui5-side-navigation-item text="People" expanded icon="group">*/}
      {/*  <ui5-side-navigation-sub-item text="From My Team"></ui5-side-navigation-sub-item>*/}
      {/*  <ui5-side-navigation-sub-item text="From Other Teams"></ui5-side-navigation-sub-item>*/}
      {/*</ui5-side-navigation-item>*/}
      {/*<ui5-side-navigation-item text="Locations" icon="locate-me" selected></ui5-side-navigation-item>*/}
      {/*<ui5-side-navigation-item text="Events" icon="calendar">*/}
      {/*  <ui5-side-navigation-sub-item text="Local"></ui5-side-navigation-sub-item>*/}
      {/*  <ui5-side-navigation-sub-item text="Others"></ui5-side-navigation-sub-item>*/}
      {/*</ui5-side-navigation-item>*/}

      {/*<ui5-side-navigation-item slot="fixedItems" text="Useful Links" icon="chain-link"></ui5-side-navigation-item>*/}
      {/*<ui5-side-navigation-item slot="fixedItems" text="History" icon="history"></ui5-side-navigation-item>*/}
    </ui5-side-navigation>

    <style>{`
      ui5-shellbar::part(root) {
      padding-left: .5rem;
    }`}
    </style>
  </>;
};

export const MenuButtonToggle = () => {
  return (
    <button
      type="button"
      class="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
      onClick={() => {
        setSidebarOpen(v => !v);
      }}
    >
      <span class="sr-only">Open sidebar</span>
      <span class="h-6 w-6" aria-hidden="true" >Sidebar</span>
    </button>
  );
};

export const DashboardView = () => {
  return (
    <div class="flex flex-col flex-1" classList={{ "pl-64": isSideBarOpen() }}>
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-green-200 lg:border-none">
        <MenuButtonToggle />
      </div>
      <main class="flex-1 pb-8 p-2">
        <Routes>
          <Route path="/" component={() => <><Home /></>} />
          <Route path="/:entity" component={() => <SchemaTable />} />
          <Route path="/:entity/:id" component={() => <DynamicFormSequence />} />
          <Route path="/backup_restore" component={() => <BackupRestore />} />
          <Route path="/**" component={() => <Page404 />} />
        </Routes>
      </main>
    </div>
  );
};

// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = () => {
  const debugGraph = useDebugger("graph");
  // debugGraph(graph);
  return (
    <div class="min-h-full">
      <solid:show when={isSideBarOpen()}>
        <div class={"flex w-64 flex-col fixed inset-y-0"}><UI5StaticSideBar /></div>
      </solid:show>
      <DashboardView />
    </div>
  );
};
