//
// import './components/solid-blocks/css_var.css'
// import "./base.css";
// import {config} from "./master.css";
// import {CSSRuntimeProvider} from "./components/css/CSSRuntimeProvider";
//
// import {Route, Router, useParams} from "@solidjs/router";
// import {createStore} from "solid-js/store";
// import {render} from "solid-js/web";
// import {FullDashboard} from "./pages/Dashboard";
// import {ServerEventsDispatcher, WS_PATH, WsContext} from "./utils/ws_events_dispatcher";
//
// import {Component, Show} from "solid-js";
// import {AlertMessage} from "./components/ComponentType";
// import {AlertMessageContext} from "./contexts/AlertMessageContext";
// import {
//     EdgeMap,
//     GraphContext,
//     GraphInterface,
//     Id,
//     VertexMap
// } from "./lib/graph";
// import {syncEvent} from "./lib/ws_events";
// import {PagePreview, PageView_, RobotsTxt, SiteMap} from "./pages/PageView";
// import {isAdmin} from "./signals/common";
// import {AbstractSingleGrid, AllDashboards, TableDashboard} from "./pages/Grids";
// import {AbstractSingleForm} from "./components/DynamicForm";
// import {PageDesignerDragAndDrop} from "./components/drag-drop-pages/PageDesignerDragAndDrop";
// import {NavDesigner} from "./pages/FormDesigner";
// import {AllForms, SimpleImport} from "./pages/FormsAdmin";
// import {Login, Logout, SignUp} from "./pages/Forms";
// import Page404 from "./pages/404";
// import BackupRestore from "./pages/BackupRestore";
// import {GraphViewPage} from "./pages/GraphViewPage";
// import {Toaster} from "solid-toast";
// import {LoaderNew} from "./components/LoaderSimple";
//
// const App = () => {
//     const Ws = new ServerEventsDispatcher(WS_PATH);
//     const [alerts, setAlert] = createStore([] as AlertMessage[]);
//
//     const graph = createStore<GraphInterface>({
//         _isPartialSynced: false,
//         vertexes: {} as VertexMap,
//         edges: {} as EdgeMap,
//         vertexLabelIdMap: {} as { [key: string]: Id[] },
//         initialSynced: false,
//         lastSyncedTime: 0,
//         member: {},
//     });

//     window.graph = graph[0];
//     window.setGraph = graph[1];

//
//     return (

//                     <Sync/>
//                     <AlertMessageContext.Provider value={{alerts, setAlert}}>

//                         <Toaster/>
// //                     </AlertMessageContext.Provider>
//                 </WsContext.Provider>
//             </CSSRuntimeProvider>
//         </GraphContext.Provider>
//     );
// }
//
// render(() => <App/>, document.getElementById("root") as HTMLElement);
