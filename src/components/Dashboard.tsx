import {
  Component,
  createEffect,
  createSignal,
  on,
  Show,
  useContext, For
} from "solid-js";
import { get, set } from "idb-keyval";
import { Link, Route, Routes, useNavigate, useParams } from "@solidjs/router";
import Page404 from "../pages/404";
import { BackupRestore } from "../pages/BackupRestore";
import { getNewGraphId, graph, Vertex } from "../lib/graph";
import {
  Login,
  Logout,
  SignUp
} from "./Forms";
import { WsContext } from "../utils/ws_events_dispatcher";
import { Properties as dxDrawerProperties } from "devextreme/ui/drawer";

import { AbstractSingleGrid, AllDashboards, TableDashboard } from "./Grids";
import {
 NavDesigner,
 renderNavTreeFromGraph
} from "./FormDesigner";
import { GenericField } from "./input/GenaricField";
import { PageContext, Record } from "../lib/Record";
import {
 addNewVertex,
 findVertexByLabelAndUniqueId, mergeVertexProperties,
 newVertex
} from "../lib/Vertex";
import { AttrsTableData } from "./api";
import { Navbar } from "./Navbar";
import { AlertMessageContext } from "../contexts/AlertMessageContext";
import { AbstractSingleForm } from "./DynamicForm";
import {PageDesignerDragAndDrop} from "./PageDesignerDragAndDrop";
import { GraphViewPage } from "../pages/GraphViewPage";
import {AttrsAdminTableData} from "./apiAdmin";
import {AllForms, SimpleImport} from "./FormsAdmin";

const border = "|solid|slate-80";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);
get("isSideBarOpen").then((data) => setSideBarOpen(data));

export const [showNav, setShowNav] = createSignal(window.location.pathname.includes("/nav/"));
export const [isAdmin, setIsAdmin] = createSignal(window.location.pathname.includes("/admin"));

// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Other Menu Component: Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
export const StaticSideBar = () => {
  const navigate = useNavigate();

  const { Ws } = useContext(WsContext);

  // parent div is required else component is not rendered.
  return (
   <div><Show when={graph.initialSynced}>
    <div
       class="height:calc(100vh-1rem)"
       ref={el => {
         const nav = findVertexByLabelAndUniqueId('Nav', 'name', "main");
         if (!nav) {
           console.log('no Nav Found')
           return;
         }
         const record = new Record({ws: Ws});
         record.load(nav.id);
         record.createMeta(AttrsAdminTableData["Nav"])
         renderNavTreeFromGraph(el, record, navigate);
       }}
      ></div>
   </Show></div>
  );
};


// Todo use mastercss
const AlertDisplay = () => {
  const { alerts, setAlert } = useContext(AlertMessageContext);
  return   <For each={alerts}>
    {(alert, index) => <div color={alert.state} isClosable={true} content={alert.message} duration={5000} onHide={()=>setAlert(prev=> prev.filter((_, i) => i !== index()))}/>}
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
                <Link href={`/signup`} replace={true}>Register</Link>
                {/* @ts-ignore */}
                <Link href={`/login`} replace={true} title={__APP_VERSION__}>Login</Link>
              </>
            }
          >
            <Link href={(showNav() ? '/nav' : '') + `/logout`} replace={true}>Logout</Link>
            <Link href={`/logout`} replace={true}>Logout</Link>
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
                  return <AbstractSingleGrid tableId={params.entity} />
                }}
              />
              <Route
                path="/:entity/:id"
                component={() => {
                  const params = useParams();
                  return <AbstractSingleForm formId={params.entity} id={params.id} config={{}} />
                }}
              />
              <Route path="/Page/:id" component={(props) => <PageDesignerDragAndDrop {...props}/>} />
              <Route path="/Nav/new" component={(props) => <NavDesigner {...props}/>} />
              <Route path="/dashboards" component={(props) => <AllDashboards {...props}/>} />
              <Route path="/forms" component={(props) => <AllForms {...props}/>} />
              <Route path="/grid/:name" component={(props) => <TableDashboard  {...props}/>} />
              {/* Auth: */}
              <Route path="/login" component={Login as Component} />
              <Route path="/logout" component={Logout as Component} />
              <Route path="/signup" component={SignUp as Component} />
              {/* Utils */}
              <Route path="/backup_restore" component={(props) => <BackupRestore {...props}/>} />
              <Route path="/SimpleImport" component={(props) => <SimpleImport {...props}/>} />
              <Route path="/Graph" component={(props) => <GraphViewPage/>} />
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
  createEffect(() => {
   set("isSideBarOpen", isSideBarOpen());
  })


  return (
    <div>
      <Show when={showNav()} fallback={<DashboardView />}>
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
      </Show>
    </div>
  );
};
