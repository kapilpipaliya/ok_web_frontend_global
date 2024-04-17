import {MetaProvider} from "@solidjs/meta";
import {A, Route, Router, useMatch, useParams} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import {Component, Show, Suspense} from "solid-js";

import {render, useAssets} from "solid-js/web";

import {StyleRegistry, css, renderSheets, type StyleData} from "solid-styled";
import {CSSRuntimeProvider} from "~/components/css/CSSRuntimeProvider";
import {config} from "~/master.css";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "~/utils/ws_events_dispatcher";
import {AlertMessageContext} from "~/contexts/AlertMessageContext";
import {isAdmin} from "~/signals/common";
import {FullDashboard} from "~/pages/Dashboard";
import {PagePreview, PageView_, RobotsTxt, SiteMap} from "~/pages/PageView";
import {AbstractSingleForm} from "~/components/DynamicForm";
import {AbstractSingleGrid, AllDashboards, TableDashboard} from "~/pages/Grids";
import {PageDesignerDragAndDrop} from "~/components/drag-drop-pages/PageDesignerDragAndDrop";
import {NavDesigner} from "~/pages/FormDesigner";
import {AllForms, SimpleImport} from "~/pages/FormsAdmin";
import {Login, Logout, SignUp} from "~/pages/Forms";
import BackupRestore from "~/pages/BackupRestore";
import {GraphViewPage} from "~/pages/GraphViewPage";
import Page404 from "~/pages/404";
import {LoaderNew} from "~/components/LoaderSimple";
import {Toaster} from "solid-toast";
import {EdgeMap, GraphContext, GraphInterface, Id, VertexMap} from "~/lib/graph";
import {createStore} from "solid-js/store";
import {AlertMessage} from "~/components/ComponentType";
import {syncEvent} from "~/lib/ws_events";
import Counter from "~/components/Counter";

// export default function App() {
//     const sheets: StyleData[] = [];
//     useAssets(() => renderSheets(sheets));
//     const Ws = new ServerEventsDispatcher(WS_PATH);

//
//     window.graph = graph[0];
//     window.setGraph = graph[1];
//     const Sync = () => {
//         syncEvent(graph[0], graph[1]);
//         return <></>;
//     };
//     return (
//         <MetaProvider>asd
//             <GraphContext.Provider value={graph}>
//                 <CSSRuntimeProvider config={config}>
//                     <WsContext.Provider value={Ws}>
//                         <Sync/>

//                     </WsContext.Provider>
//                 </CSSRuntimeProvider>
//             </GraphContext.Provider>
//         </MetaProvider>
//     )
// }


export default function App() {
    const [alerts, setAlert] = createStore([] as AlertMessage[]);

    const graph = createStore<GraphInterface>({
        _isPartialSynced: false,
        vertexes: {} as VertexMap,
        edges: {} as EdgeMap,
        vertexLabelIdMap: {} as { [key: string]: Id[] },
        initialSynced: false, // TODO: Display initialSynced status to the UI
        lastSyncedTime: 0,
        member: {},
    });

    const Sync = () => {
        syncEvent(graph[0], graph[1]);
        return <></>;
    };
    return (
        <Router>
            <GraphContext.Provider value={graph}>
                <MetaProvider>
                    <CSSRuntimeProvider config={config}>
                        {/*<Sync />*/}
                        <AlertMessageContext.Provider value={{alerts, setAlert}}>
                            <Show when={isAdmin()}>
                                <Router
                                    base={"/admin"}
                                    root={FullDashboard}
                                >
                                    <Route
                                        path="/"
                                        component={Counter}
                                    />
                                    {/* TODO: fix when incorrect entity is rendered */}
                                    <Route
                                        path="/:entity/:id"
                                        component={() => {
                                            const params = useParams();
                                            return (
                                                <AbstractSingleForm
                                                    graph={graph[0]}
                                                    formId={params.entity}
                                                    id={params.id}
                                                    // @ts-ignore
                                                    config={{}}
                                                />
                                            );
                                        }}
                                    />
                                    <Route
                                        path="/:entity"
                                        component={() => {
                                            const params = useParams();
                                            return <AbstractSingleGrid tableId={params.entity}/>;
                                        }}
                                    />

                                    <Route
                                        path="/Page/:id"
                                        component={(props) => <PageDesignerDragAndDrop {...props} />}
                                    />
                                    <Route
                                        path="/Nav/new"
                                        component={(props) => <NavDesigner {...props} />}
                                    />
                                    <Route
                                        path="/dashboards"
                                        component={(props) => <AllDashboards {...props} />}
                                    />
                                    <Route
                                        path="/forms"
                                        component={(props) => <AllForms {...props} />}
                                    />
                                    <Route
                                        path="/grid/:name"
                                        component={(props) => <TableDashboard {...props} />}
                                    />
                                    {/* Auth: */}
                                    <Route path="/login" component={Login as Component}/>
                                    <Route path="/logout" component={Logout as Component}/>
                                    <Route path="/signup" component={SignUp as Component}/>
                                    {/* Utils */}
                                    <Route
                                        path="/backup_restore"
                                        component={(props) => <BackupRestore {...props} />}
                                    />
                                    <Route
                                        path="/SimpleImport"
                                        component={(props) => <SimpleImport {...props} />}
                                    />
                                    <Route path="/Graph" component={(props) => <GraphViewPage/>}/>
                                    {/* Error */}
                                    <Route path="/**" component={Page404 as Component}/>
                                </Router>
                            </Show>
                            {/*<Show when={!graph[0].initialSynced}>*/}
                            {/*    <div class="flex jc:center h:75vh w:100vw">*/}
                            {/*        <div class={'align-self:center'}>*/}
                            {/*            <LoaderNew/>*/}
                            {/*        </div>*/}
                            {/*    </div>*/}
                            {/*</Show>*/}
                            {/*<Show when={!isAdmin() && graph[0].initialSynced}>*/}
                            {/*    <Router>*/}
                            {/*        <Route*/}
                            {/*            path="/"*/}
                            {/*            component={() => <PageView_ count={1} id={"home"}/>}*/}
                            {/*        />*/}
                            {/*        <Route path=":id" component={PagePreview as Component}/>*/}
                            {/*        <Route path="robots.txt" component={RobotsTxt as Component}/>*/}
                            {/*        <Route path="sitemap.txt" component={SiteMap as Component}/>*/}
                            {/*    </Router>*/}
                            {/*</Show>*/}
                            {/*<Toaster/>*/}
                          </AlertMessageContext.Provider>
                    </CSSRuntimeProvider>
                </MetaProvider>
            </GraphContext.Provider>
        </Router>
    );
}
