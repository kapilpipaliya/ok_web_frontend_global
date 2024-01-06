
import "./base.css";
import "devextreme/dist/css/dx.light.css";
import "./dev_fix.css";
import { config } from "./master.css";
import { CSSProvider } from "./components/css/CSSProvider";

import { render } from "solid-js/web";
import { createStore } from "solid-js/store";
import { Route, Router, Routes } from "@solidjs/router";
import { FullDashboard, isAdmin, showNav } from "./pages/Dashboard";
import { ServerEventsDispatcher, WS_PATH, WsContext } from "./utils/ws_events_dispatcher";

import { AlertMessageContext } from "./contexts/AlertMessageContext";
import { Component, Show } from "solid-js";
import { graph } from "./lib/graph";
import { syncEvent } from "./lib/ws_events";
import { PagePreview, PageView_, RobotsTxt, SiteMap } from "./pages/PageView";
import { AlertMessage } from "./components/ComponentType";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const [alerts, setAlert] = createStore([] as AlertMessage[]);
  const Sync = () => {
    syncEvent();
    return <></>
  }

  return (
    <CSSProvider config={config}>
      <WsContext.Provider value={{ Ws }}>
        <Sync />
        <AlertMessageContext.Provider value={{ alerts, setAlert }}>

          <Show when={isAdmin()}>
            <Router base={showNav() ? "/nav/admin" : "/admin"}>
              <FullDashboard />
            </Router>
          </Show>

          {/* <Show when={!isAdmin() && graph.initialSynced}>
            <Router>
              <Routes>
                <Route path="/" component={() => <PageView_ count={1} id={"home"} />} />
                <Route path=":id" component={PagePreview as Component} />
                <Route path="robots.txt" component={RobotsTxt as Component} />
                <Route path="sitemap.txt" component={SiteMap as Component} />
              </Routes>
            </Router>
          </Show> */}

        </AlertMessageContext.Provider>
      </WsContext.Provider>
    </CSSProvider>
  );
}, document.getElementById("root") as HTMLElement);
