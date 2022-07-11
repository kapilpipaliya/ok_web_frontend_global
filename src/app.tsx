import type { Component } from "solid-js";
import { Link, useRoutes, useLocation } from "solid-app-router";

import { Routes } from "./routes";

const App: Component = () => {
  return (
    <main>
      <Routes />
    </main>
  );
};

export default App;
