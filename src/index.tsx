/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "solid-app-router";

import { init_uno_css_runtime } from "ok_web_components";
import App from "./app";

init_uno_css_runtime();
render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
