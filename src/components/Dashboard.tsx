import {
  batch,
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
import {
  commitTransaction,
  Edge,
  edgeOldIdToNewIdMap,
  graph,
  ProcessStatus,
  setGraph,
  transactions,
  Vertex,
  vertexOldIdToNewIdMap,
} from "../lib/graph";
import { AbstractSingleForm, AllForms, Login, Logout, SignUp, SimpleImport } from "./Form";
import { WsContext } from "./ws_events_dispatcher";
import { addNewVertex, deleteVertex, newVertex, updateVertexId } from "../lib/Vertex";
import { addNewEdge, deleteEdge, newEdge, updateEdgeId } from "../lib/Edge";
import { G } from "@mobily/ts-belt";
// import { AlertMessageContext } from "../appState";
import TreeView, { Properties as TreeViewProperties } from "devextreme/ui/tree_view";
import Drawer from "devextreme/ui/drawer";
import { AbstractSingleGrid, TableDashboard } from "./Grids";
import { ButtonField } from "./core/Button";
import Home from "../pages/home/home";
import { Page } from "./DynamicPage";
import { FormDesigner } from "./FormDesigner";

// TODO: Make a Menu Collection and save it in database.
const navigation = [
  { name: "Home", href: "/" },
  {
    name: "Base",
    type: "group",
    expanded: true,
    children: [
      { name: "DataTypes", href: "/DataType" },
      { name: "Elements", href: "/Comp" },
      // { name: "Attribute Types", href: "/AttrType" },
      { name: "Attributes", href: "/Attr" },
      // { name: "Collection Category", href: "/CollCategory" },
      { name: "Collections", href: "/Coll" },
      // { name: "Forms", href: "/Form" },
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
  { name: "Backup & Restore", href: "/backup_restore" },
  { name: "Import", href: "/SimpleImport" },
  // { name: "Forms", href: "/forms" },
  { name: "Grids", href: "/grids" },
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
   <ButtonField
    meta={{
      properties: {
        id: "meta",
        props: {hint: "Open sidebar", icon: "menu", width: 40}
      }
    } as unknown as Vertex}
    data={{ properties: { meta: "" } } as unknown as Vertex}
    onClick={() => {
      setSidebarOpen((v) => !v);
    }} />

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
            <Route path="/grids" component={TableDashboard as Component} />
            <Route path="/login" component={Login as Component} />
            <Route path="/logout" component={Logout as Component} />
            <Route path="/signup" component={SignUp as Component} />
            <Route path="/SimpleImport" component={SimpleImport as Component} />
            <Route path="/CollDesigner/:id"   component={FormDesigner as Component} />
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

  const { Ws } = useContext(WsContext);
  Ws.bind(
    ["post", "mutate", 0],
    (
      d: [
        number,
        {
          [key in
            | "insert"
            | "replace"
            | "deleteVertex"
            | "insertEdge"
            | "replaceEdge"
            | "replaceEdgeStart"
            | "replaceEdgeEnd"
            | "deleteEdge"]?: any;
        }[],
      ][],
    ) => {
      if (G.isObject(d) && d.ack) {
        if (Array.isArray(d.txnIds)) {
          for (const txnId of d.txnIds as number[]) {
            // what if ack is not received?
            if (transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.AckReceived;
          }
        }
      }
      if (Array.isArray(d)) {
        for (const [txnId, txnResult] of d) {
          if (transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.Processed;
          for (const txnObject of txnResult) {
            if (txnObject.insert) {
              vertexOldIdToNewIdMap.set(txnObject.insert[0], txnObject.insert[1]);
              updateVertexId(txnObject.insert[0], txnObject.insert[1]);
            }
            if (txnObject.insertEdge) {
              edgeOldIdToNewIdMap.set(txnObject.insertEdge[0], txnObject.insertEdge[1]);
              updateEdgeId(txnObject.insertEdge[0], txnObject.insertEdge[1]);
            }
            if (txnObject.replace) {
              // TODO: handle on backend
              // replaceVertexProperties(0, txnObject.insert[0], txnObject.insert[1]);
            }
            if (txnObject.deleteVertex) {
              if (txnObject.deleteVertex.error) {
                alert(txnObject.deleteVertex.message);
              }
              // TODO: handle on backend
              // deleteVertex(0, txnObject.insert[0]);
            }
            if (txnObject.replaceEdge) {
              // TODO: handle on backend
              // replaceEdgeProperties(0, txnObject.insert[0], txnObject.insert[1]);
            }
            // if(txnObject.replaceEdgeStart){
            //  replaceEdgeStart(0, txnObject.insert[0], txnObject.insert[1]);
            // }
            // if(txnObject.replaceEdgeEnd){
            //  replaceEdgeEnd(0, txnObject.insert[0], txnObject.insert[1]);
            // }
            if (txnObject.deleteEdge) {
              // TODO: handle on backend
              // deleteEdge(0, txnObject.insert[0]);
            }
          }
        }
      }
      let allTxnProcessed = true;
      for (const [_txnId, value] of transactions.entries()) {
        if (value.status !== ProcessStatus.Processed) {
          allTxnProcessed = false;
          break;
        }
      }
      if (allTxnProcessed) {
        vertexOldIdToNewIdMap.clear();
        edgeOldIdToNewIdMap.clear();
      } else commitTransaction(Ws);
    },
  );

  const setGraphData = (args: {
    timestamp: number;
    vertexes: Vertex[];
    edges: Edge[];
    deleted_vertexes: string[];
    deleted_edges: string[];
  }) => {
    batch(() => {
      if (args.timestamp) setGraph("lastSyncedTime", args.timestamp);
      args.vertexes?.map((v) => addNewVertex(0, newVertex(v.id, v.labels, v.properties)));
      args.edges?.map((e) => addNewEdge(0, newEdge(e.id, e.type, e.properties, e.start, e.end)));
      args.deleted_edges?.map((edgeId) => deleteEdge(0, parseInt(edgeId)));
      args.deleted_vertexes?.map((vertexId) => deleteVertex(0, parseInt(vertexId)));
      setGraph("initialSynced", true);
    });
  };
  Ws.bind(["get", "sync", 0], setGraphData);
  return (
    <div>
      <div
        ref={(el) => {
          onMount(() => {
            const instance = new Drawer(el, {
              // @ts-ignore
              template: StaticSideBar,
              height: "100vh",
              maxSize: 200,
              revealMode: "expand",
            });
            createEffect(on(isSideBarOpen, (_) => instance.toggle()));
          });
        }}
      >
        <DashboardView />
      </div>
    </div>
  );
};
