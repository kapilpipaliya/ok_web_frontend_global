import {A} from "@solidjs/router";
import {get, set} from "idb-keyval";
import {createSignal, For, JSX, lazy, Show, useContext} from "solid-js";
import {getNewGraphId, graph} from "../lib/graph";

import {Navbar} from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {AlertMessageContext} from "../contexts/AlertMessageContext";
import {PageContext} from "../lib/Record";
import {addNewVertex, mergeVertexProperties, newVertex} from "../lib/Vertex";

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


// Best Template: https://www.tailwind-kit.com/templates#dashboard
export const FullDashboard = (props: {children?: JSX.Element}) => {
  const vertexId = getNewGraphId();
  addNewVertex(0, newVertex(vertexId, ["MainNavBarTitle"], { class: `bb:1${border}` }));


  return (
      <div class="flex">
        <Show when={isSideBarOpen() && (graph.initialSynced || isSideBarOpen())}>
          <Sidebar isSideBarOpen={isSideBarOpen()} />
        </Show>
        <div class={`${isSideBarOpen() ? 'ml:200': ''} flex:1`}>
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
                        <A href="/signup" replace={true}>
                          Register
                        </A>
                        {/* @ts-ignore */}
                        <A
                          href={"/login"}
                          replace={true}
                          // @ts-ignore
                          title={__APP_VERSION__}
                        >
                          Login
                        </A>
                      </>
                    }
                  >
                    <A href={"/logout"} replace={true}>
                      Logout
                    </A>
                  </Show>
                }
                meta={graph.vertexes[vertexId]}
              />

              <AlertDisplay />

              <main class="p:20 bg:white">
                <Show when={graph.initialSynced}>
                  {props.children}
                </Show>
              </main>
            </PageContext.Provider>
          </div>
        </div>
      </div>
  );
};
