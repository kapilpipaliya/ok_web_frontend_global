import { For } from "solid-js";
import { Link, Route, Router, Routes } from "solid-app-router";
import { css } from "solid-styled-components";
import { Icon } from "solid-heroicons";
import { clock, home, scale } from "solid-heroicons/outline";
import SchemaDetail from "./core/schemaDetail";
import SchemaTable from "./core/schemaTable";
import Page404 from "./errors/404";
import { CollectionEditor } from "./collection_editor";
import { FormLayoutEditor } from "./fom_layout_editor";
import { useDebugger } from "./core/SolidDebug";
import { graph } from "../db/graph";
import { Menu } from "./core/Menu";

const navigationNew = {
  Dashboard: [
    { name: "Home", href: "/", icon: home, current: true },
    { name: "AttributeTypes", href: "/AttributesType", icon: clock, current: false },
    { name: "Attributes", href: "/Attribute", icon: clock, current: false },
  ],
  "Control Panel": [
    { name: "Collections", href: "/Collection", icon: scale, current: false },
    { name: "Form Layout", href: "/formLayout", icon: scale, current: false },
    { name: "Table Layout", href: "/TableLayout", icon: scale, current: false },
    { name: "Card Layout", href: "/CardLayout", icon: scale, current: false },
  ],
};
const navigation = [
  { name: "Home", href: "/", icon: home, current: true },
  { name: "AttributeTypes", href: "/AttributesType", icon: clock, current: false },
  { name: "Attributes", href: "/Attribute", icon: clock, current: false },
  { name: "Collections", href: "/Collection", icon: scale, current: false },
  { name: "Form Layout", href: "/formLayout", icon: scale, current: false },
  { name: "Table Layout", href: "/TableLayout", icon: scale, current: false },
  { name: "Card Layout", href: "/CardLayout", icon: scale, current: false },
];

export const App = () => {
  const debugGraph = useDebugger("graph");
  debugGraph(graph);

  return (
    <Router>
      <div
        class={css`
          display: grid;
          grid-template-columns: 100px 1fr;
          grid-template-areas: "menu main";
          gap: 10px;
        `}
      >
        <div
          class={css`
            grid-area: menu;
          `}
        >
          <Menu items={navigation} />
        </div>
        <main
          class={css`
            grid-area: main;
          `}
        >
          <Routes>
            <Route path="/" component={() => <>Home</>} />
            <Route path="/collections/:id" component={() => <CollectionEditor />} />
            <Route path="/formLayouts/:id" component={() => <FormLayoutEditor />} />
            <Route path="/:entity" component={() => <SchemaTable />} />
            <Route path="/:entity/:id" component={() => <SchemaDetail />} />
            <Route path="/**" component={() => <Page404 />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};
