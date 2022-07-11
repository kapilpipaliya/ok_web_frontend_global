import { lazy, Match, Switch } from "solid-js";
import type { RouteDefinition } from "solid-app-router";

import { FullDashboard } from "./pages/dashboard";

import SchemaDetail from "./components/core/schemaDetail";
import SchemaTable from "./components/core/schemaTable";
import Page404 from "./errors/404";
export const Routes = () => {
  return (
    <>
      <FullDashboard />
    </>
  );
};
