/* @refresh reload */
import "./css_runtime";
import { render } from "solid-js/web";
import { Router } from "solid-app-router";
import App from "./app";
// const lang = window.location.pathname.split("/")[1];

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root") as HTMLElement
);
