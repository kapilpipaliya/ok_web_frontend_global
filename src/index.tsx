/* @refresh reload */
import { render } from "solid-js/web";
import { DebugProvider } from "./components/core/SolidDebug";
import { FullDashboard } from "./components/Dashboard";
import { Router } from "solid-app-router";
// import 'devextreme/scss/bundles/dx.light.scss'
import "devextreme/dist/css/dx.light.css";
// import '@spicainternational/sds-devextreme/css/dx.generic.sds-theme.css'
import "@master/css";
import "./index.css";

import {
 ServerEventsDispatcher,
 WS_PATH,
 WsContext
} from "./components/ws_events_dispatcher";
import { AlertMessage } from "./Type";
import { AlertMessageContext } from "./appState";
import { createStore } from "solid-js/store";

render(() => {
  const Ws = new ServerEventsDispatcher(WS_PATH);
  const [alerts, setAlert] = createStore([] as AlertMessage[]);

  return <WsContext.Provider value={{ Ws }}>
   <AlertMessageContext.Provider value={{ alerts, setAlert }}>
    <DebugProvider>
     <Router  base={"/admin"}>
      <FullDashboard />
     </Router>
    </DebugProvider>
   </AlertMessageContext.Provider>
  </WsContext.Provider>;
 },
 document.getElementById("root") as HTMLElement);
