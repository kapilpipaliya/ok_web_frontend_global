/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import { HopeProvider } from '@hope-ui/solid'


import App from "./app";

render(
  () => (


    <HopeProvider>
      <Router>
        <App />
      </Router>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
