/* @refresh reload */
import "./base.css";
// Comment This Lines in web build
// import 'devextreme/scss/bundles/dx.light.scss'
import "devextreme/dist/css/dx.light.css";
// import '@spicainternational/sds-devextreme/css/dx.generic.sds-theme.css'
import "./dev_fix.css";
import {config} from "./master.css";

import "uikit/dist/js/uikit";
import "uikit/dist/css/uikit.css";
import {render} from "solid-js/web";
import {createStore} from "solid-js/store";
import {Router} from "@solidjs/router";
import {FullDashboard, showNav} from "./components/Dashboard";
import {ServerEventsDispatcher, WS_PATH, WsContext} from "./utils/ws_events_dispatcher";
import {AlertMessage} from "./types/Type";
import {AlertMessageContext} from "./contexts/AlertMessageContext";

import './solid_blocks_index.css'
import {CSSProvider} from "./css/CSSProvider";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const [alerts, setAlert] = createStore([] as AlertMessage[]);

  return (
    <CSSProvider config={config}>
      <WsContext.Provider value={{Ws}}>
        <AlertMessageContext.Provider value={{alerts, setAlert}}>
        <Router base={showNav() ? "/nav/admin" : "/admin"}>
          <FullDashboard/>
        </Router>
        </AlertMessageContext.Provider>
      </WsContext.Provider>
    </CSSProvider>
  );
}, document.getElementById("root") as HTMLElement);
