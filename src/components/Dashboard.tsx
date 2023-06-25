import {
  Component,
  createEffect,
  createSignal,
  on,
  Show,
  useContext, For
} from "solid-js";
import { Link, Route, Routes, useNavigate, useParams } from "@solidjs/router";
import Page404 from "../pages/404";
import { BackupRestore, GraphViewPage } from "../pages/BackupRestore";
import { getNewGraphId, graph, Vertex } from "../lib/graph";
import {
  AllForms,
  Login,
  Logout,
  SignUp,
  SimpleImport
} from "./Forms";
import { WsContext } from "../utils/ws_events_dispatcher";
import { Properties as dxDrawerProperties } from "devextreme/ui/drawer";

import { AbstractSingleGrid, AllDashboards, TableDashboard } from "./Grids";
import Home from "../pages/home/home";
import {
  NavDesigner,
  PageDesigner,
  renderTreeFromGraph
} from "./FormDesigner";
import { syncEvent } from "../lib/ws_events";
import { GenericField } from "./input/GenaricField";

import { Alert } from "./uikit_components/Alert/Alert";
import { PageContext, Record } from "../lib/Record";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId, mergeVertexProperties,
 newVertex
} from "../lib/Vertex";
import { AttrsTableData } from "./api";
import { Navbar } from "../pages/home/components/Navbar";
import { AlertMessageContext } from "../contexts/AlertMessageContext";
import { AbstractSingleForm } from "./DynamicForm";

const border = "|solid|slate-80";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);

// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Other Menu Component: Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
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


const AlertDisplay = () => {
  const { alerts, setAlert } = useContext(AlertMessageContext);
  return   <For each={alerts}>
    {(alert, index) => <Alert color={alert.state} isClosable={true} content={alert.message} duration={5000} onHide={()=>setAlert(prev=> prev.filter((_, i) => i !== index()))}/>}
  </For>
}

export const DashboardView = () => {
 const vertexId = getNewGraphId();
 addNewVertex(0, newVertex(vertexId, ['MainNavBarTitle'], {class: "bb:1" + border}));

  return (
    <div class="flex flex:col flex:1">
     <PageContext.Provider value={{ events: { setSideBarOpen, setTitle: (title: string) => mergeVertexProperties(0, vertexId, { title }) } }}>
      <Navbar
       right={<Show
        when={graph.member?.id}
        fallback={
         <>
          <Link href={`/signup`}>Register</Link>
          {/* @ts-ignore */}
          <Link href={`/login`} title={__APP_VERSION__}>Login</Link>
         </>
        }
       >
        <Link href={`/logout`}>Logout</Link>
       </Show>}
       meta={graph.vertexes[vertexId]}
      />

      <AlertDisplay/>

      <main class="p:20">
        <Show when={graph.initialSynced}>
          <Routes>
            <Route path="/" component={() => <>Home Page</>} />
            {/* TODO: fix when incorrect entity is rendered */}
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
           <Route path="/Page/:id" component={PageDesigner as Component} />
           <Route path="/Nav/new" component={NavDesigner as Component} />
           <Route path="/dashboards" component={AllDashboards as Component} />
           <Route path="/forms" component={AllForms as Component} />
           <Route path="/grid/:name" component={TableDashboard as Component} />
           {/* Auth: */}
           <Route path="/login" component={Login as Component} />
           <Route path="/logout" component={Logout as Component} />
           <Route path="/signup" component={SignUp as Component} />
           {/* Utils */}
           <Route path="/backup_restore" component={BackupRestore as Component} />
           <Route path="/SimpleImport" component={SimpleImport as Component} />
           <Route path="/Graph" component={GraphViewPage as Component} />
           {/* Test */}
           <Route path="/public/avfmobile" component={Home as Component} />
           {/* Error */}
           <Route path="/**" component={Page404 as Component} />
          </Routes>
        </Show>
      </main>
     </PageContext.Provider>
    </div>
  );
};

// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = () => {
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
             elementAttr: {class: `br:1${border}_.dx-drawer-panel-content`}
           } as dxDrawerProperties
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
