import {
  JSX,
  Component,
  createEffect,
  createSignal,
  on,
  onCleanup,
  onMount,
  Show,
  useContext
} from "solid-js";
import { Link, Route, Routes, useNavigate, useParams } from "@solidjs/router";
import Page404 from "../pages/404";
import { BackupRestore } from "../pages/BackupRestore";
import { graph } from "../lib/graph";
import {
  AbstractSingleForm,
  AllForms,
  Login,
  Logout,
  SignUp,
  SimpleImport
} from "./Form";
import { WsContext } from "./ws_events_dispatcher";
import { meta } from "../lib/Vertex";
// import { AlertMessageContext } from "../appState";
import TreeView, {
  Properties as TreeViewProperties
} from "devextreme/ui/tree_view";
import Drawer from "devextreme/ui/drawer";
import { AbstractSingleGrid, AllDashboards, TableDashboard } from "./Grids";
import Home from "../pages/home/home";
import { Page } from "./DynamicPage";
import { FormDesigner } from "./FormDesigner";
import { syncEvent } from "./ws_events";
import { GenericField } from "./input/GenaricField";

// TODO: Make a Menu Collection and save it in database.
const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Base",
    type: "group",
    expanded: true,
    children: [
      { name: "DataTypes", href: "/DataType" },
      { name: "Components Category", href: "/CompCategory" },
      { name: "Components", href: "/Comp" },
      // { name: "Attribute Types", href: "/AttrType" },
      // { name: "Collection Category", href: "/CollCategory" },
      // { name: "Form", href: "/Coll" },
      { name: "Collections", href: "/Coll" },
      { name: "Forms", href: "/Form" },
      // { name: "Page", href: "/Page" },
    ],
  },
  {
    name: "Auth",
    type: "group",
    children: [
      { name: "Users", href: "/User" },
      { name: "Roles", href: "/Role" },
      { name: "Permissions", href: "/Perm" },
    ],
  },
  { name: "Dashboard", href: "/Dashboard" },
  { name: "Grids", href: "/grids" },
  { name: "Import", href: "/SimpleImport" },
  // { name: "Forms", href: "/forms" },
  { name: "Backup & Restore", href: "/backup_restore" },
] as TreeViewProperties["dataSource"];
// window.n = navigation
const [isSideBarOpen, setSidebarOpen] = createSignal(true);

// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
export const StaticSideBar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div
        ref={(el) => {
          const instance = new TreeView(el, {
            dataSource: navigation,
            dataStructure: "tree",
            keyExpr: "href",
            displayExpr: "name",
            itemsExpr: "children",
            width: 200,
            onItemClick(e) {
              if (e.itemData?.href) navigate(e.itemData.href);
            },
          });
          onCleanup(() => instance.dispose());
        }}
      ></div>
    </>
  );
};

export const MenuButtonToggle = () => {
  return (
    <GenericField
     component={"Button"}
      meta={meta({ hint: "Open sidebar", icon: "menu", width: 40 })}
      onClick={() => {
        setSidebarOpen((v) => !v);
      }}
    />
  );
};

export const DashboardView = () => {
  const { Ws } = useContext(WsContext);
  // const { alerts } = useContext(AlertMessageContext);
  return (
    <div class="flex flex:col flex:1">
      {/*<For each={alerts}>{alert => <ui5-message-strip design={alert.state} hideIcon={alert.hideIcon} hideCloseButton={alert.hideCloseButton} >{alert.message}</ui5-message-strip>}</For>*/}
      <MenuButtonToggle />
      <Show
        when={Ws.isLoggedIn()}
        fallback={
          <>
            <Link href={`/signup`}>Signup</Link>
            <Link href={`/login`}>Login</Link>
          </>
        }
      >
        <Link href={`/logout`}>Logout</Link>
      </Show>
      <main class="">
        <Show when={graph.initialSynced}>
          <Routes>
            <Route path="/" component={() => <>Home Page</>} />
            {/* TODO: when incorrect entity is rended*/}
            <Route
              path="/:entity"
              component={() => {
                const params = useParams();
                return <AbstractSingleGrid tableId={params.entity} />;
              }}
            />
            <Route
              path="/:entity/:id"
              component={() => {
                const params = useParams();
                return <AbstractSingleForm formId={params.entity} id={params.id} config={{}} />;
              }}
            />
            <Route path="/backup_restore" component={BackupRestore as Component} />
            {/* Deprecated */}
            <Route path="/forms" component={AllForms as Component} />
            {/* Deprecated */}
            <Route path="/grids" component={AllDashboards as Component} />
            <Route path="/grid/:name" component={TableDashboard as Component} />
            <Route path="/login" component={Login as Component} />
            <Route path="/logout" component={Logout as Component} />
            <Route path="/signup" component={SignUp as Component} />
            <Route path="/SimpleImport" component={SimpleImport as Component} />
            <Route path="/CollDesigner/:id" component={FormDesigner as Component} />
            <Route path="/Page/:id" component={Page as Component} />
            <Route path="/public/avfmobile" component={Home as Component} />
            <Route path="/**" component={Page404 as Component} />
          </Routes>
        </Show>
      </main>
    </div>
  );
};

// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = () => {
  onMount(() => {
    const meta = document.createElement("meta");
    meta.name = "version";
    // @ts-ignore
    meta.content = __APP_VERSION__;
    document.getElementsByTagName("head")[0].appendChild(meta);
  });

  syncEvent();
  return (
    <div>
      <div
        ref={(el) => {
          // if we don't use onMount, the content rendered below the sidebar.
          onMount(() => {
            const instance = new Drawer(el, {
              // @ts-ignore
              template: StaticSideBar,
              // this will set the container div size to 100vh.
              height: "100vh",
              opened: true,
              maxSize: 200,
              revealMode: "expand",
            });
            createEffect(on(isSideBarOpen, (_) => instance.toggle(), {defer: true}));
          });
        }}
      >
        <DashboardView />
      </div>
    </div>
  );
};
