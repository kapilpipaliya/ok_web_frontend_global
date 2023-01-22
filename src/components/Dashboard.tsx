import {
 createEffect, createMemo,
 createSignal,
 Match, on,
 onCleanup,
 onMount,
 Show, Switch,
 useContext
} from "solid-js";
import { Link, Route, Routes, useNavigate, useParams } from "solid-app-router";
import { DynamicFormSequence } from "./core/dynamicForm";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { BackupRestore } from "./core/BackupRestore";
// import { useDebugger } from "./core/SolidDebug";
import {
 commitTransaction,
 edgeOldIdToNewIdMap,
 graph,
 ProcessStatus,
 transactions,
 vertexOldIdToNewIdMap
} from "../lib/graph";
import {
 AbstractSingleForm,
 AllForms,
 Login,
 Logout,
 SignUp,
 SingleForm
} from "./Froms";
import { WsContext } from "./ws_events_dispatcher";
import { updateVertexId } from "../lib/Vertex";
import { updateEdgeId } from "../lib/Edge";
import { fetchAttributesTableData } from "./api";
import { G } from "@mobily/ts-belt";
// import { AlertMessageContext } from "../appState";
import TreeView from "devextreme/ui/tree_view";
import Drawer from "devextreme/ui/drawer";
import { AbstractSingleGrid, TableDashboard } from "./Grids";

// TODO: Make a Menu Collection and save it in database.
const navigation = [
 { name: "Home", href: "/" },
 {
  name: "Base",
  type: "group",
  children: [
   { name: "FormAttributeTypes", href: "/FormAttributeType" },
   { name: "ServerAttributeTypes", href: "/ServerAttributeType" },
   { name: "Attributes", href: "/Attribute" },
   { name: "Collection Category", href: "/CollectionCategory" },
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
 { name: "Forms", href: "/forms" },
 { name: "Grids", href: "/grids" }
];

const [isSideBarOpen, setSidebarOpen] = createSignal(true);

// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
export const StaticSideBar = () => {
 const navigate = useNavigate();
 return <>
  <div ref={el => {
   const instance = new TreeView(el, {
    dataSource: navigation,
    dataStructure: "tree",
    keyExpr: "href",
    displayExpr: "name",
    itemsExpr: "children",
    onItemClick(e) {
     if (e.itemData?.href) navigate(e.itemData.href);
    }
   });
   onCleanup(() => instance.dispose());
  }}>
  </div>
 </>;
};

export const MenuButtonToggle = () => {
 return (
  <button type="button" class="border:0 cursor:pointer" onClick={() => {
   setSidebarOpen(v => !v);
  }}>
   <span class="sr-only">Open sidebar</span>
   <span aria-hidden="true">☰</span>
  </button>
 );
};

export const DashboardView = () => {
 const { Ws } = useContext(WsContext);
 // const { alerts } = useContext(AlertMessageContext);
 return (
  <div class="flex flex:col flex:1">
   {/*<For each={alerts}>{alert => <ui5-message-strip design={alert.state} hideIcon={alert.hideIcon} hideCloseButton={alert.hideCloseButton} >{alert.message}</ui5-message-strip>}</For>*/}
   <MenuButtonToggle />
   <Show when={Ws.isLoggedIn()} fallback={<>
    <Link href={`/signup`}>Signup</Link>
    <Link href={`/login`}>Login</Link>
   </>}>
    <Link href={`/logout`}>Logout</Link>
   </Show>
   <main class="">
    <Show when={graph.initialSynced}>
     <Routes>
      <Route path="/" component={() => <>Home Page</>} />
      {/* TODO: when incorrect entity is rended*/}
      <Route path="/:entity" component={() => {
       const params = useParams();
       const formMeta = createMemo(()=>fetchAttributesTableData(params.entity));
       return <Switch>
        <Match when={!formMeta()}>
         <AbstractSingleGrid tableId={params.entity}/>
        </Match>
        <Match when={formMeta()}>
         <SchemaTable entity={params.entity}/>
        </Match>
       </Switch>
      }} />
      <Route path="/:entity/:id" component={() => {
       const params = useParams();
       const formMeta = createMemo(()=>fetchAttributesTableData(params.entity));
       return <Switch>
        <Match when={!formMeta() || (params.entity === "TableLayout")}>
         <AbstractSingleForm formId={params.entity} id={params.id === "new" ? undefined : parseInt(params.id)}/>
        </Match>
        <Match when={formMeta()}>
         <DynamicFormSequence
          id={params.id === "new" ? undefined : parseInt(params.id)}
          formMetaData={formMeta()} />
        </Match>
        </Switch>;
      }} />
      <Route path="/backup_restore" component={() => <BackupRestore />} />
      {/* Deprecated */}
      <Route path="/forms" component={() => <AllForms />} />
      {/* Deprecated */}
      <Route path="/form/:id" component={() => <SingleForm />} />
      <Route path="/grids" component={() => <TableDashboard />} />
      <Route path="/login" component={() => <Login />} />
      <Route path="/logout" component={() => <Logout />} />
      <Route path="/signup" component={() => <SignUp />} />
      <Route path="/**" component={() => <Page404 />} />
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
 Ws.bind(["post", "mutate", 0], (d: [number, {
  [key in "insert" | "replace" | "deleteVertex" | "insertEdge" | "replaceEdge" | "replaceEdgeStart" | "replaceEdgeEnd" | "deleteEdge"]?: any;
 }[]][]) => {
  if (G.isObject(d) && d.ack) {
   if (Array.isArray(d.txnIds)) {
    for (const txnId of d.txnIds as number[]) {
     // what if ack is not received?
     if(transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.AckReceived;
    }
   }
  }
  if (Array.isArray(d)) {
   for (const [txnId, txnResult] of d) {
    if(transactions.has(txnId)) transactions.get(txnId)!.status = ProcessStatus.Processed;
    for (const txnObject of txnResult) {
     if (txnObject.insert) {
      vertexOldIdToNewIdMap.set(txnObject.insert[0], txnObject.insert[1]);
      updateVertexId(txnObject.insert[0], txnObject.insert[1]);
     }
     if (txnObject.insertEdge) {
      edgeOldIdToNewIdMap.set(txnObject.insert[0], txnObject.insert[1]);
      updateEdgeId(txnObject.insert[0], txnObject.insert[1]);
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
  } else
   commitTransaction(Ws);
 });
 // const debugGraph = useDebugger("graph");
 // debugGraph(graph);
 return (
  <div>
   <div ref={el => {
    onMount(() => {
     const instance = new Drawer(el, {
      // @ts-ignore
      template: <StaticSideBar />,
      height: "100vh",
      maxSize: 200,
      revealMode: "expand",

     });
     createEffect(on(isSideBarOpen, _ => instance.toggle()));
    });
   }}>
    <DashboardView />
   </div>
  </div>
 );
};
