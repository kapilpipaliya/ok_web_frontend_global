/* @refresh reload */
import { render } from "solid-js/web";
import { Router } from "solid-app-router";

import { init_unocss_runtime } from "./css_runtime";
import App from "./app";

init_unocss_runtime();
render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
