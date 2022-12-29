import {
 JSX,
 createSignal,
 For,
 Switch,
 Match,
 Show,
 onMount,
 useContext
} from "solid-js";
import {
 Route,
 Routes,
 useNavigate,
 useParams
} from "solid-app-router";
import { DynamicFormSequence } from "./core/dynamicForm";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { BackupRestore } from "./core/BackupRestore";
import { useDebugger } from "./core/SolidDebug";
import {
 commitTransaction,
 edgeOldIdToNewIdMap,
 graph,
 ProcessStatus,
 transactions,
 vertexOldIdToNewIdMap
} from "../lib/graph";
import { AllForms, SingleForm } from "./Froms";
import { WsContext } from "./ws_events_dispatcher";
import {
 updateVertexId
} from "../lib/Vertex";
import { updateEdgeId } from "../lib/Edge";
import { fetchAttributesTableData } from "./api";
import { G } from "@mobily/ts-belt";

interface NavigationItem {
 name: string;
 href?: string;
 icon?: () => JSX.Element;
 children?: NavigationItem[];
}

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
 { name: "Forms", href: "/forms" }
];

const [isSideBarOpen, setSidebarOpen] = createSignal(true);

// https://sap.github.io/ui5-webcomponents/playground/components/SideNavigation/
// TODO make navigation from https://tailwind-elements.com/docs/standard/navigation/sidenav/#!
// Solid-Blocks Menu: https://github.com/atk/solid-blocks/blob/main/src/blocks/menu.tsx
export const UI5StaticSideBar = () => {
 const navigate = useNavigate();
 const onMenuItemClick = (e: any) => {
  if (e.detail?.item?.href) {
   navigate(e.detail.item.href);
  }
 };

 const Children = (props: { items: NavigationItem[]; }) => {
  return <For each={props.items} fallback={<div>Loading...</div>}>
   {(item) => <ui5-side-navigation-sub-item text={item.name} icon="home"
                                            href={item.href}></ui5-side-navigation-sub-item>}
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
     <Switch fallback={<ui5-side-navigation-item text={item.name} icon="home"
                                                 href={item.href}></ui5-side-navigation-item>}>
      <Match when={item.type === "group"}>
       <ui5-side-navigation-item text={item.name} icon="group">
        <Children items={item.children} />
       </ui5-side-navigation-item>
      </Match>
     </Switch>}
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
  <button type="button" class="border:0 cursor:pointer" onClick={() => {
   setSidebarOpen(v => !v);
  }}>
   <span class="sr-only">Open sidebar</span>
   <span aria-hidden="true">☰</span>
  </button>
 );
};

export const DashboardView = () => {
 return (
  <div class="flex flex:col flex:1" classList={{ "pl:15rem": isSideBarOpen() }}>
   <div class="">
    <MenuButtonToggle />
   </div>
   <main class="">
    <Routes>
     <Route path="/" component={() => <>Home Page</>} />
     <Route path="/:entity" component={() => <SchemaTable />} />
     <Route path="/:entity/:id" component={() => {
      const params = useParams();
      return <DynamicFormSequence
       id={params.id === "new" ? undefined : params.id}
       formMetaData={fetchAttributesTableData(params.entity)} />;
     }} />
     <Route path="/backup_restore" component={() => <BackupRestore />} />
     <Route path="/forms" component={() => <AllForms />} />
     <Route path="/form/:id" component={() => <SingleForm />} />
     <Route path="/**" component={() => <Page404 />} />
    </Routes>
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
     transactions.get(txnId).status = ProcessStatus.AckReceived;
    }
   }
  }
  if (Array.isArray(d)) {
   for (const [txnId, txnResult] of d) {
    transactions.get(txnId).status = ProcessStatus.Processed;
    for (const txnObject of txnResult) {
     if (txnObject.insert) {
      vertexOldIdToNewIdMap.set(`${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
      updateVertexId(`${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     }
     if (txnObject.insertEdge) {
      edgeOldIdToNewIdMap.set(`${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
      updateEdgeId(`${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     }
     if (txnObject.replace) {
      // TODO: handle on backend
      // replaceVertexProperties(0, `${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     }
     if (txnObject.deleteVertex) {
      if(txnObject.deleteVertex.error) {
       alert(txnObject.deleteVertex.message);
      }
      // TODO: handle on backend
      // deleteVertex(0, `${txnObject.insert[0]}`);
     }
     if (txnObject.replaceEdge) {
      // TODO: handle on backend
      // replaceEdgeProperties(0, `${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     }
     // if(txnObject.replaceEdgeStart){
     //  replaceEdgeStart(0, `${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     // }
     // if(txnObject.replaceEdgeEnd){
     //  replaceEdgeEnd(0, `${txnObject.insert[0]}`, `${txnObject.insert[1]}`);
     // }
     if (txnObject.deleteEdge) {
      // TODO: handle on backend
      // deleteEdge(0, `${txnObject.insert[0]}`);
     }
    }
   }
  }
  let allTxnProcessed = true;
  for (const [txnId, value] of transactions.entries()) {
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
 const debugGraph = useDebugger("graph");
 debugGraph(graph);
 return (
  <div class="min-h:full">
   <Show when={isSideBarOpen()}>
    <div class={"w:15rem fixed inset:0"}><UI5StaticSideBar /></div>
   </Show>
   <DashboardView />
  </div>
 );
};
