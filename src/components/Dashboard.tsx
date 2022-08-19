import { createSignal, For } from "solid-js";
import { Icon } from "solid-heroicons";
import { clock, cog, home, menuAlt_1, questionMarkCircle, scale, shieldCheck } from "solid-heroicons/outline";
import clsx from "clsx";
import { Link, Route, Routes } from "solid-app-router";

import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";
import { FormLayoutEditor } from "./fom_layout_editor";
import { BackupRestore } from "./core/BackupRestore";
import { useDebugger } from "./core/SolidDebug";
import { graph } from "../db/graph";
import { Home } from "./Home";
import { SearchBar } from "./SearchBar";

const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "FormAttributeTypes", href: "/FormAttributeType", icon: clock },
  { name: "Attributes", href: "/Attribute", icon: clock },
  { name: "Collections", href: "/Collection", icon: scale },
  { name: "Form Layout", href: "/FormLayout", icon: scale },
  { name: "Table Layout", href: "/TableLayout", icon: scale },
  { name: "Card Layout", href: "/CardLayout", icon: scale },
  { name: "Backup & Restore", href: "/backup_restore", icon: scale }
];

const secondaryNavigation = [
  { name: "Settings", href: "#", icon: cog },
  { name: "Help", href: "#", icon: questionMarkCircle },
  { name: "Privacy", href: "#", icon: shieldCheck },
];

const [isSideBarOpen, setSidebarOpen] = createSignal(true);

export const StaticSideBar = (props: {isOpen: boolean}) => {
  return (
      <solid:show when={props.isOpen}>
      <div class={"flex w-64 flex-col fixed inset-y-0"}>
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div class="flex flex-col flex-grow bg-cyan-700 pt-5 pb-4 overflow-y-auto">
          <div class="flex items-center flex-shrink-0 px-4">
            <img class="h-8 w-auto" src="https://tailwindui.com/img/logos/easywire-logo-cyan-300-mark-white-text.svg" alt="Easywire logo" />
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
                    <Icon path={item.icon} class="mr-4 flex-shrink-0 h-6 w-6 text-cyan-200" aria-hidden="true" />
                    {item.name}
                  </Link>
                )}
              </For>
            </div>
            <div class="mt-6 pt-6">
              <div class="px-2 space-y-1">
                <For each={secondaryNavigation} fallback={<div>Loading...</div>}>
                  {(item) => (
                    <a href={item.href} class="group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md text-cyan-100 hover:text-white hover:bg-cyan-600">
                      <Icon path={item.icon} class="mr-4 h-6 w-6 text-cyan-200" aria-hidden="true" />
                      {item.name}
                    </a>
                  )}
                </For>
              </div>
            </div>
          </nav>
        </div>
      </div>
      </solid:show>
  );
};

export const MenuButtonToggle = () => {
  return (
    <button
      type="button"
      class="px-4 border-r border-gray-200 text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500"
      onClick={() => {setSidebarOpen(v=>!v)}}
    >
      <span class="sr-only">Open sidebar</span>
      <Icon path={menuAlt_1} class="h-6 w-6" aria-hidden="true" />
    </button>
  );
};

export const DashboardView = () => {
  return (
    <div class="flex flex-col flex-1" classList={{"pl-64": isSideBarOpen()}}>
       <div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-green-200 lg:border-none">
        <MenuButtonToggle />
        <SearchBar />
      </div>
      <main class="flex-1 pb-8 pl-2 pt-2">
        <Routes>
          <Route path="/" component={() => <><Home/></>} />
          <Route path="/Collection/:id" component={() => <CollectionEditor />} />
          <Route path="/FormLayout/:id" component={() => <FormLayoutEditor />} />
          <Route path="/:entity" component={() => <SchemaTable />} />
          <Route path="/:entity/:id" component={() => <SchemaDetail />} />
          <Route path="/backup_restore" component={() => <BackupRestore />} />
          <Route path="/**" component={() => <Page404 />} />
        </Routes>
      </main>
    </div>
  );
};

export const FullDashboard = () => {
  const debugGraph = useDebugger("graph");
  debugGraph(graph);
  return (
    <div class="min-h-full bg-gray-100">
       <StaticSideBar isOpen={isSideBarOpen()} />
      <DashboardView />
    </div>
  );
};
