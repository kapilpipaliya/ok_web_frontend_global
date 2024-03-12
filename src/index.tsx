/* @refresh reload */
// css
import './components/solid-blocks/css_var.css'
// import 'components/solid-blocks/index.css'
import "./base.css";
import {config} from "./master.css";
// import "uikit/dist/js/uikit";
// import "uikit/dist/css/uikit.css";
// import './solid_blocks_index.css'
import {CSSRuntimeProvider} from "./components/css/CSSRuntimeProvider";

import {Route, Router, useParams} from "@solidjs/router";
import {createStore} from "solid-js/store";
import {render} from "solid-js/web";
import {FullDashboard} from "./pages/Dashboard";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "./utils/ws_events_dispatcher";

import {Component, Show} from "solid-js";
import {AlertMessage} from "./components/ComponentType";
import {AlertMessageContext} from "./contexts/AlertMessageContext";
import {graph} from "./lib/graph";
import {syncEvent} from "./lib/ws_events";
import {PagePreview, PageView_, RobotsTxt, SiteMap} from "./pages/PageView";

// disable twMerge:
import {defaultConfig} from "tailwind-variants";
import {isAdmin, showNav} from "./signals/common";
import {AbstractSingleGrid, AllDashboards, TableDashboard} from "./pages/Grids";
import {AbstractSingleForm} from "./components/DynamicForm";
import {PageDesignerDragAndDrop} from "./components/PageDesignerDragAndDrop";
import {NavDesigner} from "./pages/FormDesigner";
import {AllForms, SimpleImport} from "./pages/FormsAdmin";
import {Login, Logout, SignUp} from "./pages/Forms";
import Page404 from "./pages/404";
import BackupRestore from "./pages/BackupRestore";
import {GraphViewPage} from "./pages/GraphViewPage";

defaultConfig.twMerge = false;

render(() => {
    const Ws = new ServerEventsDispatcher(WS_PATH);
    const [alerts, setAlert] = createStore([] as AlertMessage[]);
    const Sync = () => {
        syncEvent();
        return <></>;
    };

    return (
        <CSSRuntimeProvider config={config}>
            <WsContext.Provider value={{Ws}}>
                <Sync/>
                <AlertMessageContext.Provider value={{alerts, setAlert}}>
                    <Show when={isAdmin()}>
                        <Router base={showNav() ? "/nav/admin" : "/admin"} root={FullDashboard}>
                            <Route path="/" component={() => <>Home Page</>}/>
                            {/* TODO: fix when incorrect entity is rendered */}
                            <Route
                                path="/:entity"
                                component={() => {
                                    const params = useParams();
                                    return <AbstractSingleGrid tableId={params.entity}/>;
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
                            <Route path="/Page/:id" component={(props) => <PageDesignerDragAndDrop {...props} />}/>
                            <Route path="/Nav/new" component={(props) => <NavDesigner {...props} />}/>
                            <Route path="/dashboards" component={(props) => <AllDashboards {...props} />}/>
                            <Route path="/forms" component={(props) => <AllForms {...props} />}/>
                            <Route path="/grid/:name" component={(props) => <TableDashboard {...props} />}/>
                            {/* Auth: */}
                            <Route path="/login" component={Login as Component}/>
                            <Route path="/logout" component={Logout as Component}/>
                            <Route path="/signup" component={SignUp as Component}/>
                            {/* Utils */}
                            <Route path="/backup_restore" component={(props) => <BackupRestore {...props} />}/>
                            <Route path="/SimpleImport" component={(props) => <SimpleImport {...props} />}/>
                            <Route path="/Graph" component={(props) => <GraphViewPage/>}/>
                            {/* Error */}
                            <Route path="/**" component={Page404 as Component}/>
                        </Router>
                    </Show>

                    <Show when={!isAdmin() && graph.initialSynced}>
                        <Router>
                            <Route path="/" component={() => <PageView_ count={1} id={"home"}/>}/>
                            <Route path=":id" component={PagePreview as Component}/>
                            <Route path="robots.txt" component={RobotsTxt as Component}/>
                            <Route path="sitemap.txt" component={SiteMap as Component}/>
                        </Router>
                    </Show>
                </AlertMessageContext.Provider>
            </WsContext.Provider>
        </CSSRuntimeProvider>
    );
}, document.getElementById("root") as HTMLElement);
