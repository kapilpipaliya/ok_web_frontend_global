import {
  JSX,
  Component,
  createEffect,
  createSignal,
  on,
  onMount,
  Show,
  useContext, For
} from "solid-js";
import { Link, Route, Routes, useNavigate, useParams } from "@solidjs/router";
import Page404 from "../pages/404";
import { BackupRestore, GraphViewPage } from "../pages/BackupRestore";
import { graph, Vertex } from "../lib/graph";
import {
  AbstractSingleForm,
  AllForms,
  Login,
  Logout,
  SignUp,
  SimpleImport
} from "./Form";
import { WsContext } from "./ws_events_dispatcher";
// import { AlertMessageContext } from "../appState";

import { AbstractSingleGrid, AllDashboards, TableDashboard } from "./Grids";
import Home from "../pages/home/home";
import { Page } from "./DynamicPage";
import {
  FormDesigner,
  NavDesigner,
  PageDesigner,
  renderTreeFromGraph
} from "./FormDesigner";
import { syncEvent } from "./ws_events";
import { GenericField } from "./input/GenaricField";
import { AlertMessageContext } from "../appState";
import { Alert } from "./uikit_components/Alert/Alert";
import { Record } from "../lib/Record";
import { findVertexByLabelAndUniqueId } from "../lib/Vertex";
import { AttrsTableData } from "./api";

// window.n = navigation
const [isSideBarOpen, setSidebarOpen] = createSignal(true);

// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
export const StaticSideBar = () => {
  const navigate = useNavigate();

  const { Ws } = useContext(WsContext);

  // parent div is required else component is not rendered.
  return (
   <div><Show when={graph.initialSynced}><div
       ref={el => {
         const nav = findVertexByLabelAndUniqueId('Nav', 'name', "main");
         if (!nav) {
           console.log('no Nav Found')
           return;
         }
         const record = new Record({ws: Ws});
         record.load(nav.id);
         record.createMeta(AttrsTableData["Nav"])
         renderTreeFromGraph(el, record, navigate);
       }}
      ></div>
   </Show></div>
  );
};

export const MenuButtonToggle = () => {
  return (
    <GenericField
      meta={{ P: {component: "Button", props: {hint: "Open sidebar", icon: "menu", width: 40,stylingMode: 'text', }}} as any}
      onClick={() => {
        setSidebarOpen((v) => !v);
      }}
    />
  );
};

const AlertDisplay = () => {
  const { alerts, setAlert } = useContext(AlertMessageContext);
  return   <For each={alerts}>
    {(alert, index) => <Alert color={alert.state} isClosable={true} content={alert.message} duration={5000} onHide={()=>setAlert(prev=> prev.filter((_, i) => i !== index()))}/>}
  </For>
}
export const DashboardView = () => {
  return (
    <div class="flex flex:col flex:1">
      <AlertDisplay/>
      <MenuButtonToggle />
      <Show
        when={graph.member?.id}
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
            <Route path="/Page2/:id" component={PageDesigner as Component} />
            <Route path="/Page/:id" component={Page as Component} />
            <Route path="/public/avfmobile" component={Home as Component} />
            <Route path="/Graph" component={GraphViewPage as Component} />
            <Route path="/Nav/new" component={NavDesigner as Component} />
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
      <GenericField
       meta={{
         P: {
           component: "Drawer",
           props: {
             // @ts-ignore
             template: StaticSideBar,
             // this will set the container div size to 100vh.
             height: "100vh",
             opened: true,
             maxSize: 200,
             revealMode: "expand",
           }
         }} as unknown as Vertex}
       ref={(instance: any)=> {
         createEffect(on(isSideBarOpen, (_) => instance.toggle(), {defer: true}));
       }}
      >
        <DashboardView />
      </GenericField>
    </div>
  );
};
