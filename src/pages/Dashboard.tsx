import { Link, Route, Routes, useParams } from "@solidjs/router";
import { get, set } from "idb-keyval";
import { Component, For, Show, createSignal, lazy, useContext } from "solid-js";
import { getNewGraphId, graph } from "../lib/graph";
import Page404 from "./404";
import { Login, Logout, SignUp } from "./Forms";

import { AbstractSingleForm } from "../components/DynamicForm";
import { Navbar } from "../components/Navbar";
import { PageDesignerDragAndDrop } from "../components/PageDesignerDragAndDrop";
import Sidebar from "../components/Sidebar";
import { AlertMessageContext } from "../contexts/AlertMessageContext";
import { PageContext } from "../lib/Record";
import { addNewVertex, mergeVertexProperties, newVertex } from "../lib/Vertex";
import { NavDesigner } from "./FormDesigner";
import { AllForms, SimpleImport } from "./FormsAdmin";
import { AbstractSingleGrid, AllDashboards, TableDashboard } from "./Grids";

const IS_SIDEBAR_OPEN_KEY = "isSideBarOpen";

const BackupRestore = lazy(() => import("./BackupRestore"));
// @ts-ignore
const GraphViewPage = lazy(() => import("./GraphViewPage"));

const border = "|solid|slate-80";
const [isSideBarOpen, setSideBarOpen] = createSignal(true);
get(IS_SIDEBAR_OPEN_KEY).then((data) => setSideBarOpen(data));

// Todo use mastercss
const AlertDisplay = () => {
  const { alerts, setAlert } = useContext(AlertMessageContext);
  return (
    <For each={alerts}>
      {(alert, index) => (
        <div
          color={alert.state}
          // @ts-ignore
          isClosable={true}
          content={alert.message}
          duration={5000}
          onHide={() => setAlert((prev) => prev.filter((_, i) => i !== index()))}
        />
      )}
    </For>
  );
};

export const DashboardView = () => {
  const vertexId = getNewGraphId();
  addNewVertex(0, newVertex(vertexId, ["MainNavBarTitle"], { class: `bb:1${border}` }));

  return (
    <div class="flex flex:col flex:1">
      <PageContext.Provider
        value={{
          events: {
            setSideBarOpen,
            setTitle: (title: string) => mergeVertexProperties(0, vertexId, { title }),
          },
        }}
      >
        <Navbar
          toggleSidebar={() => {
            set(IS_SIDEBAR_OPEN_KEY, !isSideBarOpen());
            setSideBarOpen((prev) => !prev);
          }}
          right={
            <Show
              when={graph.member?.id}
              fallback={
                <>
                  <Link href="/signup" replace={true}>
                    Register
                  </Link>
                  {/* @ts-ignore */}
                  <Link
                    href={"/login"}
                    replace={true}
                    // @ts-ignore
                    title={__APP_VERSION__}
                  >
                    Login
                  </Link>
                </>
              }
            >
              <Link href={"/logout"} replace={true}>
                Logout
              </Link>
            </Show>
          }
          meta={graph.vertexes[vertexId]}
        />

        <AlertDisplay />

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
                  return (
                    <AbstractSingleForm
                      formId={params.entity}
                      id={params.id}
                      // @ts-ignore
                      config={{}}
                    />
                  );
                }}
              />
              <Route path="/Page/:id" component={(props) => <PageDesignerDragAndDrop {...props} />} />
              <Route path="/Nav/new" component={(props) => <NavDesigner {...props} />} />
              <Route path="/dashboards" component={(props) => <AllDashboards {...props} />} />
              <Route path="/forms" component={(props) => <AllForms {...props} />} />
              <Route path="/grid/:name" component={(props) => <TableDashboard {...props} />} />
              {/* Auth: */}
              <Route path="/login" component={Login as Component} />
              <Route path="/logout" component={Logout as Component} />
              <Route path="/signup" component={SignUp as Component} />
              {/* Utils */}
              <Route path="/backup_restore" component={(props) => <BackupRestore {...props} />} />
              <Route path="/SimpleImport" component={(props) => <SimpleImport {...props} />} />
              <Route path="/Graph" component={(props) => <GraphViewPage />} />
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
  return (
    <Show when={isSideBarOpen() && (graph.initialSynced || isSideBarOpen())} fallback={<DashboardView />}>
      <div class="flex">
        <Sidebar isSideBarOpen={isSideBarOpen()} />
        <div class="ml:200 flex:1">
          <DashboardView />
        </div>
      </div>
    </Show>
  );
};
