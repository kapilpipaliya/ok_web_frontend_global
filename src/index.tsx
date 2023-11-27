/* @refresh reload */
// css
import "./base.css";
// Comment This Lines in web build
// import 'devextreme/scss/bundles/dx.light.scss'
import "devextreme/dist/css/dx.light.css";
// import '@spicainternational/sds-devextreme/css/dx.generic.sds-theme.css'
import "./dev_fix.css";
import {config} from "./master.css";
// import "uikit/dist/js/uikit";
// import "uikit/dist/css/uikit.css";
import './solid_blocks_index.css'
import {CSSProvider} from "./css/CSSProvider";

import {render} from "solid-js/web";
import {createStore} from "solid-js/store";
import {Route, Router, Routes} from "@solidjs/router";
import {FullDashboard, isAdmin, showNav} from "./components/Dashboard";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "./utils/ws_events_dispatcher";

import {AlertMessage} from "./types/Type";
import {AlertMessageContext} from "./contexts/AlertMessageContext";
import {Component, Show} from "solid-js";
import {graph} from "./lib/graph";
import {syncEvent} from "./lib/ws_events";
import {PagePreview, PageView_, RobotsTxt, SiteMap} from "./components/PageView";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const [alerts, setAlert] = createStore([] as AlertMessage[]);
  const Sync = () => {
    syncEvent();
    return <></>
  }

  return (
    <CSSProvider config={config}>
      <WsContext.Provider value={{Ws}}>
        <Sync/>
        <AlertMessageContext.Provider value={{alerts, setAlert}}>

          <Show when={isAdmin()}>
            <Router base={showNav() ? "/nav/admin" : "/admin"}>
              <FullDashboard/>
            </Router>
          </Show>

          <Show when={!isAdmin() && graph.initialSynced}>
            <Router>
              <Routes>
                <Route path="/" component={() => <PageView_ count={1} id={"home"}/>} />
                <Route path=":id" component={PagePreview as Component} />
                <Route path="robots.txt" component={RobotsTxt as Component} />
                <Route path="sitemap.txt" component={SiteMap as Component} />
              </Routes>
            </Router>
          </Show>

        </AlertMessageContext.Provider>
      </WsContext.Provider>
    </CSSProvider>
  );
}, document.getElementById("root") as HTMLElement);
